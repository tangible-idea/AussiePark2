import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

// 치비 비율의 배달기사 캐릭터. speedRef.current(0~1)에 따라 팔다리를 흔든다.
// riding이면 자전거 탑승 자세(다리 고정, 팔 앞으로).
export default function Character({
  jacket = '#2f80ed',
  cap = '#f2b705',
  pants = '#37415c',
  skin = '#f2c49b',
  withBag = true,
  riding = false,
  speedRef,
  scale = 1,
}) {
  const lArm = useRef()
  const rArm = useRef()
  const lLeg = useRef()
  const rLeg = useRef()
  const body = useRef()

  const phase = useMemo(() => Math.random() * Math.PI * 2, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 9 + phase
    const s = speedRef ? Math.min(1, speedRef.current) : 0
    if (riding) {
      // 페달링: 다리만 작게 원운동
      if (lLeg.current) lLeg.current.rotation.x = -0.9 + Math.sin(t) * 0.35 * s
      if (rLeg.current) rLeg.current.rotation.x = -0.9 + Math.sin(t + Math.PI) * 0.35 * s
      if (lArm.current) lArm.current.rotation.x = -0.85
      if (rArm.current) rArm.current.rotation.x = -0.85
    } else {
      const sw = Math.sin(t) * 0.7 * s
      if (lArm.current) lArm.current.rotation.x = sw
      if (rArm.current) rArm.current.rotation.x = -sw
      if (lLeg.current) lLeg.current.rotation.x = -sw
      if (rLeg.current) rLeg.current.rotation.x = sw
      if (body.current) body.current.position.y = 1.55 + Math.abs(Math.sin(t)) * 0.08 * s
    }
  })

  return (
    <group scale={scale}>
      {/* 몸통 */}
      <group ref={body} position={[0, 1.55, 0]}>
        <mesh castShadow>
          <capsuleGeometry args={[0.62, 0.85, 6, 12]} />
          <meshStandardMaterial color={jacket} roughness={0.8} />
        </mesh>
        {/* 조끼 라인 */}
        <mesh position={[0, 0.15, 0.45]}>
          <boxGeometry args={[0.5, 0.75, 0.35]} />
          <meshStandardMaterial color="#f4f7fa" roughness={0.9} />
        </mesh>
        {/* 머리 */}
        <group position={[0, 1.35, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.72, 20, 16]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>
          {/* 캡모자 */}
          <mesh position={[0, 0.32, 0]}>
            <sphereGeometry args={[0.68, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
            <meshStandardMaterial color={cap} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.28, 0.62]} rotation={[0.15, 0, 0]}>
            <cylinderGeometry args={[0.42, 0.42, 0.08, 12, 1, false, -Math.PI / 2, Math.PI]} />
            <meshStandardMaterial color={cap} roughness={0.8} />
          </mesh>
          {/* 눈 */}
          <mesh position={[-0.22, 0.05, 0.62]}>
            <sphereGeometry args={[0.075, 8, 8]} />
            <meshStandardMaterial color="#22222c" />
          </mesh>
          <mesh position={[0.22, 0.05, 0.62]}>
            <sphereGeometry args={[0.075, 8, 8]} />
            <meshStandardMaterial color="#22222c" />
          </mesh>
        </group>
        {/* 팔 (어깨 피벗) */}
        <group ref={lArm} position={[-0.72, 0.42, 0]}>
          <mesh position={[0, -0.42, 0]} castShadow>
            <capsuleGeometry args={[0.19, 0.62, 4, 8]} />
            <meshStandardMaterial color={jacket} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.85, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>
        </group>
        <group ref={rArm} position={[0.72, 0.42, 0]}>
          <mesh position={[0, -0.42, 0]} castShadow>
            <capsuleGeometry args={[0.19, 0.62, 4, 8]} />
            <meshStandardMaterial color={jacket} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.85, 0]}>
            <sphereGeometry args={[0.2, 8, 8]} />
            <meshStandardMaterial color={skin} roughness={0.7} />
          </mesh>
        </group>
        {/* 배달가방 */}
        {withBag && (
          <mesh position={[0, 0.25, -0.72]} castShadow>
            <boxGeometry args={[0.95, 0.95, 0.55]} />
            <meshStandardMaterial color="#1db954" roughness={0.6} />
          </mesh>
        )}
      </group>
      {/* 다리 (골반 피벗) */}
      <group ref={lLeg} position={[-0.28, 1.05, 0]}>
        <mesh position={[0, -0.45, 0]} castShadow>
          <capsuleGeometry args={[0.22, 0.6, 4, 8]} />
          <meshStandardMaterial color={pants} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.82, 0.08]}>
          <boxGeometry args={[0.3, 0.2, 0.5]} />
          <meshStandardMaterial color="#f4f7fa" roughness={0.9} />
        </mesh>
      </group>
      <group ref={rLeg} position={[0.28, 1.05, 0]}>
        <mesh position={[0, -0.45, 0]} castShadow>
          <capsuleGeometry args={[0.22, 0.6, 4, 8]} />
          <meshStandardMaterial color={pants} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.82, 0.08]}>
          <boxGeometry args={[0.3, 0.2, 0.5]} />
          <meshStandardMaterial color="#f4f7fa" roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

