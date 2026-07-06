const VARIANTS = {
  primary:
    'bg-gradient-to-b from-amber-300 to-amber-500 border-amber-100 text-amber-950 shadow-[0_0_35px_rgba(251,191,36,0.7)] active:scale-90',
  map:
    'bg-gradient-to-b from-sky-400 to-sky-600 border-sky-200 text-sky-950 shadow-[0_0_25px_rgba(56,189,248,0.5)] active:scale-90',
}

// 오른쪽 하단 액션 버튼. label이 없으면 비활성(반투명) 상태로 표시.
export default function ActionButton({ label, icon, onClick, variant = 'primary' }) {
  const active = Boolean(label)
  return (
    <div className="absolute bottom-10 right-8 z-40">
      {active && variant === 'primary' && (
        <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
      )}
      <button
        onPointerDown={(e) => {
          e.preventDefault()
          if (active && onClick) onClick()
        }}
        className={`relative w-24 h-24 rounded-full flex flex-col items-center justify-center
                    touch-none select-none border-4 transition-all font-display font-bold
                    ${active ? VARIANTS[variant] : 'bg-white/10 border-white/20 text-white/40 backdrop-blur-sm'}`}
      >
        <span className="text-3xl leading-none drop-shadow">{icon || '•'}</span>
        <span className="mt-1 leading-tight text-center px-1 text-base tracking-wide">{label || ''}</span>
      </button>
    </div>
  )
}
