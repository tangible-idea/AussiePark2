import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { registerBody, bodies } from '../../game/physics'
import { buildings } from '../../game/mapData'

// 호주 명물 아이비스(빈치킨). 쓰레기통 근처를 어슬렁거리며 땅을 쪼다가
// 플레이어/차가 다가오면 파닥이며 도망간다. 부딪히면 튕겨나감(physics.hit).

const WALK_SPEED = 1.6
const FLEE_DIST = 5

// 어슬렁거릴 앵커 지점 (광장/편의점/역 주변 공터)
const ANCHORS = [
  [-62, -32], [-82, 58], [20, -36], [-140, 145], [118, -8], [-40, 120],
]

function IbisBird({ spawn }) {
  const g = useRef()
  const neckRef = useRef()
  const legL = useRef()
  const legR = useRef()
  const s = useRef({
    x: spawn[0],
    z: spawn[1],
    heading: Math.random() * Math.PI * 2,
    mode: 'walk', // walk | idle | peck | knock
    timer: 1 + Math.random() * 2,
    vx: 0,
    vz: 0,
    air: 0,
    step: Math.random() * 10,
  }).current

  const body = useMemo(
    () => ({
      kind: 'ibis',
      r: 0.7,
      x: s.x,
      z: s.z,
      hit: (nx, nz, f) => {
        s.mode = 'knock'
        s.vx = nx * f
        s.vz = nz * f
        s.air = 0
      },
    }),
    [s]
  )
  useEffect(() => registerBody(body), [body])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1)

    // 위협(플레이어/차) 접근 → 반대쪽으로 파닥 도망
    if (s.mode !== 'knock') {
      for (const b of bodies) {
        if (b.kind !== 'player' && b.kind !== 'car') continue
        const dx = s.x - b.x
        const dz = s.z - b.z
        const d = Math.hypot(dx, dz)
        if (d < FLEE_DIST) {
          body.hit(dx / (d || 1), dz / (d || 1), 7 + Math.random() * 3)
          break
        }
      }
    }

    if (s.mode === 'knock') {
      s.air += dt
      s.x += s.vx * dt
      s.z += s.vz * dt
      const k = Math.exp(-dt * 1.8)
      s.vx *= k
      s.vz *= k
      s.heading = Math.atan2(s.vx, s.vz)
      if (Math.hypot(s.vx, s.vz) < 0.5) {
        s.mode = 'walk'
        s.timer = 1 + Math.random() * 2
      }
    } else {
      s.timer -= dt
      if (s.timer <= 0) {
        s.mode = s.mode === 'walk' ? (Math.random() < 0.6 ? 'peck' : 'idle') : 'walk'
        s.timer = s.mode === 'walk' ? 2 + Math.random() * 3 : 1 + Math.random() * 1.5
        if (s.mode === 'walk') s.heading += (Math.random() - 0.5) * 2.5
      }
      if (s.mode === 'walk') {
        const nx = s.x + Math.sin(s.heading) * WALK_SPEED * dt
        const nz = s.z + Math.cos(s.heading) * WALK_SPEED * dt
        const blocked = buildings.some(
          (b) => Math.abs(nx - b.x) < b.w / 2 + 0.6 && Math.abs(nz - b.z) < b.d / 2 + 0.6
        )
        if (blocked) s.heading += Math.PI / 2
        else {
          s.x = nx
          s.z = nz
        }
        s.step += dt * 7
      }
    }

    body.x = s.x
    body.z = s.z
    if (!g.current) return
    // 넉백 중엔 포물선으로 살짝 떠오르며 파닥
    const hop = s.mode === 'knock' ? Math.max(0, Math.sin(Math.min(s.air * 4, Math.PI))) * 1.2 : 0
    g.current.position.set(s.x, hop, s.z)
    g.current.rotation.y = s.heading
    g.current.rotation.z = s.mode === 'knock' ? Math.sin(s.air * 22) * 0.35 : 0
    if (neckRef.current) {
      const target = s.mode === 'peck' ? 1.15 : 0.2
      neckRef.current.rotation.x = THREE.MathUtils.lerp(neckRef.current.rotation.x, target, dt * 6)
    }
    const swing = s.mode === 'walk' ? 0.6 : 0
    if (legL.current) legL.current.rotation.x = Math.sin(s.step) * swing
    if (legR.current) legR.current.rotation.x = Math.sin(s.step + Math.PI) * swing
  })

  return (
    <group ref={g}>
      {/* 다리 */}
      {[legL, legR].map((ref, i) => (
        <group key={i} ref={ref} position={[i ? 0.12 : -0.12, 0.5, 0]}>
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.025, 0.03, 0.5, 5]} />
            <meshLambertMaterial color="#2b2b30" />
          </mesh>
        </group>
      ))}
      {/* 몸통 (꾀죄죄한 흰색) */}
      <mesh position={[0, 0.62, -0.05]} scale={[1, 0.85, 1.35]}>
        <sphereGeometry args={[0.34, 12, 10]} />
        <meshLambertMaterial color="#eae6da" />
      </mesh>
      {/* 검은 꽁지깃 */}
      <mesh position={[0, 0.66, -0.5]} rotation={[Math.PI / 2.6, 0, 0]}>
        <coneGeometry args={[0.13, 0.4, 8]} />
        <meshLambertMaterial color="#26262a" />
      </mesh>
      {/* 목+머리+부리 (쪼기 피벗) */}
      <group ref={neckRef} position={[0, 0.78, 0.3]}>
        <mesh position={[0, 0.17, 0.08]} rotation={[0.45, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.08, 0.45, 8]} />
          <meshLambertMaterial color="#d9d4c6" />
        </mesh>
        <group position={[0, 0.36, 0.2]}>
          {/* 대머리 검은 머리 */}
          <mesh>
            <sphereGeometry args={[0.11, 10, 8]} />
            <meshLambertMaterial color="#26262a" />
          </mesh>
          {/* 길고 굽은 부리 (두 마디) */}
          <mesh position={[0, -0.06, 0.2]} rotation={[Math.PI / 2 + 0.3, 0, 0]}>
            <coneGeometry args={[0.035, 0.34, 6]} />
            <meshLambertMaterial color="#26262a" />
          </mesh>
          <mesh position={[0, -0.18, 0.36]} rotation={[Math.PI / 2 + 0.75, 0, 0]}>
            <coneGeometry args={[0.022, 0.26, 6]} />
            <meshLambertMaterial color="#26262a" />
          </mesh>
        </group>
      </group>
      {/* 그림자 블롭 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.45, 10]} />
        <meshBasicMaterial color="#000" transparent opacity={0.15} />
      </mesh>
    </group>
  )
}

export default function IbisFlock({ perAnchor = 2 }) {
  const spawns = useMemo(
    () =>
      ANCHORS.flatMap(([x, z]) =>
        Array.from({ length: perAnchor }, () => [
          x + (Math.random() - 0.5) * 8,
          z + (Math.random() - 0.5) * 8,
        ])
      ),
    [perAnchor]
  )
  return (
    <group>
      {spawns.map((sp, i) => (
        <IbisBird key={i} spawn={sp} />
      ))}
    </group>
  )
}
