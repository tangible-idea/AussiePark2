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
  const [floor, setFloor] = useState(0)      // 0=로비
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
        <BuildingWorld delivered={delivered} onAction={setAction} onFloor={setFloor} />
      </Canvas>

      {/* 목적지 안내 */}
      <div className="absolute top-44 inset-x-0 flex flex-col items-center gap-1.5 z-20 pointer-events-none">
        <div className="bg-black/50 backdrop-blur text-white px-4 py-1.5 rounded-full text-sm">
          목적지 <b className="text-amber-300">{job.unit}호 ({job.floor}층)</b>
          {delivered && <span className="text-emerald-300 ml-2">✓ 배달완료 — 1층 EXIT로!</span>}
        </div>
        {!delivered && floor + 1 < job.floor && (
          <div className="bg-amber-400/90 text-amber-950 px-3 py-1 rounded-full text-xs font-bold">
            ⬆ 복도 끝 계단으로 올라가세요 (현재 {floor === 0 ? '로비' : `${floor + 1}층`})
          </div>
        )}
        {delivered && floor > 0 && (
          <div className="bg-emerald-400/90 text-emerald-950 px-3 py-1 rounded-full text-xs font-bold">
            ⬇ 계단으로 내려가서 EXIT로
          </div>
        )}
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
