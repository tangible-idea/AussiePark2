import { useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGame } from '../../game/store'
import CityWorld, { TargetMarkers } from './CityWorld'
import Traffic from './Traffic'
import PlayerBike from './PlayerBike'
import Joystick from '../../ui/Joystick'
import ActionButton from '../../ui/ActionButton'

// 탑다운 도시 씬 (R3F Canvas + DOM 오버레이)
// phase=pickup: 가게로 가서 픽업 → phase=dropoff: 고객 건물 앞 주차 베이로
// 목표 지점 밖: 지도 버튼(줌아웃 + 하이라이트) / 안: 픽업·주차 버튼
export default function CityScene() {
  const [nearObj, setNearObj] = useState(false)
  const [mapView, setMapView] = useState(
    () => import.meta.env.DEV && new URLSearchParams(location.search).has('mapview')
  )
  const job = useGame((s) => s.job)
  const phase = useGame((s) => s.phase)
  const shop = useGame((s) => s.shop)
  const target = useGame((s) => s.target)
  const bay = useGame((s) => s.bay)
  const pickup = useGame((s) => s.pickup)
  const openSignSelect = useGame((s) => s.openSignSelect)

  const handleNear = useCallback((near) => {
    setNearObj(near)
    if (near) setMapView(false) // 목표 도착하면 지도 자동 닫기
  }, [])

  // 픽업 → 배달 전환 시 지도 잠깐 열어 다음 목적지를 보여준다
  useEffect(() => {
    if (phase === 'dropoff') {
      setMapView(true)
      const t = setTimeout(() => setMapView(false), 2600)
      return () => clearTimeout(t)
    }
  }, [phase])

  if (!job || !target || !bay || !shop) return null

  const isPickup = phase === 'pickup'
  const focus = isPickup ? shop : target
  const objective = isPickup
    ? { x: shop.x, z: shop.z, r: Math.max(shop.w, shop.d) / 2 + 7 }
    : { x: bay.x, z: bay.z, r: 5.5 }

  return (
    <div className="absolute inset-0">
      <Canvas
        className="absolute inset-0"
        camera={{ fov: 50, near: 1, far: 900, position: [shop.x, 58, shop.z + 22] }}
        dpr={[1, 2]}
        onCreated={(state) => {
          if (import.meta.env.DEV) window.__r3f = state
        }}
      >
        <color attach="background" args={['#c9d6e2']} />
        {!mapView && <fog attach="fog" args={['#c9d6e2', 160, 340]} />}
        <hemisphereLight args={['#eaf2ff', '#b0a890', 0.9]} />
        <directionalLight position={[60, 100, 30]} intensity={1.15} color="#fff2d9" />
        <CityWorld targetId={focus.id} highlightColor={isPickup ? '#14b8a6' : '#e8641b'} />
        <Traffic />
        <TargetMarkers
          focus={focus}
          bay={isPickup ? null : bay}
          nearBay={nearObj}
          mapView={mapView}
          color={isPickup ? '#2dd4bf' : '#fbbf24'}
        />
        <PlayerBike
          objective={objective}
          onNear={handleNear}
          mapView={mapView}
          hasBag={!isPickup}
        />
      </Canvas>

      <Joystick />
      <ActionButton
        icon={nearObj ? (isPickup ? '🍜' : '🅿️') : mapView ? '↩️' : '🗺️'}
        label={nearObj ? (isPickup ? '픽업' : '주차') : mapView ? '닫기' : '지도'}
        variant={nearObj ? 'primary' : 'map'}
        onClick={nearObj ? (isPickup ? pickup : openSignSelect) : () => setMapView((v) => !v)}
      />
      {mapView && (
        <div className="absolute bottom-40 inset-x-0 flex justify-center pointer-events-none">
          <span className="bg-slate-950/70 border border-amber-400/40 text-amber-300 text-xs font-bold px-4 py-1.5 rounded-full backdrop-blur">
            {isPickup ? '🍜 청록 빛기둥 = 픽업 가게' : '📍 노란 빛기둥 = 배달 목적지'} · 파란 점이 내 위치
          </span>
        </div>
      )}
    </div>
  )
}
