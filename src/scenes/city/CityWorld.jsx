import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import {
  nodes, edges, rail, RAIL_W, ROAD_W, MAP_EXTENT,
  buildings, trees, STATION,
} from '../../game/mapData'
import { textTexture } from '../shared/textTexture'

// 파스텔 데이라이트 — 지도 레퍼런스 느낌의 스타일라이즈드 도시

function Road({ a, b }) {
  const [ax, az] = a
  const [bx, bz] = b
  const len = Math.hypot(bx - ax, bz - az)
  const angle = Math.atan2(bx - ax, bz - az)
  const cx = (ax + bx) / 2
  const cz = (az + bz) / 2
  const dashes = useMemo(() => {
    const n = Math.floor(len / 7)
    return Array.from({ length: n }, (_, i) => -len / 2 + 3.5 + i * 7)
  }, [len])
  return (
    <group position={[cx, 0, cz]} rotation={[0, angle, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[ROAD_W, len]} />
        <meshLambertMaterial color="#8f99a3" />
      </mesh>
      {dashes.map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, z]}>
          <planeGeometry args={[0.35, 3]} />
          <meshBasicMaterial color="#e8ecef" />
        </mesh>
      ))}
    </group>
  )
}

function Rail() {
  const segs = []
  for (let i = 0; i < rail.length - 1; i++) {
    const [ax, az] = rail[i]
    const [bx, bz] = rail[i + 1]
    const len = Math.hypot(bx - ax, bz - az) + 2
    const angle = Math.atan2(bx - ax, bz - az)
    segs.push({ cx: (ax + bx) / 2, cz: (az + bz) / 2, len, angle, key: i })
  }
  return (
    <group>
      {segs.map((s) => (
        <group key={s.key} position={[s.cx, 0, s.cz]} rotation={[0, s.angle, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
            <planeGeometry args={[RAIL_W, s.len]} />
            <meshLambertMaterial color="#7d858e" />
          </mesh>
          {/* 레일 2줄 */}
          {[-2.2, 2.2].map((off) => (
            <mesh key={off} rotation={[-Math.PI / 2, 0, 0]} position={[off, 0.05, 0]}>
              <planeGeometry args={[0.4, s.len]} />
              <meshBasicMaterial color="#5c636b" />
            </mesh>
          ))}
          {/* 침목 */}
          {Array.from({ length: Math.floor(s.len / 4) }, (_, i) => (
            <mesh key={`t${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, -s.len / 2 + 2 + i * 4]}>
              <planeGeometry args={[6.5, 0.7]} />
              <meshBasicMaterial color="#6b6257" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// 철로를 따라 왕복하는 통근열차
function Train() {
  const ref = useRef()
  const path = useMemo(() => {
    const pts = rail.map(([x, z]) => new THREE.Vector3(x, 0, z))
    return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1)
  }, [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const period = 46
    const raw = (clock.elapsedTime % period) / period
    const t = raw < 0.5 ? raw * 2 : 2 - raw * 2 // 왕복
    const u = 0.03 + t * 0.94
    const p = path.getPointAt(u)
    const tan = path.getTangentAt(u)
    ref.current.position.set(p.x, 0, p.z)
    ref.current.rotation.y = Math.atan2(tan.x, tan.z)
  })
  return (
    <group ref={ref}>
      {[-9, 0, 9].map((z) => (
        <group key={z} position={[0, 1.6, z]}>
          <mesh castShadow>
            <boxGeometry args={[3.4, 3, 8.2]} />
            <meshStandardMaterial color="#f5f6f8" roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[3.45, 1.1, 8.25]} />
            <meshStandardMaterial color="#f2b705" roughness={0.6} />
          </mesh>
          <mesh position={[0, -1.1, 0]}>
            <boxGeometry args={[3.0, 0.8, 7.6]} />
            <meshStandardMaterial color="#4a4f57" roughness={0.8} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Station() {
  const labelTex = useMemo(
    () => textTexture('Strathfield', { fg: '#ffffff', bg: '#e8641b', font: 'bold 54px Arial', w: 512, h: 96 }),
    []
  )
  return (
    <group position={[STATION.x, 0, STATION.z]} rotation={[0, STATION.angle, 0]}>
      {/* 플랫폼 2면 */}
      {[-8.5, 8.5].map((off) => (
        <mesh key={off} position={[off, 0.7, 0]}>
          <boxGeometry args={[4.5, 1.4, 42]} />
          <meshLambertMaterial color="#cfd4d9" />
        </mesh>
      ))}
      {/* 지붕 */}
      {[-8.5, 8.5].map((off) => (
        <group key={`r${off}`}>
          {[-14, 0, 14].map((z) => (
            <mesh key={z} position={[off, 3.4, z]}>
              <boxGeometry args={[0.5, 5.4, 0.5]} />
              <meshLambertMaterial color="#6b7280" />
            </mesh>
          ))}
          <mesh position={[off, 6.3, 0]} rotation={[0, 0, off < 0 ? 0.12 : -0.12]}>
            <boxGeometry args={[6, 0.35, 44]} />
            <meshLambertMaterial color="#e8641b" />
          </mesh>
        </group>
      ))}
      {/* 육교 */}
      <mesh position={[0, 7.5, 0]}>
        <boxGeometry args={[22, 2.6, 5]} />
        <meshLambertMaterial color="#d9dde2" />
      </mesh>
      {/* 역명판 */}
      <mesh position={[0, 10.3, 0]}>
        <planeGeometry args={[16, 3]} />
        <meshBasicMaterial map={labelTex} side={THREE.DoubleSide} transparent />
      </mesh>
    </group>
  )
}

function Buildings({ targetId }) {
  return (
    <group>
      {buildings.map((b) => {
        const isTarget = b.id === targetId
        return (
          <group key={b.id} position={[b.x, 0, b.z]}>
            <mesh position={[0, b.h / 2, 0]}>
              <boxGeometry args={[b.w, b.h, b.d]} />
              <meshLambertMaterial color={isTarget ? '#e8641b' : b.color} />
            </mesh>
            {/* 지붕: 상가는 콘크리트 옥상, 주택은 박공지붕(footprint에 정렬) */}
            <mesh
              position={[0, b.h + (b.commercial ? 0.25 : 1.1), 0]}
              rotation={[0, b.commercial ? 0 : Math.PI / 4, 0]}
            >
              {b.commercial ? (
                <boxGeometry args={[b.w + 0.7, 0.5, b.d + 0.7]} />
              ) : (
                <coneGeometry args={[Math.max(b.w, b.d) * 0.78, 2.4, 4]} />
              )}
              <meshLambertMaterial color={isTarget ? '#b34a10' : b.commercial ? '#c9ccd2' : b.roof} />
            </mesh>
            {/* 상가 옥상 에어컨 실외기 */}
            {b.commercial && (
              <mesh position={[b.w * 0.2, b.h + 1.1, -b.d * 0.15]}>
                <boxGeometry args={[2.2, 1.6, 2.2]} />
                <meshLambertMaterial color="#9aa4ad" />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}

// 목적지 마커 + 주차 베이 (+지도 줌아웃 모드일 때만 빛기둥 하이라이트)
export function TargetMarkers({ target, bay, nearBay, mapView }) {
  const marker = useRef()
  const ring = useRef()
  const beam = useRef()
  const pTex = useMemo(
    () => textTexture('P', { fg: '#ffffff', bg: '#1d4ed8', font: 'bold 92px Arial', w: 128, h: 128 }),
    []
  )
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (marker.current) {
      marker.current.position.y = target.h + 7 + Math.sin(t * 3.2) * 1.1
      marker.current.rotation.y = t * 1.8
      const ms = mapView ? 5 : 1
      marker.current.scale.set(ms, ms, ms)
    }
    if (ring.current) {
      const s = (1 + Math.sin(t * 4) * 0.08) * (mapView ? 5 : 1)
      ring.current.scale.set(s, s, 1)
    }
    if (beam.current) {
      beam.current.material.opacity = 0.28 + Math.sin(t * 5) * 0.12
      beam.current.rotation.y = t * 0.8
    }
  })
  return (
    <group>
      <mesh ref={marker} position={[target.x, target.h + 7, target.z]}>
        <coneGeometry args={[1.8, 3.6, 4]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      {/* 지도 모드: 목적지 빛기둥 */}
      {mapView && (
        <mesh ref={beam} position={[target.x, 80, target.z]}>
          <cylinderGeometry args={[4, 7, 160, 12, 1, true]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.35} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      )}
      <group position={[bay.x, 0, bay.z]}>
        <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
          <ringGeometry args={[3.4, 4.4, 32]} />
          <meshBasicMaterial color={nearBay ? '#22c55e' : '#3b82f6'} transparent opacity={0.9} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <circleGeometry args={[3.4, 32]} />
          <meshBasicMaterial color="#1d4ed8" transparent opacity={nearBay ? 0.65 : 0.4} />
        </mesh>
        <sprite position={[0, 4.5, 0]} scale={[3.2, 3.2, 1]}>
          <spriteMaterial map={pTex} />
        </sprite>
      </group>
    </group>
  )
}

export default function CityWorld({ targetId }) {
  return (
    <group>
      {/* 대지 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <planeGeometry args={[MAP_EXTENT * 2 + 200, MAP_EXTENT * 2 + 200]} />
        <meshLambertMaterial color="#dde5d8" />
      </mesh>
      {edges.map(([a, b], i) => (
        <Road key={i} a={nodes[a]} b={nodes[b]} />
      ))}
      {/* 교차로 원판 */}
      {Object.values(nodes).map(([x, z], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.03, z]}>
          <circleGeometry args={[ROAD_W / 2, 20]} />
          <meshLambertMaterial color="#8f99a3" />
        </mesh>
      ))}
      <Rail />
      <Train />
      <Station />
      <Buildings targetId={targetId} />
      {trees.map((t, i) => (
        <group key={i} position={[t.x, 0, t.z]} scale={t.s}>
          <mesh position={[0, 1, 0]}>
            <cylinderGeometry args={[0.35, 0.45, 2, 6]} />
            <meshLambertMaterial color="#8a6a4a" />
          </mesh>
          <mesh position={[0, 3.2, 0]}>
            <sphereGeometry args={[2, 10, 8]} />
            <meshLambertMaterial color="#7aa864" />
          </mesh>
        </group>
      ))}
    </group>
  )
}
