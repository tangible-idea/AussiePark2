import { useGame } from '../game/store'

// 스탯 변화 플로팅 텍스트: 캐릭터(화면 중앙) 옆에서 +45 포만감 처럼 떠오르며 사라진다.
// store.statFx의 id가 바뀔 때마다 다시 재생.
export default function StatFloat() {
  const fx = useGame((s) => s.statFx)
  if (!fx) return null
  return (
    <div
      key={fx.id}
      className="absolute left-1/2 top-[42%] z-40 pointer-events-none flex flex-col items-start gap-0.5 pl-10"
    >
      {fx.items.map((it, i) => (
        <div
          key={i}
          className="opacity-0 animate-[float-up_1.5s_ease-out_forwards] font-display font-extrabold
                     text-xl tracking-wide drop-shadow-[0_2px_3px_rgba(0,0,0,0.7)] whitespace-nowrap"
          style={{ color: it.color, animationDelay: `${i * 160}ms` }}
        >
          {it.delta != null ? `${it.delta > 0 ? '+' : ''}${it.delta} ${it.label}` : it.label}
        </div>
      ))}
    </div>
  )
}
