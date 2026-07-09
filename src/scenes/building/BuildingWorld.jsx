import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../../game/store'
import { MINUTES_PER_SECOND } from '../../game/time'
import Character from '../shared/Character'
import { textTexture } from '../shared/textTexture'

// 커터웨이 아파트: 1층 로비 + 2~4층 복도가 한 화면에 다 보이고,
// 실제 계단을 밟고 물리적으로 오르내린다.
// 이동은 지그재그 경로(폴리라인) 위 1차원 파라미터 s로 관리:
// 로비 → 오른쪽 계단 ↗ 2층(우→좌) → 왼쪽 계단 ↗ 3층(좌→우) → 오른쪽 계단 ↗ 4층

export const FLOOR_H = 8
export const BLD_W = 64
const WALK_SPEED = 13
const EXIT_X = 4

// 경로 폴리라인 [x, y]
const PATH = [
  [3, 0], [52, 0],      // 로비
  [63, FLOOR_H],        // 계단 (우)
  [11, FLOOR_H],        // 2층 복도
  [1, FLOOR_H * 2],     // 계단 (좌)
  [53, FLOOR_H * 2],    // 3층 복도
  [63, FLOOR_H * 3],    // 계단 (우)
  [8, FLOOR_H * 3],     // 4층 복도
]

const segs = []
{
  let acc = 0
  for (let i = 0; i < PATH.length - 1; i++) {
    const [ax, ay] = PATH[i]
    const [bx, by] = PATH[i + 1]
    const len = Math.hypot(bx - ax, by - ay)
    segs.push({ ax, ay, bx, by, len, start: acc, dirX: Math.sign(bx - ax), stair: by !== ay })
    acc += len
  }
}
const PATH_LEN = segs[segs.length - 1].start + segs[segs.length - 1].len

function pointAt(s) {
  const c = Math.max(0, Math.min(PATH_LEN - 0.001, s))
  const seg = segs.find((g) => c >= g.start && c < g.start + g.len) || segs[segs.length - 1]
  const t = (c - seg.start) / seg.len
  return {
    x: seg.ax + (seg.bx - seg.ax) * t,
    y: seg.ay + (seg.by - seg.ay) * t,
    dirX: seg.dirX,
    stair: seg.stair,
  }
}

const doorX = (k) => 16 + k * 6.8 // k: 0..5
const WALL_COLORS = ['#cfd8cd', '#d8cfd0', '#cdd3d8'] // 2,3,4층 벽지
const UNITS = 6

function Stairs({ from, to, label }) {
  // from/to: [x, y] — 계단 스텝 박스들 (밝은 나무색으로 눈에 띄게)
  const steps = 9
  const items = []
  for (let i = 0; i < steps; i++) {
    const t = (i + 0.5) / steps
    const x = from[0] + (to[0] - from[0]) * t
    const y = from[1] + (to[1] - from[1]) * t
    items.push(
      <mesh key={i} position={[x, y - 0.25, 0.8]}>
        <boxGeometry args={[Math.abs(to[0] - from[0]) / steps + 0.5, 0.5, 3.4]} />
        <meshStandardMaterial color="#d9b370" roughness={0.85} />
      </mesh>
    )
  }
  const cx = (from[0] + to[0]) / 2
  const cy = (from[1] + to[1]) / 2
  const len = Math.hypot(to[0] - from[0], to[1] - from[1])
  const ang = Math.atan2(to[1] - from[1], to[0] - from[0])
  const labelTex = textTexture(label, {
    fg: '#1f2937', bg: '#fbbf24', font: 'bold 56px Arial', w: 192, h: 80,
  })
  return (
    <group>
      {items}
      {/* 난간 */}
      <mesh position={[cx, cy + 1.1, 2.5]} rotation={[0, 0, ang]}>
        <boxGeometry args={[len, 0.18, 0.18]} />
        <meshStandardMaterial color="#6b7280" roughness={0.6} />
      </mesh>
      {/* 계단 표지판 */}
      <sprite position={[cx, cy + 3.6, 1]} scale={[4.6, 1.9, 1]}>
        <spriteMaterial map={labelTex} />
      </sprite>
    </group>
  )
}

