// 효과음 재생기. public/sfx/*.wav 를 미리 로드해두고, 겹쳐 재생될 수 있도록
// 재생 때마다 노드를 복제한다 (연타해도 앞 소리가 끊기지 않음).
const FILES = {
  click: 'ui_click.wav',
  accept: 'job_accept.wav',
  pickup: 'pickup.wav',
  park: 'park_success.wav',
  success: 'delivery_success.wav',
  late: 'delivery_late.wav',
  fine: 'fine.wav',
  dayEnd: 'day_end.wav',
  gameOver: 'game_over.wav',
  eat: 'eat.wav',
  cancel: 'cancel.wav',
}

const VOLUME = 0.55
let muted = false
const pool = {}

function base(name) {
  if (!pool[name]) {
    const el = new Audio(`/sfx/${FILES[name]}`)
    el.preload = 'auto'
    el.volume = VOLUME
    pool[name] = el
  }
  return pool[name]
}

export function playSfx(name) {
  if (muted || typeof Audio === 'undefined' || !FILES[name]) return
  const el = base(name)
  const node = el.cloneNode(true)
  node.volume = el.volume
  node.play().catch(() => {}) // 브라우저 자동재생 제한 시 조용히 무시
}

export function setSfxMuted(v) {
  muted = v
}

export function isSfxMuted() {
  return muted
}
