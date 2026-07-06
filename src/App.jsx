import { useGame } from './game/store'
import CityScene from './scenes/city/CityScene'
import BuildingScene from './scenes/building/BuildingScene'
import HUD from './ui/HUD'
import SignSelect from './ui/SignSelect'
import JobCards from './ui/JobCards'
import { ResultModal, DayEndModal, GameOverModal } from './ui/Modals'

// 워홀 배달기사 생존 로그라이크
// cards → city(탑다운 주행) → signSelect(주차표지판 3택) → building(횡스크롤 배달)
// → result(수입/벌금) → cards → ... 밤 10시가 되면 dayEnd, 파산하면 gameover
export default function App() {
  const scene = useGame((s) => s.scene)

  return (
    <div className="fixed inset-0 bg-slate-950 overflow-hidden select-none">
      {(scene === 'city' || scene === 'signSelect') && <CityScene />}
      {scene === 'building' && <BuildingScene />}

      {scene !== 'gameover' && <HUD />}

      {scene === 'signSelect' && <SignSelect />}
      {scene === 'cards' && <JobCards />}
      {scene === 'result' && <ResultModal />}
      {scene === 'dayEnd' && <DayEndModal />}
      {scene === 'gameover' && <GameOverModal />}
    </div>
  )
}
