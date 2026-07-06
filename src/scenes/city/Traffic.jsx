import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { nodes, neighbors, ROAD_W } from '../../game/mapData'
import Character from '../shared/Character'

// 도로 그래프를 랜덤워크하는 NPC들 (차량 + 보행자)

const nodeIds = Object.keys(nodes)
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

function makeWalker(speed, lateral) {
  const from = pick(nodeIds)
  const to = pick(neighbors[from])
  return { from, to, t: Math.random(), speed, lateral, heading: 0 }
}

function stepWalker(w, dt) {
  const [ax, az] = nodes[w.from]
  const [bx, bz] = nodes[w.to]
  const len = Math.hypot(bx - ax, bz - az)
  w.t += (w.speed * dt) / len
  if (w.t >= 1) {
    const options = neighbors[w.to].filter((n) => n !== w.from)
    const next = options.length ? pick(options) : w.from
    w.from = w.to
    w.to = next
    w.t = 0
  }
  const [nax, naz] = nodes[w.from]
  const [nbx, nbz] = nodes[w.to]
  const dx = nbx - nax
  const dz = nbz - naz
  const nlen = Math.hypot(dx, dz) || 1
  // 진행방향 오른쪽으로 lateral 만큼 offset (차선/인도)
  const ox = (-dz / nlen) * w.lateral
  const oz = (dx / nlen) * w.lateral
  const target = Math.atan2(dx, dz)
  // 부드러운 회전
  let diff = target - w.heading
  while (diff > Math.PI) diff -= Math.PI * 2
  while (diff < -Math.PI) diff += Math.PI * 2
  w.heading += diff * Math.min(1, dt * 6)
  return {
    x: nax + dx * w.t + ox,
    z: naz + dz * w.t + oz,
    heading: w.heading,
  }
}

const CAR_COLORS = ['#e05252', '#4a80d9', '#e8b93e', '#5aa86e', '#c9cdd4', '#8a5ac2', '#37415c']

function Car({ walker, color }) {
  const ref = useRef()
  useFrame((_, dt) => {
    const p = stepWalker(walker, Math.min(dt, 0.1))
    if (!ref.current) return
    ref.current.position.set(p.x, 0, p.z)
    ref.current.rotation.y = p.heading
  })
  return (
    <group ref={ref}>
      {/* 차체 */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[2.2, 0.9, 4.6]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
      </mesh>
      {/* 캐빈 */}
      <mesh position={[0, 1.6, -0.3]}>
        <boxGeometry args={[1.9, 0.75, 2.3]} />
        <meshStandardMaterial color="#bcd3e8" roughness={0.15} metalness={0.3} />
      </mesh>
      {/* 바퀴 */}
      {[[-1, 1.5], [1, 1.5], [-1, -1.5], [1, -1.5]].map(([x, z], i) => (
        <mesh key={i} position={[x * 1.05, 0.45, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.45, 0.45, 0.35, 10]} />
          <meshStandardMaterial color="#23252b" roughness={0.9} />
        </mesh>
      ))}
      {/* 헤드라이트 */}
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.85, 2.32]}>
          <boxGeometry args={[0.4, 0.25, 0.1]} />
          <meshBasicMaterial color="#fff7cc" />
        </mesh>
      ))}
      {/* 그림자 블롭 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <circleGeometry args={[2.2, 16]} />
        <meshBasicMaterial color="#000" transparent opacity={0.15} />
      </mesh>
    </group>
  )
}

const PED_JACKETS = ['#e07070', '#70a8e0', '#e0c070', '#8fc98a', '#c98fc4', '#9aa4b5']
const PED_CAPS = ['#37415c', '#a83232', '#3c8a5e', '#e8e4d8', '#4a4f57']

function Pedestrian({ walker, jacket, cap }) {
  const ref = useRef()
  const speedRef = useRef(1)
  useFrame((_, dt) => {
    const p = stepWalker(walker, Math.min(dt, 0.1))
    if (!ref.current) return
    ref.current.position.set(p.x, 0, p.z)
    ref.current.rotation.y = p.heading
  })
  return (
    <group ref={ref} scale={0.8}>
      <Character jacket={jacket} cap={cap} withBag={false} speedRef={speedRef} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
        <circleGeometry args={[0.9, 12]} />
        <meshBasicMaterial color="#000" transparent opacity={0.15} />
      </mesh>
    </group>
  )
}

export default function Traffic({ carCount = 10, pedCount = 14 }) {
  const cars = useMemo(
    () =>
      Array.from({ length: carCount }, () => ({
        walker: makeWalker(9 + Math.random() * 5, 2.3),
        color: pick(CAR_COLORS),
      })),
    [carCount]
  )
  const peds = useMemo(
    () =>
      Array.from({ length: pedCount }, () => ({
        walker: makeWalker(1.8 + Math.random() * 1.2, (ROAD_W / 2 + 1.5) * (Math.random() < 0.5 ? 1 : -1)),
        jacket: pick(PED_JACKETS),
        cap: pick(PED_CAPS),
      })),
    [pedCount]
  )
  return (
    <group>
      {cars.map((c, i) => (
        <Car key={i} walker={c.walker} color={c.color} />
      ))}
      {peds.map((p, i) => (
        <Pedestrian key={i} walker={p.walker} jacket={p.jacket} cap={p.cap} />
      ))}
    </group>
  )
}
