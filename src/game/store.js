import { create } from 'zustand'
import { DAY_START, DAY_END } from './time'
import { generateSigns, allowedMinutes } from './signs'
import { generateJobs } from './jobs'
import { pickTarget, bayFor, pickShop } from './mapData'

export const FINE_AMOUNT = 121      // 주차 위반 벌금 (AUD)
export const DAILY_COST = 45        // 하루 생활비 (셰어하우스 + 밥)
export const START_MONEY = 80

export const MEAL_COST = 14         // 편의점 한 끼 가격 (AUD)

// 워홀 생존 스탯 (0~100)
// 포만감은 낮을수록 배고픔(나쁨), 외로움은 높을수록 나쁨, 영어스킬/힘은 높을수록 좋음
export const START_STATS = { fullness: 80, loneliness: 30, english: 15, strength: 25 }
const clampStat = (v) => Math.max(0, Math.min(100, v))

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
  phase: 'pickup',           // 'pickup'(가게로) → 'dropoff'(고객 건물로)
  shop: null,                // 픽업 가게 건물
  target: null,              // 배달 목적지 건물 (mapData.buildings 항목)
  bay: null,                 // 목적지 앞 주차 베이 {x, z, angle}
  deliverBy: null,           // 이 시각까지 배달 못 하면 배달비 50%
  jobChoices: generateJobs(),
  signChoices: null,
  parkedSign: null,
  parkedAt: null,            // 주차한 시각(분)
  allowedUntil: null,        // 이 시각 넘기면 벌금 (불가능 표지판이면 parkedAt과 동일)
  result: null,              // { type: 'pay'|'fine', amount, overMinutes }
  joystick: { x: 0, y: 0 },  // -1..1, UI 조이스틱 → 씬이 읽음
  stats: { ...START_STATS },
  statFx: null,              // { id, items: [{ label, delta, color }] } — 캐릭터 옆 플로팅 표시

  setJoystick: (v) => set({ joystick: v }),

  // 시간 진행 (씬의 rAF 루프에서 호출)
  tick: (gameMinutes) => {
    const { clock, scene, stats } = get()
    const next = clock + gameMinutes
    // 시간이 흐르면 점점 배고파진다 (하루 풀타임 기준 포만감 약 -40)
    const fullness = clampStat(stats.fullness - gameMinutes * 0.05)
    if (next >= DAY_END && scene !== 'building') {
      set({ clock: DAY_END, scene: 'dayEnd', stats: { ...stats, fullness } })
      return
    }
    set({ clock: next, stats: { ...stats, fullness } })
  },

  // 편의점 앞에서 밥먹기: 돈 내고 포만감 회복 + 점원과 스몰토크
  eatMeal: () => {
    const { money, stats } = get()
    if (money < MEAL_COST) return
    set({
      money: money - MEAL_COST,
      stats: {
        ...stats,
        fullness: clampStat(stats.fullness + 45),
        loneliness: clampStat(stats.loneliness - 2),
        english: clampStat(stats.english + 1),
      },
      statFx: {
        id: Date.now(),
        items: [
          { label: '포만감', delta: +45, color: '#fdba74' },
          { label: '외로움', delta: -2, color: '#d8b4fe' },
          { label: '영어', delta: +1, color: '#7dd3fc' },
          { label: `-$${MEAL_COST}`, color: '#fca5a5' },
        ],
      },
    })
  },

  chooseJob: (job) => {
    const target = pickTarget(job.distance)
    const { clock } = get()
    set({
      job,
      target,
      bay: bayFor(target),
      shop: pickShop(target.id),
      phase: 'pickup',
      deliverBy: clock + job.timeLimit,
      scene: 'city',
      result: null,
    })
  },

  // 가게 앞에서 픽업 완료
  pickup: () => set({ phase: 'dropoff' }),

  // 콜 화면에서 안 고르고 있으면 제일 좋은 콜부터 사라진다
  expireBestJob: () => {
    const { jobChoices } = get()
    if (jobChoices.length <= 1) return
    const best = jobChoices.reduce((a, b) => (a.pay > b.pay ? a : b))
    set({ jobChoices: jobChoices.filter((j) => j.id !== best.id) })
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

  // 건물에서 배달 완료하고 나옴 (제한시간 초과 = 배달비 50%)
  exitBuilding: () => {
    const { clock, allowedUntil, deliverBy, money, job, deliveries, fines, stats } = get()
    // 배달 = 손님과 대화(영어↑, 외로움↓) + 계단 오르내리기(힘↑)
    const grown = {
      ...stats,
      english: clampStat(stats.english + 2),
      strength: clampStat(stats.strength + 1),
      loneliness: clampStat(stats.loneliness - 4),
    }
    const over = clock - allowedUntil
    const late = clock > deliverBy
    const pay = late ? Math.max(2, Math.floor(job.pay / 2)) : job.pay
    if (over > 0) {
      set({
        stats: grown,
        money: money - FINE_AMOUNT,
        fines: fines + 1,
        deliveries: deliveries + 1,
        result: { type: 'fine', amount: FINE_AMOUNT, pay, late, overMinutes: over },
        scene: 'result',
        parkedSign: null,
      })
    } else {
      set({
        stats: grown,
        money: money + pay,
        deliveries: deliveries + 1,
        result: { type: 'pay', amount: pay, late },
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
      phase: 'pickup',
      shop: null,
      target: null,
      bay: null,
      deliverBy: null,
      jobChoices: generateJobs(),
      scene: 'cards',
      result: null,
    })
  },

  // 하루 종료 → 생활비 정산 → 다음 날
  nextDay: () => {
    const { money, day, dayIdx, stats } = get()
    const after = money - DAILY_COST
    if (after <= 0) {
      set({ money: after, scene: 'gameover' })
      return
    }
    set({
      // 집에서 저녁을 먹어 포만감 회복, 타지에서 혼자 보내는 밤은 외로움을 키운다
      stats: {
        ...stats,
        fullness: clampStat(stats.fullness + 60),
        loneliness: clampStat(stats.loneliness + 8),
      },
      money: after,
      day: day + 1,
      dayIdx: (dayIdx + 1) % 7,
      clock: DAY_START,
      job: null,
      phase: 'pickup',
      shop: null,
      target: null,
      bay: null,
      deliverBy: null,
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
      phase: 'pickup',
      shop: null,
      target: null,
      bay: null,
      deliverBy: null,
      jobChoices: generateJobs(),
      signChoices: null,
      parkedSign: null,
      parkedAt: null,
      allowedUntil: null,
      result: null,
      stats: { ...START_STATS },
      statFx: null,
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
