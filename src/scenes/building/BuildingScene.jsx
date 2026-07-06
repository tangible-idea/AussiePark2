import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGame } from '../../game/store'
import BuildingWorld, { FLOOR_H } from './BuildingWorld'
import Joystick from '../../ui/Joystick'
import ActionButton from '../../ui/ActionButton'

// 건물 내부 씬: 커터웨이 뷰 + DOM 오버레이
export default function BuildingScene() {
  const [delivered, setDelivered] = useState(false)
  const [action, setAction] = useState(null) // 'deliver' | 'exit' | null
  const job = useGame((s) => s.job)
  const exitBuilding = useGame((s) => s.exitBuilding)

  if (!job) return null

  const doAction = () => {
    if (action === 'deliver') {
      setDelivered(true)
      setAction(null)
    } else if (action === 'exit') {
      exitBuilding()
    }
  }

  return (
    <div className="absolute inset-0">
      <Canvas
        className="absolute inset-0"
        camera={{ fov: 46, near: 0.5, far: 200, position: [32, FLOOR_H * 2 - 1, 46] }}
        dpr={[1, 2]}
        onCreated={(state) => {
          if (import.meta.env.DEV) window.__r3f = state
        }}
      >
        <color attach="background" args={['#8fa3b8']} />
        <hemisphereLight args={['#f0ede4', '#8a8378', 0.85]} />
        <directionalLight position={[20, 50, 40]} intensity={0.9} color="#fff2d9" />
        <BuildingWorld delivered={delivered} onAction={setAction} />
      </Canvas>

      {/* 목적지 안내 */}
      <div className="absolute top-20 inset-x-0 flex justify-center z-20 pointer-events-none">
        <div className="bg-black/50 backdrop-blur text-white px-4 py-1.5 rounded-full text-sm">
          목적지 <b className="text-amber-300">{job.unit}호 ({job.floor}층)</b>
          {delivered && <span className="text-emerald-300 ml-2">✓ 배달완료 — 1층 EXIT로!</span>}
        </div>
      </div>

      <Joystick />
      <ActionButton
        icon={action === 'deliver' ? '📦' : '🚪'}
        label={action === 'deliver' ? '배달하기' : action === 'exit' ? '나가기' : null}
        onClick={doAction}
      />
    </div>
  )
}
