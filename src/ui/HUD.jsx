import { useState } from 'react'
import { useGame } from '../game/store'
import { formatClock, formatDuration, DAY_NAMES_KO } from '../game/time'
import StatsPanel from './StatsPanel'

const chip =
  'backdrop-blur-md rounded-xl px-3.5 py-2 leading-tight border shadow-lg shadow-black/30'

// 상단 HUD: 날짜/시간/돈 + 스탯 버튼 + (주차 중이면) 남은 주차시간
export default function HUD() {
  const { day, dayIdx, clock, money, deliveries, scene, allowedUntil, job } = useGame()
  const [statsOpen, setStatsOpen] = useState(false)
  const parkingLeft = scene === 'building' && allowedUntil != null ? allowedUntil - clock : null

  return (
    <div className="absolute top-0 inset-x-0 z-40 pointer-events-none font-display">
      <div className="flex items-start justify-between px-4 py-3 text-white">
        <div className="flex items-start gap-2">
          <div className={`${chip} bg-slate-950/70 border-white/15 -skew-x-6`}>
            <div className="skew-x-6">
              <div className="text-[11px] uppercase tracking-widest text-amber-300/90 font-bold">
                Day {day} · {DAY_NAMES_KO[dayIdx]}
              </div>
              <div className="text-2xl font-extrabold tabular-nums tracking-wide">{formatClock(clock)}</div>
            </div>
          </div>
          {/* 스탯(상태창) 버튼 */}
          <button
            onPointerDown={(e) => {
              e.preventDefault()
              setStatsOpen(true)
            }}
            className="pointer-events-auto w-12 h-12 rounded-xl -skew-x-6 bg-slate-950/70 border border-amber-400/40
                       shadow-lg shadow-black/30 backdrop-blur-md flex items-center justify-center
                       text-amber-300 active:scale-90 transition-transform"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6 skew-x-6" fill="none" stroke="currentColor"
                 strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              {/* 사람 + 게이지 */}
              <circle cx="9" cy="7.5" r="3" />
              <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
              <path d="M16.5 6.5h4M16.5 10h4M16.5 13.5h2.5" />
            </svg>
          </button>
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

      {statsOpen && (
        <div className="pointer-events-auto">
          <StatsPanel onClose={() => setStatsOpen(false)} />
        </div>
      )}
    </div>
  )
}
