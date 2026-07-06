import { useGame } from '../game/store'

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

// 스탯 정의. bad=높을수록 위험 / lowBad=낮을수록 위험 (게이지가 경고색으로)
const STATS = [
  {
    key: 'fullness',
    name: '포만감',
    lowBad: true,
    bar: 'from-orange-400 to-amber-400',
    text: 'text-orange-300',
    desc: '일할수록 허기진다 — 편의점에서 밥을 먹으면 차오른다',
    icon: (
      <g {...STROKE}>
        {/* 포크 */}
        <path d="M7 3v6a2.5 2.5 0 0 0 5 0V3M9.5 3v18M9.5 3v6" />
        {/* 나이프 */}
        <path d="M16.5 3c-1.7 2.5-2 6-.5 8v10" />
      </g>
    ),
  },
  {
    key: 'loneliness',
    name: '외로움',
    bad: true,
    bar: 'from-violet-400 to-fuchsia-500',
    text: 'text-violet-300',
    desc: '타지의 밤은 길다 — 배달로 사람을 만나면 조금 풀린다',
    icon: (
      <g {...STROKE}>
        {/* 금 간 하트 */}
        <path d="M12 20 4.8 13A4.6 4.6 0 0 1 11 6.4l1 1 1-1A4.6 4.6 0 0 1 19.2 13L12 20Z" />
        <path d="M12 7.4 10.5 11l3 1.5-1.5 3.5" />
      </g>
    ),
  },
  {
    key: 'english',
    name: '영어스킬',
    bar: 'from-sky-400 to-blue-500',
    text: 'text-sky-300',
    desc: '손님과 부딪히며 배운다 — 배달 완료마다 성장',
    icon: (
      <g {...STROKE}>
        {/* 말풍선 + A */}
        <path d="M4 5.5h16v11H10l-4 3.5v-3.5H4v-11Z" />
        <path d="M9.5 13.5 12 7.5l2.5 6M10.4 11.5h3.2" />
      </g>
    ),
  },
  {
    key: 'strength',
    name: '힘',
    bar: 'from-emerald-400 to-green-500',
    text: 'text-emerald-300',
    desc: '박스를 들고 계단을 오르내리며 단련된다',
    icon: (
      <g {...STROKE}>
        {/* 덤벨 */}
        <path d="M2.5 12h2M19.5 12h2M8.5 12h7" />
        <rect x="4.5" y="8" width="3" height="8" rx="1" />
        <rect x="16.5" y="8" width="3" height="8" rx="1" />
      </g>
    ),
  },
]

function StatRow({ def, value, index }) {
  const v = Math.round(value)
  const danger = def.lowBad ? v <= 25 : def.bad && v >= 75
  return (
    <div
      className="opacity-0 animate-[stat-in_0.35s_ease-out_forwards]"
      style={{ animationDelay: `${120 + index * 90}ms` }}
    >
      <div className="flex items-center gap-3">
        <svg viewBox="0 0 24 24" className={`w-7 h-7 shrink-0 ${def.text}`}>
          {def.icon}
        </svg>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between">
            <span className="font-display font-bold text-white tracking-wide">{def.name}</span>
            <span
              className={`font-display font-extrabold tabular-nums text-lg ${
                danger ? 'text-red-400 animate-pulse' : def.text
              }`}
            >
              {v}
              <span className="text-white/40 text-xs font-bold"> / 100</span>
            </span>
          </div>
          {/* 게이지 */}
          <div className="mt-1 h-3 rounded-full bg-white/10 border border-white/15 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${def.bar} transition-[width] duration-700 ease-out
                          ${danger ? 'animate-pulse' : ''}`}
              style={{ width: `${v}%` }}
            />
          </div>
          <div className="mt-0.5 text-[11px] text-white/45 leading-tight truncate">{def.desc}</div>
        </div>
      </div>
    </div>
  )
}

// 게임풍 상태창: 워홀 생존 스탯 4종을 게이지로 표시
export default function StatsPanel({ onClose }) {
  const stats = useGame((s) => s.stats)
  const day = useGame((s) => s.day)
  const deliveries = useGame((s) => s.deliveries)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm"
      onPointerDown={onClose}
    >
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="w-[min(92vw,380px)] rounded-2xl border-2 border-amber-400/40 bg-slate-900/95
                   shadow-[0_0_60px_rgba(251,191,36,0.15),0_20px_50px_rgba(0,0,0,0.6)]
                   animate-[btn-pop_0.3s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden"
      >
        {/* 헤더 */}
        <div className="relative px-5 py-3 bg-gradient-to-r from-amber-500/20 to-transparent border-b border-white/10">
          <div className="font-display font-extrabold text-xl text-amber-300 tracking-widest uppercase">
            Status
          </div>
          <div className="text-[11px] text-white/50 font-bold">
            워홀 {day}일차 · 누적 배달 {deliveries}건
          </div>
          <button
            onPointerDown={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 border border-white/20
                       text-white/70 flex items-center justify-center active:scale-90 transition-transform"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <g {...STROKE} strokeWidth={2.6}>
                <path d="M7 7l10 10M17 7 7 17" />
              </g>
            </svg>
          </button>
        </div>

        {/* 스탯 목록 */}
        <div className="px-5 py-4 space-y-4">
          {STATS.map((def, i) => (
            <StatRow key={def.key} def={def} value={stats[def.key]} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
