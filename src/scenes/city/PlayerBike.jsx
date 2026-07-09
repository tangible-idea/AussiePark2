import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useGame } from '../../game/store'
import { MINUTES_PER_SECOND } from '../../game/time'
import { buildings, MAP_EXTENT, SPAWN, STORE_BAY } from '../../game/mapData'
import { registerBody, forEachHit } from '../../game/physics'
import Character, { EBike } from '../shared/Character'

const SPEED = 17
const EAT_DIST = 5
const PLAYER_R = 1.3

const hitWall = (x, z) =>
  buildings.some(
    (b) => Math.abs(x - b.x) < b.w / 2 + PLAYER_R && Math.abs(z - b.z) < b.d / 2 + PLAYER_R
  )

// 조이스틱 주행 + 카메라 팔로우 + 목표 지점(픽업 가게/주차 베이) & 편의점 근접 판정
// mapView면 플레이어~목표가 다 보이게 줌아웃
export default function PlayerBike({ objective, onNear, onNearStore, mapView, hasBag }) {
  const group = useRef()
  // 테스트용: ?spawnbay 이면 목표 지점 옆에서 시작
  const atBay = import.meta.env.DEV && new URLSearchParams(location.search).has('spawnbay')
  const pos = useRef(new THREE.Vector3(atBay ? objective.x : SPAWN.x, 0, atBay ? objective.z : SPAWN.z))
  const heading = useRef(0)
  const lean = useRef(0)
  const lookAt = useRef(new THREE.Vector3(SPAWN.x, 0, SPAWN.z))
  const speedRef = useRef(0)
  const wasNear = useRef(false)
  const wasNearStore = useRef(false)
  const camera = useThree((s) => s.camera)
  // 아케이드 충돌: 원 콜라이더 + 넉백 속도
  const body = useRef({ kind: 'player', r: PLAYER_R, x: pos.current.x, z: pos.current.z }).current
  const knockback = useRef({ x: 0, z: 0 })
  useEffect(() => registerBody(body), [body])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)
    const state = useGame.getState()
    if (state.scene === 'city') {
      state.tick(dt * MINUTES_PER_SECOND)

      // 지도 모드에서는 이동 잠금
      const { x: jx, y: jy } = mapView ? { x: 0, y: 0 } : state.joystick
      const mag = Math.min(1, Math.hypot(jx, jy))
      speedRef.current = mag
      if (mag > 0.15) {
        const p = pos.current
        const nx = p.x + jx * SPEED * dt
        const nz = p.z + jy * SPEED * dt
        // 건물 충돌: 축 분리로 벽 따라 미끄러지기
        if (!hitWall(nx, p.z)) p.x = nx
        if (!hitWall(p.x, nz)) p.z = nz
        p.x = THREE.MathUtils.clamp(p.x, -MAP_EXTENT, MAP_EXTENT)
        p.z = THREE.MathUtils.clamp(p.z, -MAP_EXTENT, MAP_EXTENT)

        const target = Math.atan2(jx, jy)
        let diff = target - heading.current
        while (diff > Math.PI) diff -= Math.PI * 2
        while (diff < -Math.PI) diff += Math.PI * 2
        heading.current += diff * Math.min(1, dt * 8)
        lean.current = THREE.MathUtils.lerp(lean.current, THREE.MathUtils.clamp(-diff * 1.2, -0.35, 0.35), dt * 6)
      } else {
        lean.current = THREE.MathUtils.lerp(lean.current, 0, dt * 6)
      }

      // 목표 근접 판정 (픽업 가게 or 주차 베이)
      const near = Math.hypot(pos.current.x - objective.x, pos.current.z - objective.z) < objective.r
      if (near !== wasNear.current) {
        wasNear.current = near
        onNear(near)
      }
      // 편의점 앞 식사 지점 판정
      const nearStore =
        Math.hypot(pos.current.x - STORE_BAY.x, pos.current.z - STORE_BAY.z) < EAT_DIST
      if (nearStore !== wasNearStore.current) {
        wasNearStore.current = nearStore
        onNearStore?.(nearStore)
      }

      // ── 아케이드 충돌 반응 ──
      const p = pos.current
      body.x = p.x
      body.z = p.z
      forEachHit(body, (b, nx, nz, overlap) => {
        if (b.kind === 'car') {
          // 차에 받히면 크게 튕겨나감
          knockback.current.x += nx * 13
          knockback.current.z += nz * 13
        } else if (b.kind === 'ped') {
          // 보행자와는 서로 가볍게 밀침
          knockback.current.x += nx * 2.5
          knockback.current.z += nz * 2.5
          b.hit?.(-nx, -nz, 4)
        } else if (b.kind === 'ibis') {
          // 새는 파닥이며 튕겨나가고 나는 거의 안 흔들림
          b.hit?.(-nx, -nz, 10)
        }
        // 겹침 해소 (벽 뚫기 방지)
        if (b.kind !== 'ibis') {
          const sx = nx * overlap
          const sz = nz * overlap
          if (!hitWall(p.x + sx, p.z)) p.x += sx
          if (!hitWall(p.x, p.z + sz)) p.z += sz
        }
      })
      // 넉백 적용 + 감쇠
      const kb = knockback.current
      if (Math.hypot(kb.x, kb.z) > 0.05) {
        const kx = kb.x * dt
        const kz = kb.z * dt
        if (!hitWall(p.x + kx, p.z)) p.x += kx
        if (!hitWall(p.x, p.z + kz)) p.z += kz
        p.x = THREE.MathUtils.clamp(p.x, -MAP_EXTENT, MAP_EXTENT)
        p.z = THREE.MathUtils.clamp(p.z, -MAP_EXTENT, MAP_EXTENT)
        const k = Math.exp(-dt * 2.5)
        kb.x *= k
        kb.z *= k
      } else {
        kb.x = 0
        kb.z = 0
      }
    } else {
      speedRef.current = 0
    }

    if (group.current) {
      group.current.position.copy(pos.current)
      group.current.rotation.y = heading.current
      group.current.rotation.z = lean.current
    }

    // 카메라: 평소엔 GTA2식 팔로우, 지도 모드엔 플레이어~목표 전체가 보이게 줌아웃
    const p = pos.current
    if (mapView) {
      const midX = (p.x + objective.x) / 2
      const midZ = (p.z + objective.z) / 2
      const span = Math.max(Math.abs(p.x - objective.x), Math.abs(p.z - objective.z)) + 120
      const camY = Math.min(480, span * 1.15)
      camera.position.lerp(new THREE.Vector3(midX, camY, midZ + span * 0.18), Math.min(1, dt * 3.5))
      lookAt.current.lerp(new THREE.Vector3(midX, 0, midZ), Math.min(1, dt * 3.5))
    } else {
      camera.position.lerp(new THREE.Vector3(p.x, 58, p.z + 22), Math.min(1, dt * 5))
      lookAt.current.lerp(new THREE.Vector3(p.x, 0, p.z), Math.min(1, dt * 5))
    }
    camera.lookAt(lookAt.current)
  })

  return (
    <group ref={group}>
      <EBike speedRef={speedRef} />
      <group position={[0, 1.1, -0.45]}>
        <Character riding speedRef={speedRef} scale={0.95} withBag={hasBag} />
      </group>
      {/* 그림자 블롭 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
        <circleGeometry args={[1.6, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.18} />
      </mesh>
      {/* 지도 모드: 내 위치 파란 점 + 빛기둥 */}
      {mapView && (
        <group>
          <mesh position={[0, 40, 0]}>
            <cylinderGeometry args={[2.5, 4, 80, 12, 1, true]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <mesh position={[0, 6, 0]}>
            <sphereGeometry args={[3, 16, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      )}
    </group>
  )
}
