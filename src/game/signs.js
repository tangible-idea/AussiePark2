import { DAY_NAMES } from './time'

// 호주식 주차 표지판 규칙 (게임 단순화 버전):
// - 표지판의 요일/시간 창(window) 안에서만 주차 가능
// - 허용 시간 = min(P 제한시간, 창이 닫힐 때까지 남은 시간)
// - 창 밖(요일 불일치 포함)이면 주차 즉시 위반

const DAY_RANGES = [
  { label: 'MON-FRI', days: [0, 1, 2, 3, 4] },
  { label: 'MON-SAT', days: [0, 1, 2, 3, 4, 5] },
  { label: 'SAT', days: [5] },
  { label: 'SAT-SUN', days: [5, 6] },
  { label: 'SUN', days: [6] },
]

const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1))
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

function roundTo30(min) {
  return Math.round(min / 30) * 30
}

// 지금(dayIdx, now분) 기준으로 이 표지판에 주차하면 몇 분 허용되는지. 0 이하면 불가.
export function allowedMinutes(sign, dayIdx, now) {
  if (!sign.days.includes(dayIdx)) return 0
  if (now < sign.start || now >= sign.end) return 0
  return Math.min(sign.pHours * 60, sign.end - now)
}

function makeSign({ pHours, start, end, dayRange, ticket = false }) {
  return {
    pHours,
    start,
    end,
    days: dayRange.days,
    daysLabel: dayRange.label,
    ticket,
    id: Math.random().toString(36).slice(2),
  }
}

// 오늘 요일을 포함하는 요일 범위 하나 고르기
function dayRangeIncluding(dayIdx) {
  return pick(DAY_RANGES.filter((r) => r.days.includes(dayIdx)))
}
function dayRangeExcluding(dayIdx) {
  const candidates = DAY_RANGES.filter((r) => !r.days.includes(dayIdx))
  return candidates.length ? pick(candidates) : null
}

// 불가능: 요일이 안 맞거나, 시간 창이 이미 끝났거나 아직 안 열림
function makeImpossible(dayIdx, now) {
  if (Math.random() < 0.4) {
    const range = dayRangeExcluding(dayIdx)
    if (range) {
      return makeSign({
        pHours: pick([1, 2, 4]),
        start: roundTo30(rand(7 * 60, 10 * 60)),
        end: roundTo30(rand(15 * 60, 18 * 60)),
        dayRange: range,
      })
    }
  }
  // 시간 창으로 불가능하게: 이미 끝났거나 아직 시작 전
  const ended = Math.random() < 0.5 && now > 9 * 60
  if (ended) {
    const end = roundTo30(Math.max(7 * 60 + 30, now - rand(30, 120)))
    const start = roundTo30(Math.max(6 * 60, end - rand(120, 300)))
    return makeSign({ pHours: pick([1, 2]), start, end, dayRange: dayRangeIncluding(dayIdx) })
  }
  const start = roundTo30(Math.min(23 * 60, now + rand(60, 180)))
  const end = roundTo30(Math.min(23 * 60 + 30, start + rand(120, 300)))
  return makeSign({ pHours: pick([1, 2]), start, end, dayRange: dayRangeIncluding(dayIdx) })
}

// 빠듯: 허용 시간 40~70분
function makeTight(dayIdx, now) {
  const allowed = rand(40, 70)
  if (Math.random() < 0.5) {
    // 창은 넓지만 P 제한이 1시간
    const start = roundTo30(Math.max(6 * 60, now - rand(60, 180)))
    const end = roundTo30(Math.min(23 * 60, now + rand(180, 360)))
    return makeSign({ pHours: 1, start, end, dayRange: dayRangeIncluding(dayIdx), ticket: Math.random() < 0.3 })
  }
  // P는 넉넉하지만 창이 곧 닫힘
  const end = roundTo30(now + allowed)
  const start = roundTo30(Math.max(6 * 60, now - rand(60, 240)))
  return makeSign({ pHours: pick([2, 4]), start, end: Math.max(end, now + 40), dayRange: dayRangeIncluding(dayIdx) })
}

// 널널: 허용 시간 2시간 이상
function makeGenerous(dayIdx, now) {
  const start = roundTo30(Math.max(6 * 60, now - rand(60, 180)))
  const end = roundTo30(Math.min(23 * 60 + 30, now + rand(150, 420)))
  return makeSign({
    pHours: pick([2, 3, 4]),
    start,
    end,
    dayRange: dayRangeIncluding(dayIdx),
    ticket: Math.random() < 0.3,
  })
}

// 항상 [불가능 1, 빠듯 1, 널널 1]을 섞어서 반환
export function generateSigns(dayIdx, now) {
  const signs = [makeImpossible(dayIdx, now), makeTight(dayIdx, now), makeGenerous(dayIdx, now)]
  for (let i = signs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[signs[i], signs[j]] = [signs[j], signs[i]]
  }
  return signs
}

export function describeDays(sign) {
  return sign.daysLabel
}

export { DAY_NAMES }
