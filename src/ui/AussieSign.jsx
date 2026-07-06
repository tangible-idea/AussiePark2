import { formatSignTime } from '../game/time'

// public/signs/1000026986.png 스타일의 호주 주차 표지판 렌더러
// 흰 바탕, 진녹색 텍스트, "2P / 9AM-3:30PM / MON-FRI / 화살표"
const GREEN = '#1a7a3d'

function TimePart({ min }) {
  const t = formatSignTime(min)
  return (
    <span className="inline-flex items-baseline leading-none">
      <span className="text-2xl font-extrabold">{t.hour}</span>
      {t.minute && <span className="text-xs font-bold ml-px">{t.minute}</span>}
      <span className="text-[9px] font-bold ml-px">{t.ampm}</span>
    </span>
  )
}

export default function AussieSign({ sign, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="bg-white rounded-xl border-4 px-3 py-3 flex flex-col items-center gap-1 shadow-xl
                 active:scale-95 transition-transform w-full disabled:opacity-60"
      style={{ borderColor: GREEN, color: GREEN, fontFamily: "'Arial Narrow', Arial, sans-serif" }}
    >
      <span className="text-5xl font-extrabold leading-none tracking-tight">{sign.pHours}P</span>
      {sign.ticket && <span className="text-lg font-extrabold tracking-widest leading-none">TICKET</span>}
      <div className="flex items-center gap-1 mt-1">
        <TimePart min={sign.start} />
        <span className="text-xl font-extrabold leading-none">-</span>
        <TimePart min={sign.end} />
      </div>
      <span className="text-sm font-extrabold tracking-widest">{sign.daysLabel}</span>
      <svg width="70" height="16" viewBox="0 0 70 16" className="mt-1">
        <line x1="8" y1="8" x2="62" y2="8" stroke={GREEN} strokeWidth="4" />
        <polygon points="0,8 12,2 12,14" fill={GREEN} />
        <polygon points="70,8 58,2 58,14" fill={GREEN} />
      </svg>
    </button>
  )
}
