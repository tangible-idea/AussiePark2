import * as THREE from 'three'

// 외부 폰트/네트워크 의존 없이 텍스트를 그리는 캔버스 텍스처 헬퍼
const cache = new Map()

export function textTexture(text, { fg = '#fff', bg = 'transparent', font = 'bold 64px Arial', w = 256, h = 128 } = {}) {
  const key = `${text}|${fg}|${bg}|${font}|${w}x${h}`
  if (cache.has(key)) return cache.get(key)
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')
  if (bg !== 'transparent') {
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, w, h)
  }
  ctx.fillStyle = fg
  ctx.font = font
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, w / 2, h / 2 + h * 0.04)
  const tex = new THREE.CanvasTexture(c)
  tex.anisotropy = 4
  cache.set(key, tex)
  return tex
}
