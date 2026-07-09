// 배달 잡(다음 배달 카드) 생성
const STREETS = [
  'George St', 'Pitt St', 'Elizabeth St', 'Sussex St', 'Kent St',
  'Crown St', 'Oxford St', 'King St', 'Bourke St', 'Cleveland St',
]
const SHOPS = [
  '🍜 Pho House', '🍕 Crust Pizza', '🍣 Sushi Train', '🍔 Grill\'d',
  '🥡 Wok Master', '🍗 Chicken Shop', '🌮 Taco Loco', '🥟 Dumpling King',
]

const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1))
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

// distance: 목적지 건물이 도시 격자에서 얼마나 먼지 (블록 단위) → CityScene이 배치에 사용
export function generateJobs() {
  // timeLimit: 콜 수락 후 배달 완료까지 제한시간 (게임분). 넘기면 배달비 50%.
  const tiers = [
    { tier: 'near', distance: 1, pay: rand(7, 10), timeLimit: 35 },
    { tier: 'mid', distance: 2, pay: rand(11, 15), timeLimit: 50 },
    { tier: 'far', distance: 3, pay: rand(16, 22), timeLimit: 70 },
  ]
  return tiers.map((t) => {
    const floor = rand(2, 4)
    const unit = floor * 100 + rand(1, 6)
    return {
      id: Math.random().toString(36).slice(2),
      shop: pick(SHOPS),
      street: `${rand(10, 400)} ${pick(STREETS)}`,
      unit,
      floor,
      pay: t.pay,
      distance: t.distance,
      tier: t.tier,
      timeLimit: t.timeLimit,
    }
  })
}
