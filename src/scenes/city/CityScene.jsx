import { useState, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGame } from '../../game/store'
import CityWorld, { TargetMarkers } from './CityWorld'
import Traffic from './Traffic'
import PlayerBike from './PlayerBike'
import Joystick from '../../ui/Joystick'
import ActionButton from '../../ui/ActionButton'

// 탑다운 도시 씬 (R3F Canvas + DOM 오버레이)
// 주차존 밖: 지도 버튼 → 줌아웃 + 목적지 하이라이트 / 주차존 안: 주차 버튼
export default function CityScene() {
  const [canPark, setCanPark] = useState(false)
  const [mapView, setMapView] = useState(
    () => import.meta.env.DEV && new URLSearchParams(location.search).has('mapview')
  )
  const job = useGame((s) => s.job)
  const target = useGame((s) => s.target)
  const bay = useGame((s) => s.bay)
  const openSignSelect = useGame((s) => s.openSignSelect)

  const handleNearBay = useCallback((near) => {
    setCanPark(near)
    if (near) setMapView(false) // 베이 도착하면 지도 자동 닫기
  }, [])

  if (!job || !target || !bay) return null

  return (
    <div className="absolute inset-0">
      <Canvas
        className="absolute inset-0"
        camera={{ fov: 50, near: 1, far: 900, position: [bay.x, 58, bay.z + 22] }}
        dpr={[1, 2]}
        onCreated={(state) => {
          if (import.meta.env.DEV) window.__r3f = state
        }}
      >
        <color attach="background" args={['#c9d6e2']} />
        {!mapView && <fog attach="fog" args={['#c9d6e2', 160, 340]} />}
        <hemisphereLight args={['#eaf2ff', '#b0a890', 0.9]} />
        <directionalLight position={[60, 100, 30]} intensity={1.15} color="#fff2d9" />
        <CityWorld targetId={target.id} />
        <Traffic />
        <TargetMarkers target={target} bay={bay} nearBay={canPark} mapView={mapView} />
        <PlayerBike bay={bay} onNearBay={handleNearBay} mapView={mapView} />
      </Canvas>

      {/* 지도(줌아웃) 모드에서는 조이스틱 숨김 + 이동 불가 */}
      {!mapView && <Joystick />}
      <ActionButton
        icon={canPark ? 'park' : mapView ? 'close' : 'map'}
        label={canPark ? '주차' : mapView ? '닫기' : '지도'}
        variant={canPark ? 'primary' : 'map'}
        onClick={canPark ? openSignSelect : () => setMapView((v) => !v)}
      />
      {mapView && (
        <div className="absolute bottom-40 inset-x-0 flex justify-center pointer-events-none">
          <span className="bg-slate-950/70 border border-amber-400/40 text-amber-300 text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur">
            📍 노란 빛기둥이 목적지 — 파란 점이 내 위치
          </span>
        </div>
      )}
    </div>
  )
}