function Door({ x, y, unit, isTarget, delivered }) {
  const plate = useMemo(
    () => textTexture(String(unit), { fg: '#2b2f38', bg: '#e8ecef', font: 'bold 60px Arial', w: 128, h: 64 }),
    [unit]
  )
  const mark = useRef()
  useFrame(({ clock }) => {
    if (mark.current) mark.current.position.y = y + 5.6 + Math.sin(clock.elapsedTime * 4) * 0.25
  })
  return (
    <group position={[x, y, -2.1]}>
      <mesh position={[0, 1.9, 0]}>
        <boxGeometry args={[2.5, 3.8, 0.35]} />
        <meshStandardMaterial
          color={isTarget && !delivered ? '#e8641b' : '#8a7a68'}
          emissive={isTarget && !delivered ? '#7a2e00' : '#000000'}
          roughness={0.8}
        />
      </mesh>
      <mesh position={[0.85, 1.85, 0.22]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color="#e8c547" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* 호수판 */}
      <mesh position={[0, 4.35, 0.05]}>
        <planeGeometry args={[1.7, 0.85]} />
        <meshBasicMaterial map={plate} />
      </mesh>
      {isTarget && !delivered && (
        <mesh ref={mark} position={[0, 5.6, 0]}>
          <coneGeometry args={[0.55, 1.2, 4]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      )}
    </group>
  )
}

function Shell({ targetFloorY }) {
  const floorLabel = (n) =>
    textTexture(`${n}F`, { fg: '#5a6472', font: 'bold 72px Arial', w: 128, h: 128 })
  return (
    <group>
      {/* 뒷벽 (층별 벽지) */}
      {[1, 2, 3].map((i) => (
        <mesh key={i} position={[BLD_W / 2, FLOOR_H * i + FLOOR_H / 2, -2.6]}>
          <planeGeometry args={[BLD_W + 4, FLOOR_H]} />
          <meshStandardMaterial color={WALL_COLORS[i - 1]} roughness={1} />
        </mesh>
      ))}
      {/* 로비 뒷벽 */}
      <mesh position={[BLD_W / 2, FLOOR_H / 2, -2.6]}>
        <planeGeometry args={[BLD_W + 4, FLOOR_H]} />
        <meshStandardMaterial color="#c6b8a4" roughness={1} />
      </mesh>
      {/* 슬래브 */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[BLD_W / 2, FLOOR_H * i - 0.45, 0]}>
          <boxGeometry args={[BLD_W + 4, 0.9, 7]} />
          <meshStandardMaterial color="#9aa4ad" roughness={0.9} />
        </mesh>
      ))}
      {/* 층 표시 + 벽 램프 */}
      {[1, 2, 3].map((i) => (
        <group key={`f${i}`}>
          <mesh position={[BLD_W - 3, FLOOR_H * i + 5.2, -2.5]}>
            <planeGeometry args={[2.2, 2.2]} />
            <meshBasicMaterial map={floorLabel(i + 1)} transparent />
          </mesh>
          {[12, 30, 48].map((x) => (
            <mesh key={x} position={[x - 3.2, FLOOR_H * i + 5.4, -2.4]}>
              <sphereGeometry args={[0.28, 8, 8]} />
              <meshBasicMaterial color="#ffe9b0" />
            </mesh>
          ))}
        </group>
      ))}
      {/* 측벽 + 지붕 */}
      <mesh position={[-2.6, FLOOR_H * 2, 0]}>
        <boxGeometry args={[1.2, FLOOR_H * 4 + 1, 7]} />
        <meshStandardMaterial color="#8d99ae" roughness={0.9} />
      </mesh>
      <mesh position={[BLD_W + 2.6, FLOOR_H * 2, 0]}>
        <boxGeometry args={[1.2, FLOOR_H * 4 + 1, 7]} />
        <meshStandardMaterial color="#8d99ae" roughness={0.9} />
      </mesh>
      <mesh position={[BLD_W / 2, FLOOR_H * 4 + 0.4, 0]}>
        <boxGeometry args={[BLD_W + 7, 1.4, 8.5]} />
        <meshStandardMaterial color="#5e6b7a" roughness={0.9} />
      </mesh>
      {/* 로비: 출구문 + 우편함 + 화분 */}
      <group position={[EXIT_X, 0, -2.1]}>
        <mesh position={[0, 2.1, 0]}>
          <boxGeometry args={[3, 4.2, 0.4]} />
          <meshStandardMaterial color="#3c8a5e" roughness={0.7} />
        </mesh>
        <mesh position={[0, 4.8, 0.1]}>
          <planeGeometry args={[2.6, 0.9]} />
          <meshBasicMaterial map={textTexture('EXIT', { fg: '#ffffff', bg: '#1a7a3d', font: 'bold 52px Arial', w: 256, h: 96 })} />
        </mesh>
      </group>
      <mesh position={[14, 1.5, -2]}>
        <boxGeometry args={[6, 3, 0.8]} />
        <meshStandardMaterial color="#8a919c" metalness={0.4} roughness={0.5} />
      </mesh>
      {[24, 40].map((x) => (
        <group key={x} position={[x, 0, -1.4]}>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.55, 0.4, 1.2, 8]} />
            <meshStandardMaterial color="#a8543c" roughness={0.9} />
          </mesh>
          <mesh position={[0, 1.8, 0]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#6f9c5c" roughness={1} />
          </mesh>
        </group>
      ))}
      {/* 계단 3개 */}
      <Stairs from={[52, 0]} to={[63, FLOOR_H]} label="↑ 2F" />
      <Stairs from={[11, FLOOR_H]} to={[1, FLOOR_H * 2]} label="↑ 3F" />
      <Stairs from={[53, FLOOR_H * 2]} to={[63, FLOOR_H * 3]} label="↑ 4F" />
      {/* 목적지 층 은은한 하이라이트 */}
      {targetFloorY != null && (
        <mesh position={[BLD_W / 2, targetFloorY + FLOOR_H / 2, -2.55]}>
          <planeGeometry args={[BLD_W + 4, FLOOR_H]} />
          <meshBasicMaterial color="#ffb35c" transparent opacity={0.08} />
        </mesh>
      )}
    </group>
  )
}

