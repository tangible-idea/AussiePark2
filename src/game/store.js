import { create } from 'zustand'
import { DAY_START, DAY_END } from './time'
import { generateSigns, allowedMinutes } from './signs'
import { generateJobs } from './jobs'
import { pickTarget, bayFor } from './mapData'

export const FINE_AMOUNT = 121      // 주차 위반 벌금 (AUD)
export const DAILY_COST = 45        // 하루 생활비 (셰어하우스 + 밥)
export const START_MONEY = 80

// scene: city | signSelect | building | result | cards | dayEnd | gameover
export const useGame = create((set, get) => ({
  scene: 'cards',
  money: START_MONEY,
  day: 1,
  dayIdx: 0,                 // 0=MON
  clock: DAY_START,
  deliveries: 0,
  fines: 0,

  job: null,
  target: null,              // 목적지 건물 (mapData.buildings 항목)
  bay: null,                 // 목적지 앞 주차 베이 {x, z, angle}
  jobChoices: generateJobs(),
  signChoices: null,
  parkedSign: null,
  parkedAt: null,            // 주차한 시각(분)
  allowedUntil: null,        // 이 시각 넘기면 벌금 (불가능 표지판이면 parkedAt과 동일)
  result: null,              // { type: 'pay'|'fine', amount, overMinutes }
  joystick: { x: 0, y: 0 },  // -1..1, UI 조이스틱 → 씬이 읽음

  setJoystick: (v) => set({ joystick: v }),

  // 시간 진행 (씬의 rAF 루프에서 호출)
  tick: (gameMinutes) => {
    const { clock, scene } = get()
    const next = clock + gameMinutes
    if (next >= DAY_END && scene !== 'building') {
      set({ clock: DAY_END, scene: 'dayEnd' })
      return
    }
    set({ clock: next })
  },

  chooseJob: (job) => {
    const target = pickTarget(job.distance)
    set({ job, target, bay: bayFor(target), scene: 'city', result: null })
  },

  // 주차 공간에서 주차 버튼 → 표지판 3택 제시
  openSignSelect: () => {
    const { dayIdx, clock } = get()
    set({ signChoices: generateSigns(dayIdx, Math.floor(clock)), scene: 'signSelect' })
  },

  cancelSignSelect: () => set({ signChoices: null, scene: 'city' }),

  chooseSign: (sign) => {
    const { dayIdx, clock } = get()
    const allowed = allowedMinutes(sign, dayIdx, Math.floor(clock))
    set({
      parkedSign: sign,
      parkedAt: clock,
      allowedUntil: clock + allowed,
      signChoices: null,
      scene: 'building',
    })
  },

  // 건물에서 배달 완료하고 나옴
  exitBuilding: () => {
    const { clock, allowedUntil, money, job, deliveries, fines } = get()
    const over = clock - allowedUntil
    if (over > 0) {
      set({
        money: money - FINE_AMOUNT,
        fines: fines + 1,
        deliveries: deliveries + 1,
        result: { type: 'fine', amount: FINE_AMOUNT, pay: job.pay, overMinutes: over },
        scene: 'result',
        parkedSign: null,
      })
    } else {
      set({
        money: money + job.pay,
        deliveries: deliveries + 1,
        result: { type: 'pay', amount: job.pay },
        scene: 'result',
        parkedSign: null,
      })
    }
  },

  // 결과 확인 → 파산 체크 → 다음 배달 카드
  dismissResult: () => {
    const { money, result } = get()
    // 벌금을 물었어도 배달비는 받는다
    const netMoney = result?.type === 'fine' ? money + result.pay : money
    if (netMoney <= 0) {
      set({ money: netMoney, scene: 'gameover', result: null })
      return
    }
    set({
      money: netMoney,
      job: null,
      target: null,
      bay: null,
      jobChoices: generateJobs(),
      scene: 'cards',
      result: null,
    })
  },

  // 하루 종료 → 생활비 정산 → 다음 날
  nextDay: () => {
    const { money, day, dayIdx } = get()
    const after = money - DAILY_COST
    if (after <= 0) {
      set({ money: after, scene: 'gameover' })
      return
    }
    set({
      money: after,
      day: day + 1,
      dayIdx: (dayIdx + 1) % 7,
      clock: DAY_START,
      job: null,
      target: null,
      bay: null,
      jobChoices: generateJobs(),
      scene: 'cards',
    })
  },

  restart: () =>
    set({
      scene: 'cards',
      money: START_MONEY,
      day: 1,
      dayIdx: 0,
      clock: DAY_START,
      deliveries: 0,
      fines: 0,
      job: null,
      target: null,
      bay: null,
      jobChoices: generateJobs(),
      signChoices: null,
      parkedSign: null,
      parkedAt: null,
      allowedUntil: null,
      result: null,
    }),
}))

if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__game = useGame
  // 테스트용: ?auto=city|building 이면 해당 씬까지 자동 진행
  const auto = new URLSearchParams(location.search).get('auto')
  if (auto === 'city' || auto === 'building') {
    const s = useGame.getState()
    s.chooseJob(s.jobChoices[1])
    if (auto === 'building') {
      useGame.getState().openSignSelect()
      const st = useGame.getState()
      const best = st.signChoices.reduce((a, b) =>
        allowedMinutes(a, st.dayIdx, st.clock) > allowedMinutes(b, st.dayIdx, st.clock) ? a : b
      )
      st.chooseSign(best)
    }
  }
}
