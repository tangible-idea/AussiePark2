// 게임 시간 유틸. clock은 "그날 0시부터 지난 분(minute)" 단위.
export const DAY_NAMES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
export const DAY_NAMES_KO = ['월', '화', '수', '목', '금', '토', '일']

export const DAY_START = 9 * 60   // 오전 9시 출근
export const DAY_END = 22 * 60    // 밤 10시가 되면 하루 종료

// 1 실제초 = 1 게임분
export const MINUTES_PER_SECOND = 1

export function formatClock(min) {
  const m = Math.floor(min)
  const h24 = Math.floor(m / 60) % 24
  const mm = m % 60
  const ampm = h24 < 12 ? 'AM' : 'PM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${String(mm).padStart(2, '0')} ${ampm}`
}

export function formatDuration(min) {
  const m = Math.max(0, Math.round(min))
  const h = Math.floor(m / 60)
  const mm = m % 60
  if (h > 0 && mm > 0) return `${h}시간 ${mm}분`
  if (h > 0) return `${h}시간`
  return `${mm}분`
}

// 표지판 표기용: 9.30AM 같은 호주식 축약
export function formatSignTime(min) {
  const h24 = Math.floor(min / 60) % 24
  const mm = Math.floor(min) % 60
  const ampm = h24 < 12 ? 'AM' : 'PM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return { hour: String(h12), minute: mm === 0 ? null : String(mm).padStart(2, '0'), ampm }
}
