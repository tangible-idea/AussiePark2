// Strathfield(public/map/strathfield.png)을 본뜬 도로망.
// 대각선 철로가 도심을 가로지르고, 역 서쪽 광장(Raw Square)과 사선 간선도로,
// 북동쪽에는 살짝 기울어진 격자 주택가가 있다.
// 좌표계: x=동쪽, z=남쪽(화면 아래). 단위는 게임 유닛.

export const MAP_EXTENT = 250 // 맵 반경 (±)
export const ROAD_W = 9

// ─── 도로 그래프 ───
export const nodes = {
  albertW: [-200, -95],
  rawSquare: [-65, -20],       // 역 서쪽 광장
  churchillW: [-225, 35],
  boulevardN: [-60, 35],
  redmyreW: [-225, 110],
  redmyreE: [-52, 105],
  boulevardS: [-45, 160],
  margaretW: [-150, 155],
  evertonW: [-180, -150],
  evertonMid: [-40, -60],      // 철로 위 북서 건널목과 연결
  parnell: [90, 138],          // 남쪽 건널목
  // 북동쪽 기울어진 격자 (3x3)
  g00: [33, -54],  g01: [57, 12],   g02: [81, 77],
  g10: [108, -81], g11: [132, -16], g12: [156, 50],
  g20: [183, -109], g21: [207, -43], g22: [231, 23],
}

export const edges = [
  // 서쪽 간선
  ['albertW', 'rawSquare'],        // Albert Rd (철로 남서쪽 평행)
  ['rawSquare', 'boulevardN'],
  ['churchillW', 'boulevardN'],    // Churchill Ave
  ['boulevardN', 'redmyreE'],      // The Boulevarde
  ['redmyreW', 'redmyreE'],        // Redmyre Rd
  ['redmyreE', 'boulevardS'],
  ['margaretW', 'boulevardS'],     // Margaret St
  // 철로 건널목 2곳
  ['rawSquare', 'evertonMid'],     // 북서 언더패스
  ['boulevardS', 'parnell'],       // 남쪽 건널목
  ['parnell', 'g12'],
  // Everton Rd
  ['evertonW', 'evertonMid'],
  ['evertonMid', 'g00'],
  // 북동 격자
  ['g00', 'g01'], ['g01', 'g02'],
  ['g10', 'g11'], ['g11', 'g12'],
  ['g20', 'g21'], ['g21', 'g22'],
  ['g00', 'g10'], ['g10', 'g20'],
  ['g01', 'g11'], ['g11', 'g21'],
  ['g02', 'g12'], ['g12', 'g22'],
]

// 철로 폴리라인 (북서 → 남동)
export const rail = [
  [-230, -150], [-120, -88], [-30, -35], [40, 8], [120, 62], [210, 120],
]
export const RAIL_W = 13

// 역 위치 (철로 위)
export const STATION = { x: 5, z: -13, angle: Math.atan2(43, 70) } // 철로 방향

// ─── 그래프 헬퍼 ───
export const neighbors = {}
for (const [a, b] of edges) {
  ;(neighbors[a] ??= []).push(b)
  ;(neighbors[b] ??= []).push(a)
}

function distToSegment(px, pz, [ax, az], [bx, bz]) {
  const dx = bx - ax
  const dz = bz - az
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)))
  const qx = ax + t * dx
  const qz = az + t * dz
  return { d: Math.hypot(px - qx, pz - qz), qx, qz, t }
}

export function distToRoads(px, pz) {
  let best = { d: Infinity }
  for (const [a, b] of edges) {
    const r = distToSegment(px, pz, nodes[a], nodes[b])
    if (r.d < best.d) best = r
  }
  return best
}

export function distToRail(px, pz) {
  let d = Infinity
  for (let i = 0; i < rail.length - 1; i++) {
    d = Math.min(d, distToSegment(px, pz, rail[i], rail[i + 1]).d)
  }
  return d
}

// ─── 건물 배치 (모듈 로드 시 1회 생성, 세션 동안 고정) ───
// 도로/철로에서 떨어진 자리에 흩뿌린다. 역에서 가까울수록 상가(높고 채도),
// 멀수록 주택(낮고 파스텔).
let seed = 20260706
const srand = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff
  return seed / 0x7fffffff
}

const COMMERCIAL = [0xc98d5e, 0xb5651d, 0x8d99ae, 0x996f5a, 0xa0785a]
const HOUSES = [0xd9c8b4, 0xc9d4c5, 0xd4c5c9, 0xbfcbd4, 0xd4d0bf, 0xcbbfd4]
const ROOFS = [0xc48a76, 0xa8b58f, 0x8fa3b5, 0xc4b28a, 0xb08fa3]

export const buildings = []
export const trees = []
export const SPAWN = { x: -50, z: 70 } // 광장 남쪽에서 시작

