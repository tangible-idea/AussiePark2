import { useState, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { useGame, MEAL_COST } from '../../game/store'
import CityWorld, { TargetMarkers } from './CityWorld'
import Traffic from './Traffic'
import IbisFlock from './Ibis'
import PlayerBike from './PlayerBike'
import Joystick from '../../ui/Joystick'
import ActionButton from '../../ui/ActionButton'
import StatFloat from '../../ui/StatFloat'

// 탑다운 도시 씬 (R3F Canvas + DOM 오버레이)
// phase=pickup: 가게로 가서 픽업 → phase=dropoff: 고객 건물 앞 주차 베이로
// 목표 밖: 편의점 근처면 밥 버튼, 아니면 지도(줌아웃 + 하이라이트) / 목표 안: 픽업·주차 버튼
export default function CityScene() {
  const [nearObj, setNearObj] = useState(false)
  const [canEat, setCanEat] = useState(false)
  const [mapView, setMapView] = useState(
    () => import.meta.env.DEV && new URLSearchParams(location.search).has('mapview')
  )
  const job = useGame((s) => s.job)
  const phase = useGame((s) => s.phase)
  const shop = useGame((s) => s.shop)
  const target = useGame((s) => s.target)
  const bay = useGame((s) => s.bay)
  const money = useGame((s) => s.money)
  const pickup = useGame((s) => s.pickup)
  const openSignSelect = useGame((s) => s.openSignSelect)
  const eatMeal = useGame((s) => s.eatMeal)

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

  // 액션 버튼 우선순위: 목표(픽업/주차) > 편의점 밥 > 지도
  const showEat = !nearObj && canEat && !mapView
  let icon, label, variant, onClick
  if (nearObj) {
    icon = isPickup ? 'box' : 'park'
    label = isPickup ? '픽업' : '주차'
    variant = 'primary'
    onClick = isPickup ? pickup : openSignSelect
  } else if (showEat) {
    icon = 'food'
    label = money >= MEAL_COST ? `밥 $${MEAL_COST}` : '돈부족'
    variant = 'food'
    onClick = eatMeal
  } else {
    icon = mapView ? 'close' : 'map'
    label = mapView ? '닫기' : '지도'
    variant = 'map'
    onClick = () => setMapView((v) => !v)
  }

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
        <CityWorld
          targetId={focus.id}
          highlightColor={isPickup ? '#14b8a6' : '#e8641b'}
          nearStore={canEat}
        />
        <Traffic />
        <IbisFlock />
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
          onNearStore={setCanEat}
          mapView={mapView}
          hasBag={!isPickup}
        />
      </Canvas>

      <StatFloat />

      {/* 지도(줌아웃) 모드에서는 조이스틱 숨김 + 이동 불가 */}
      {!mapView && <Joystick />}
      <ActionButton icon={icon} label={label} variant={variant} onClick={onClick} />
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