// 전기자전거 (+z가 전방). speedRef로 바퀴 회전.
export function EBike({ speedRef, color = '#12b76a' }) {
  const fWheel = useRef()
  const rWheel = useRef()
  useFrame((_, dt) => {
    const s = speedRef ? speedRef.current : 0
    const w = s * 14 * dt
    if (fWheel.current) fWheel.current.rotation.x += w
    if (rWheel.current) rWheel.current.rotation.x += w
  })
  // 바퀴는 YZ 평면(진행방향과 나란히) — x축 회전으로 굴러간다
  const wheel = (ref, z) => (
    <group ref={ref} position={[0, 0.62, z]}>
      <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[0.62, 0.14, 8, 20]} />
        <meshStandardMaterial color="#23252b" roughness={0.9} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.08, 12]} />
        <meshStandardMaterial color="#8a919c" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* 스포크 — 구르는 게 보이도록 */}
      <mesh>
        <boxGeometry args={[0.05, 1.1, 0.08]} />
        <meshStandardMaterial color="#c8ced6" roughness={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.05, 0.08, 1.1]} />
        <meshStandardMaterial color="#c8ced6" roughness={0.5} />
      </mesh>
    </group>
  )
  return (
    <group>
      {wheel(fWheel, 1.25)}
      {wheel(rWheel, -1.25)}
      {/* 프레임 */}
      <mesh position={[0, 0.95, 0]} rotation={[0.35, 0, 0]} castShadow>
        <boxGeometry args={[0.16, 0.16, 2.3]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.25, -0.55]}>
        <boxGeometry args={[0.14, 0.7, 0.14]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* 안장 */}
      <mesh position={[0, 1.68, -0.55]}>
        <boxGeometry args={[0.42, 0.14, 0.7]} />
        <meshStandardMaterial color="#23252b" roughness={0.9} />
      </mesh>
      {/* 핸들바 */}
      <mesh position={[0, 1.35, 1.05]}>
        <boxGeometry args={[0.14, 0.85, 0.14]} />
        <meshStandardMaterial color="#8a919c" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.8, 1.05]}>
        <boxGeometry args={[1.05, 0.13, 0.13]} />
        <meshStandardMaterial color="#23252b" roughness={0.9} />
      </mesh>
      {/* 배터리 */}
      <mesh position={[0, 0.78, -0.15]}>
        <boxGeometry args={[0.22, 0.35, 1.1]} />
        <meshStandardMaterial color="#37415c" roughness={0.6} />
      </mesh>
    </group>
  )
}