for (let gx = -MAP_EXTENT + 15; gx <= MAP_EXTENT - 15; gx += 19) {
  for (let gz = -MAP_EXTENT + 15; gz <= MAP_EXTENT - 15; gz += 19) {
    const jx = gx + (srand() - 0.5) * 8
    const jz = gz + (srand() - 0.5) * 8
    const roadD = distToRoads(jx, jz).d
    const railD = distToRail(jx, jz)
    if (railD < RAIL_W / 2 + 7) continue
    if (roadD < ROAD_W / 2 + 8) continue
    if (Math.hypot(jx - SPAWN.x, jz - SPAWN.z) < 14) continue
    // 도로에서 너무 먼 안쪽 자투리 → 가끔 나무
    if (roadD > 34) {
      if (srand() < 0.35) trees.push({ x: jx, z: jz, s: 0.8 + srand() * 0.8 })
      continue
    }
    const stationD = Math.hypot(jx - STATION.x, jz - STATION.z)
    const commercial = stationD < 95
    const w = commercial ? 11 + srand() * 5 : 8 + srand() * 4
    const d = commercial ? 11 + srand() * 5 : 8 + srand() * 4
    const h = commercial ? 12 + srand() * 22 : 4.5 + srand() * 4
    const palette = commercial ? COMMERCIAL : HOUSES
    buildings.push({
      id: buildings.length,
      x: jx, z: jz, w, d, h,
      color: palette[Math.floor(srand() * palette.length)],
      roof: ROOFS[Math.floor(srand() * ROOFS.length)],
      commercial,
    })
  }
}

// ─── 편의점 (밥 먹는 곳) ───
// 광장 남쪽 The Boulevarde 서쪽 도로변. 앞 도로에 서면 밥먹기 버튼이 뜬다.
export const STORE = { x: -72, z: 70, w: 11, d: 9, h: 5.5 }

// 편의점 자리와 겹치는 자동 생성 건물 제거 후 충돌용으로 등록
for (let i = buildings.length - 1; i >= 0; i--) {
  const b = buildings[i]
  if (
    Math.abs(b.x - STORE.x) < (b.w + STORE.w) / 2 + 3 &&
    Math.abs(b.z - STORE.z) < (b.d + STORE.d) / 2 + 3
  ) {
    buildings.splice(i, 1)
  }
}
buildings.push({ id: 'store', ...STORE, color: 0x2fa84f, roof: 0xe8ecef, commercial: true, store: true })

// 배달 목적지 후보: 티어별 거리 밴드 (SPAWN 기준, 편의점 제외)
export function pickTarget(distanceTier) {
  const bands = { 1: [55, 115], 2: [115, 180], 3: [180, 300] }
  const [lo, hi] = bands[distanceTier] || bands[2]
  const pool = buildings.filter((b) => {
    if (b.store) return false
    const d = Math.hypot(b.x - SPAWN.x, b.z - SPAWN.z)
    return d >= lo && d < hi
  })
  return pool[Math.floor(Math.random() * pool.length)] || buildings[0]
}

// 목적지 앞 도로변 주차 베이 위치 (가장 가까운 도로점에서 건물 쪽으로 살짝 offset)
export function bayFor(building) {
  const { qx, qz } = distToRoads(building.x, building.z)
  const dx = building.x - qx
  const dz = building.z - qz
  const len = Math.hypot(dx, dz) || 1
  const off = ROAD_W / 2 - 1.2 // 도로 가장자리
  return {
    x: qx + (dx / len) * off,
    z: qz + (dz / len) * off,
    angle: Math.atan2(dx, dz),
  }
}

// 편의점 앞 도로변 식사 지점
export const STORE_BAY = bayFor(STORE)

// ─── 호주 길거리 장식 (모듈 로드 시 1회 생성) ───
// 나무 일부는 자카란다(보라 캐노피)로
for (const t of trees) t.jac = srand() < 0.3

// 도로변 소품: 휠리빈 / 호주우체국 우체통 / 버스정류장
export const props = []
{
  const avoid = [SPAWN, STATION, STORE, STORE_BAY]
  for (const [a, b] of edges) {
    const [ax, az] = nodes[a]
    const [bx, bz] = nodes[b]
    const len = Math.hypot(bx - ax, bz - az)
    const dx = (bx - ax) / len
    const dz = (bz - az) / len
    const count = len > 100 ? 2 : 1
    for (let i = 0; i < count; i++) {
      if (srand() < 0.3) continue
      const t = 0.2 + srand() * 0.6
      const side = srand() < 0.5 ? 1 : -1
      const off = ROAD_W / 2 + 2.2
      const x = ax + (bx - ax) * t - dz * off * side
      const z = az + (bz - az) * t + dx * off * side
      if (avoid.some((p) => Math.hypot(x - p.x, z - p.z) < 14)) continue
      if (distToRail(x, z) < RAIL_W / 2 + 4) continue
      const r = srand()
      const type = r < 0.45 ? 'bin' : r < 0.75 ? 'mailbox' : 'busstop'
      // 도로 쪽을 바라보게
      props.push({ x, z, type, angle: Math.atan2(dz * side, -dx * side) })
    }
  }
}