// 층별 계단 중간점: STAIR_MID[f] = f층 → f+1층 계단의 중앙 [x, y]
const STAIR_MID = [
  [57.5, FLOOR_H / 2],
  [6, FLOOR_H * 1.5],
  [58, FLOOR_H * 2.5],
]

export default function BuildingWorld({ delivered, onAction, onFloor }) {
  const job = useGame((s) => s.job)
  const sRef = useRef(2)               // 경로 파라미터
  const facing = useRef(1)
  const speedRef = useRef(0)
  const lastAction = useRef(null)
  const lastFloor = useRef(0)
  const player = useRef()
  const guide = useRef()
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)

  const targetUnitIdx = (job.unit % 100) - 1
  const targetFloorY = (job.floor - 1) * FLOOR_H

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const state = useGame.getState()
    if (state.scene !== 'building') return
    state.tick(dt * MINUTES_PER_SECOND)

    const jx = state.joystick.x
    const p0 = pointAt(sRef.current)
    if (Math.abs(jx) > 0.15) {
      // 세그먼트가 왼쪽으로 향하든 오른쪽으로 향하든, 오른쪽 입력 = 화면 오른쪽 이동
      sRef.current = Math.max(0, Math.min(PATH_LEN, sRef.current + jx * p0.dirX * WALK_SPEED * dt * (p0.stair ? 0.72 : 1)))
      facing.current = jx > 0 ? 1 : -1
      speedRef.current = Math.min(1, Math.abs(jx))
    } else {
      speedRef.current = 0
    }

    const p = pointAt(sRef.current)
    if (player.current) {
      player.current.position.set(p.x, p.y, 0.8)
      player.current.rotation.y = (Math.PI / 2) * facing.current - facing.current * 0.35
    }

    // 가능한 액션 판정
    const onFloorNow = !p.stair
    const floorIdx = Math.round(p.y / FLOOR_H) // 0=로비
    let action = null
    if (onFloorNow) {
      if (!delivered && floorIdx === job.floor - 1 && Math.abs(p.x - doorX(targetUnitIdx)) < 2.6) action = 'deliver'
      else if (delivered && floorIdx === 0 && Math.abs(p.x - EXIT_X) < 3) action = 'exit'
    }
    if (action !== lastAction.current) {
      lastAction.current = action
      onAction(action)
    }
    if (onFloorNow && floorIdx !== lastFloor.current) {
      lastFloor.current = floorIdx
      if (onFloor) onFloor(floorIdx)
    }

    // 다음에 가야 할 계단/출구 위 화살표 안내
    if (guide.current) {
      const targetFloor = job.floor - 1
      let gp = null
      let down = false
      if (!delivered) {
        if (floorIdx < targetFloor) gp = STAIR_MID[floorIdx]
        else if (floorIdx > targetFloor) {
          gp = STAIR_MID[floorIdx - 1]
          down = true
        }
      } else if (floorIdx > 0) {
        gp = STAIR_MID[floorIdx - 1]
        down = true
      } else {
        gp = [EXIT_X, 0]
        down = true
      }
      guide.current.visible = Boolean(gp) && onFloorNow
      if (gp) {
        guide.current.position.set(gp[0], gp[1] + 6.2 + Math.sin(performance.now() / 220) * 0.4, 1)
        guide.current.rotation.z = down ? Math.PI : 0 // 콘 기본 = 위쪽
      }
    }

    // 카메라: 화면 비율 기준으로 플레이어를 놓치지 않게 팔로우 (좁은 화면은 뒤로 빠짐)
    const aspect = size.width / size.height
    const halfTan = Math.tan(THREE.MathUtils.degToRad(23)) // fov 46의 절반
    const camZ = Math.max(46, 17 / (halfTan * Math.max(aspect, 0.3)))
    const halfW = halfTan * camZ * aspect
    const lo = halfW - 5
    const hi = BLD_W - halfW + 5
    const camX = lo > hi ? BLD_W / 2 : THREE.MathUtils.clamp(p.x, lo, hi)
    camera.position.lerp(new THREE.Vector3(camX, FLOOR_H * 2 - 1, camZ), Math.min(1, dt * 4))
    camera.lookAt(camX, FLOOR_H * 2 - 1.5, 0)
  })

  return (
    <group>
      <Shell targetFloorY={delivered ? null : targetFloorY} />
      {/* 문: 2~4층 */}
      {[1, 2, 3].map((f) =>
        Array.from({ length: UNITS }, (_, k) => (
          <Door
            key={`${f}-${k}`}
            x={doorX(k)}
            y={f * FLOOR_H}
            unit={(f + 1) * 100 + k + 1}
            isTarget={f === job.floor - 1 && k === targetUnitIdx}
            delivered={delivered}
          />
        ))
      )}
      {/* 플레이어 */}
      <group ref={player}>
        <Character speedRef={speedRef} withBag={!delivered} scale={0.92} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <circleGeometry args={[0.85, 12]} />
          <meshBasicMaterial color="#000" transparent opacity={0.2} />
        </mesh>
      </group>
      {/* 길안내 화살표 (다음 계단/출구) */}
      <mesh ref={guide}>
        <coneGeometry args={[0.9, 1.8, 4]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
    </group>
  )
}
