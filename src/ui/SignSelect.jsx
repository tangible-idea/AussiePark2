import { useGame } from '../game/store'
import { formatClock, DAY_NAMES } from '../game/time'
import AussieSign from './AussieSign'

// 주차 표지판 3택. 어느 것이 안전한지는 플레이어가 시간표를 읽고 판단해야 한다.
export default function SignSelect() {
  const { signChoices, chooseSign, cancelSignSelect, clock, dayIdx } = useGame()
  if (!signChoices) return null

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4">
      <h2 className="text-white text-xl font-bold mb-1">어디에 주차할까?</h2>
      <p className="text-white/60 text-sm mb-5 text-center">
        지금은 <span className="text-amber-300 font-bold">{DAY_NAMES[dayIdx]} {formatClock(clock)}</span> —
        표지판을 잘 읽고 자리를 고르세요
      </p>
      <div className="flex gap-3 w-full max-w-md items-stretch">
        {signChoices.map((sign) => (
          <AussieSign key={sign.id} sign={sign} onClick={() => chooseSign(sign)} />
        ))}
      </div>
      <button
        onClick={cancelSignSelect}
        className="mt-6 text-white/60 text-sm underline underline-offset-4"
      >
        주차 안 함 (돌아가기)
      </button>
    </div>
  )
}
