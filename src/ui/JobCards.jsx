import { useState, useEffect } from 'react'
import { useGame } from '../game/store'
import { formatClock, DAY_NAMES_KO } from '../game/time'

// 폰에서 배달앱 콜을 보고 수락하는 화면.
// 미적거리면 EXPIRE_SEC마다 제일 좋은(비싼) 콜부터 다른 라이더에게 넘어간다.
const EXPIRE_SEC = 8

const TIER_INFO = {
  near: { km: '0.4km', eta: '3분', color: 'text-emerald-400' },
  mid: { km: '1.1km', eta: '7분', color: 'text-amber-400' },
  far: { km: '2.3km', eta: '12분', color: 'text-red-400' },
}

export default function JobCards() {
  const { jobChoices, chooseJob, expireBestJob, day, dayIdx, clock, money, deliveries } = useGame()
  const [countdown, setCountdown] = useState(EXPIRE_SEC)

  const bestId =
    jobChoices.length > 1 ? jobChoices.reduce((a, b) => (a.pay > b.pay ? a : b)).id : null

  useEffect(() => {
    if (!bestId) return
    setCountdown(EXPIRE_SEC)
    const iv = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          expireBestJob()
          return EXPIRE_SEC
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [bestId, expireBestJob])

  return (
    <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      {/* 폰 프레임 */}
      <div className="relative w-full max-w-[370px] h-[min(760px,94vh)] bg-black rounded-[2.6rem] p-[9px] shadow-[0_25px_80px_rgba(0,0,0,0.8)] ring-1 ring-white/20">
        <div className="relative w-full h-full bg-slate-900 rounded-[2.1rem] overflow-hidden flex flex-col">
          {/* 노치 */}
          <div className="absolute top-2 inset-x-0 flex justify-center z-20 pointer-events-none">
            <div className="w-28 h-6 bg-black rounded-full" />
          </div>

          {/* 상태바 */}
          <div className="flex justify-between items-center px-6 pt-3 pb-1 text-white text-xs font-semibold z-10">
            <span className="tabular-nums">{formatClock(clock)}</span>
            <span className="flex items-center gap-1 text-[10px] tracking-tight">
              <span>▂▄▆█</span><span>5G</span><span>🔋 87%</span>
            </span>
          </div>

          {/* 앱 헤더 */}
          <div className="px-5 pt-3 pb-3 bg-gradient-to-b from-teal-600 to-teal-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛵</span>
                <div className="leading-tight">
                  <div className="text-white font-extrabold text-lg tracking-tight">QuickEats</div>
                  <div className="text-teal-100/80 text-[11px]">라이더 · Day {day} ({DAY_NAMES_KO[dayIdx]})</div>
                </div>
              </div>
              <div className="text-right leading-tight">
                <div className="text-teal-100/80 text-[10px] uppercase tracking-wide">오늘 수입</div>
                <div className="text-white font-extrabold tabular-nums">${money}</div>
              </div>
            </div>
          </div>

          {/* 새 콜 배너 */}
          <div className="mx-4 -mt-2.5 mb-1 bg-red-500 text-white text-center text-xs font-bold rounded-full py-1.5 shadow-lg animate-pulse z-10">
            🔔 새 콜 {jobChoices.length}건 — 미적거리면 좋은 콜부터 뺏겨요!
          </div>

          {/* 콜 리스트 */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
            {jobChoices.map((job) => {
              const t = TIER_INFO[job.tier]
              const expiring = job.id === bestId
              return (
                <div
                  key={job.id}
                  className={`bg-slate-800 rounded-2xl p-4 border shadow-md relative ${
                    expiring ? 'border-red-400/60' : 'border-white/5'
                  }`}
                >
                  {expiring && (
                    <div className="absolute -top-2.5 right-3 bg-red-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow tabular-nums">
                      ⏳ {countdown}초 후 다른 라이더에게
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{job.shop.split(' ')[0]}</span>
                      <div className="leading-tight">
                        <div className="text-white font-bold text-sm">{job.shop.slice(job.shop.indexOf(' ') + 1)}</div>
                        <div className={`text-[11px] font-semibold ${t.color}`}>
                          {t.km} · 약 {t.eta}
                        </div>
                      </div>
                    </div>
                    <div className="text-emerald-400 font-extrabold text-xl tabular-nums">${job.pay}</div>
                  </div>
                  {/* 픽업 → 배달지 */}
                  <div className="text-[12px] space-y-1.5 mb-3 pl-1">
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="w-4 text-center">🏪</span>
                      <span>
                        픽업: <b>{job.shop.slice(job.shop.indexOf(' ') + 1)}</b>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/90">
                      <span className="w-4 text-center">📍</span>
                      <span>
                        {job.street} <b className="text-amber-300">{job.unit}호</b>
                        <span className="text-white/50 ml-1">({job.floor}층 · 엘리베이터 없음)</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <span className="w-4 text-center">⏱</span>
                      <span>제한시간 <b className="text-white/90">{job.timeLimit}분</b> — 초과 시 배달비 50%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => chooseJob(job)}
                    className="w-full bg-teal-500 hover:bg-teal-400 text-white font-extrabold text-sm rounded-xl py-2.5
                               active:scale-[0.98] transition-all shadow-[0_4px_14px_rgba(20,184,166,0.4)]"
                  >
                    수락하기
                  </button>
                </div>
              )
            })}
            <p className="text-center text-white/30 text-[11px] pb-2">
              미수락 콜은 다른 라이더에게 넘어갑니다
            </p>
          </div>

          {/* 하단 탭바 */}
          <div className="flex justify-around items-center py-2.5 border-t border-white/10 bg-slate-900/95 text-[10px]">
            <div className="flex flex-col items-center text-teal-400 font-bold"><span className="text-lg">📋</span>콜</div>
            <div className="flex flex-col items-center text-white/40"><span className="text-lg">🗺️</span>지도</div>
            <div className="flex flex-col items-center text-white/40"><span className="text-lg">💰</span>지갑 <span className="sr-only">{deliveries}</span></div>
            <div className="flex flex-col items-center text-white/40"><span className="text-lg">👤</span>내정보</div>
          </div>

          {/* 홈 인디케이터 */}
          <div className="flex justify-center py-1.5 bg-slate-900">
            <div className="w-28 h-1 bg-white/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
