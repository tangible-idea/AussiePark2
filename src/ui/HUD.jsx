import { useGame } from '../game/store'
import { formatClock, formatDuration, DAY_NAMES_KO } from '../game/time'

const chip =
  'backdrop-blur-md rounded-xl px-3.5 py-2 leading-tight border shadow-lg shadow-black/30'

// 상단 HUD: 날짜/시간/돈 + (주차 중이면) 남은 주차시간
export default function HUD() {
  const { day, dayIdx, clock, money, deliveries, scene, allowedUntil, job } = useGame()
  const parkingLeft = scene === 'building' && allowedUntil != null ? allowedUntil - clock : null

  return (
    <div className="absolute top-0 inset-x-0 z-40 pointer-events-none font-display">
      <div className="flex items-start justify-between px-4 py-3 text-white">
        <div className={`${chip} bg-slate-950/70 border-white/15 -skew-x-6`}>
          <div className="skew-x-6">
            <div className="text-[11px] uppercase tracking-widest text-amber-300/90 font-bold">
              Day {day} · {DAY_NAMES_KO[dayIdx]}
            </div>
            <div className="text-2xl font-extrabold tabular-nums tracking-wide">{formatClock(clock)}</div>
          </div>
        </div>
        <div className={`${chip} bg-slate-950/70 border-white/15 skew-x-6 text-right`}>
          <div className="-skew-x-6">
            <div className={`text-2xl font-extrabold tabular-nums ${money < 30 ? 'text-red-400' : 'text-emerald-300'}`}>
              ${money}
            </div>
            <div className="text-[11px] uppercase tracking-widest text-white/60 font-bold">배달 {deliveries}건</div>
          </div>
        </div>
      </div>

      {job && scene === 'city' && (
        <div className="flex justify-center">
          <div className="bg-slate-950/70 border border-amber-400/40 backdrop-blur-md rounded-full px-5 py-1.5 text-sm text-white shadow-lg shadow-black/30">
            📦 {job.street} <span className="font-extrabold text-amber-300">{job.unit}호</span>
            <span className="text-emerald-300 font-bold ml-2">${job.pay}</span>
          </div>
        </div>
      )}

      {parkingLeft != null && (
        <div className="flex justify-center">
          <div
            className={`rounded-full px-5 py-1.5 text-sm font-extrabold backdrop-blur-md border shadow-lg shadow-black/30 ${
              parkingLeft <= 0
                ? 'bg-red-600/90 border-red-300/50 text-white animate-pulse'
                : parkingLeft < 15
                  ? 'bg-orange-500/90 border-orange-200/50 text-white'
                  : 'bg-slate-950/70 border-emerald-400/40 text-emerald-300'
            }`}
          >
            {parkingLeft <= 0
              ? '⚠️ 주차시간 초과! 벌금 확정'
              : `🅿️ 남은 주차시간 ${formatDuration(parkingLeft)}`}
          </div>
        </div>
      )}
    </div>
  )
}
