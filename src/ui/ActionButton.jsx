const VARIANTS = {
  primary: {
    face: 'bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500 border-amber-100 text-amber-950',
    depth: 'shadow-[0_7px_0_#b45309,0_12px_24px_rgba(251,191,36,0.45)]',
    pressed: 'active:shadow-[0_2px_0_#b45309,0_4px_10px_rgba(251,191,36,0.35)]',
    ring: 'ring-amber-300/50',
  },
  map: {
    face: 'bg-gradient-to-b from-sky-300 via-sky-500 to-sky-600 border-sky-100 text-sky-950',
    depth: 'shadow-[0_7px_0_#0369a1,0_12px_24px_rgba(56,189,248,0.4)]',
    pressed: 'active:shadow-[0_2px_0_#0369a1,0_4px_10px_rgba(56,189,248,0.3)]',
    ring: 'ring-sky-300/50',
  },
  food: {
    face: 'bg-gradient-to-b from-emerald-300 via-emerald-500 to-emerald-600 border-emerald-100 text-emerald-950',
    depth: 'shadow-[0_7px_0_#047857,0_12px_24px_rgba(52,211,153,0.4)]',
    pressed: 'active:shadow-[0_2px_0_#047857,0_4px_10px_rgba(52,211,153,0.3)]',
    ring: 'ring-emerald-300/50',
  },
}

const STROKE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

// 게임풍 라인 아이콘 (이모지 대신 SVG)
const ICONS = {
  park: (
    <g {...STROKE}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <path d="M10 16.5v-9h2.8a2.8 2.8 0 0 1 0 5.6H10" />
    </g>
  ),
  map: (
    <g {...STROKE}>
      <path d="M9 4 3 6.2v13.6L9 17.6l6 2.2 6-2.2V4L15 6.2 9 4Z" />
      <path d="M9 4v13.6M15 6.2v13.6" />
    </g>
  ),
  close: (
    <g {...STROKE}>
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </g>
  ),
  box: (
    <g {...STROKE}>
      <path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z" />
      <path d="M12 12.2 20 8M12 12.2 4 8M12 12.2v8.3" />
    </g>
  ),
  door: (
    <g {...STROKE}>
      <path d="M13.5 4.5H5.5v15h8" />
      <path d="M10.5 12h10M17.5 9l3 3-3 3" />
    </g>
  ),
  food: (
    <g {...STROKE}>
      {/* 포크 + 나이프 */}
      <path d="M7 3v6a2.5 2.5 0 0 0 5 0V3M9.5 3v18" />
      <path d="M16.5 3c-1.7 2.5-2 6-.5 8v10" />
    </g>
  ),
}

// 오른쪽 하단 액션 버튼. label이 없으면 비활성(반투명) 상태로 표시.
// 아케이드 버튼 느낌: 두꺼운 3D 바닥 + 누르면 쑥 들어가는 프레스 + 유리 광택
export default function ActionButton({ label, icon, onClick, variant = 'primary' }) {
  const active = Boolean(label)
  const v = VARIANTS[variant]
  return (
    <div className="absolute bottom-10 right-8 z-40">
      {active && variant === 'primary' && (
        <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
      )}
      <button
        key={active ? `${variant}-${label}` : 'off'}
        onPointerDown={(e) => {
          e.preventDefault()
          if (active && onClick) onClick()
        }}
        className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center
                    touch-none select-none border-4 font-display font-bold overflow-hidden
                    transition-[transform,box-shadow] duration-100 ring-4
                    ${
                      active
                        ? `${v.face} ${v.depth} ${v.pressed} ${v.ring}
                           active:translate-y-1.5 active:scale-95
                           animate-[btn-pop_0.35s_cubic-bezier(0.34,1.56,0.64,1)]`
                        : 'bg-white/10 border-white/20 text-white/40 backdrop-blur-sm ring-transparent shadow-[0_5px_0_rgba(255,255,255,0.08)]'
                    }`}
      >
        {/* 유리 광택 하이라이트 */}
        {active && (
          <span
            className="absolute top-1 inset-x-3 h-9 rounded-full pointer-events-none
                       bg-gradient-to-b from-white/70 to-white/0"
          />
        )}
        <svg
          viewBox="0 0 24 24"
          className={`relative w-9 h-9 drop-shadow ${
            active ? 'animate-[btn-bob_1.6s_ease-in-out_infinite]' : ''
          }`}
        >
          {ICONS[icon] || <circle cx="12" cy="12" r="3" fill="currentColor" />}
        </svg>
        <span className="relative mt-0.5 leading-tight text-center px-1 text-base tracking-wide drop-shadow-sm">
          {label || ''}
        </span>
      </button>
    </div>
  )
}
