import { useGame, FINE_AMOUNT, DAILY_COST } from '../game/store'
import { formatDuration, DAY_NAMES_KO } from '../game/time'

// 배달 결과 (수입 or 벌금)
export function ResultModal() {
  const { result, dismissResult } = useGame()
  if (!result) return null
  const fined = result.type === 'fine'

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm text-center text-white">
        {fined ? (
          <>
            <div className="text-5xl mb-3">🎫</div>
            <h2 className="text-xl font-bold text-red-400 mb-2">주차 위반 딱지!</h2>
            <p className="text-white/70 text-sm mb-4">
              주차 시간을 <b className="text-red-300">{formatDuration(result.overMinutes)}</b> 초과했습니다.
            </p>
            <div className="bg-black/40 rounded-xl p-3 text-sm space-y-1 mb-5">
              <div className="flex justify-between"><span>배달비</span><span className="text-emerald-300">+${result.pay}</span></div>
              <div className="flex justify-between"><span>벌금</span><span className="text-red-400">−${FINE_AMOUNT}</span></div>
            </div>
          </>
        ) : (
          <>
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-xl font-bold text-emerald-300 mb-2">배달 완료!</h2>
            <div className="text-3xl font-extrabold text-emerald-300 mb-5">+${result.amount}</div>
          </>
        )}
        <button
          onClick={dismissResult}
          className="w-full bg-amber-400 text-amber-950 font-bold rounded-xl py-3 active:scale-95 transition-transform"
        >
          다음 배달 보기
        </button>
      </div>
    </div>
  )
}

// 하루 종료 정산
export function DayEndModal() {
  const { day, dayIdx, money, nextDay } = useGame()
  return (
    <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm text-center text-white">
        <div className="text-5xl mb-3">🌙</div>
        <h2 className="text-xl font-bold mb-2">Day {day} ({DAY_NAMES_KO[dayIdx]}) 종료</h2>
        <div className="bg-black/40 rounded-xl p-3 text-sm space-y-1 mb-5">
          <div className="flex justify-between"><span>현재 잔고</span><span>${money}</span></div>
          <div className="flex justify-between"><span>생활비 (셰어하우스+밥)</span><span className="text-red-400">−${DAILY_COST}</span></div>
          <div className="flex justify-between font-bold border-t border-white/10 pt-1">
            <span>내일 시작</span>
            <span className={money - DAILY_COST <= 0 ? 'text-red-400' : 'text-emerald-300'}>${money - DAILY_COST}</span>
          </div>
        </div>
        <button
          onClick={nextDay}
          className="w-full bg-amber-400 text-amber-950 font-bold rounded-xl py-3 active:scale-95 transition-transform"
        >
          자고 일어나기
        </button>
      </div>
    </div>
  )
}

export function GameOverModal() {
  const { day, deliveries, fines, restart } = useGame()
  return (
    <div className="absolute inset-0 z-50 bg-black flex items-center justify-center p-6">
      <div className="text-center text-white max-w-sm">
        <div className="text-6xl mb-4">✈️</div>
        <h2 className="text-2xl font-extrabold mb-2">파산... 귀국행 티켓</h2>
        <p className="text-white/60 text-sm mb-6">
          돈이 다 떨어졌다. 워홀 생활 끝.
        </p>
        <div className="bg-white/5 rounded-2xl p-4 text-sm space-y-1 mb-6">
          <div className="flex justify-between"><span>버틴 날</span><b>{day}일</b></div>
          <div className="flex justify-between"><span>완료한 배달</span><b>{deliveries}건</b></div>
          <div className="flex justify-between"><span>받은 딱지</span><b className="text-red-400">{fines}장</b></div>
        </div>
        <button
          onClick={restart}
          className="w-full bg-amber-400 text-amber-950 font-bold rounded-xl py-3 active:scale-95 transition-transform"
        >
          다시 도전
        </button>
      </div>
    </div>
  )
}
