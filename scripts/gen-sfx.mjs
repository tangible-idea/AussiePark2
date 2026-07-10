// 게임 효과음 합성 스크립트. 외부 에셋/라이브러리 없이 사인/사각파 가산합성으로
// WAV 파일을 만들어 public/sfx/ 에 저장한다. `node scripts/gen-sfx.mjs`로 재생성 가능.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SR = 44100
const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'sfx')

function makeBuffer(seconds) {
  return new Float32Array(Math.ceil(seconds * SR))
}

// buf에 감쇠하는 배음 톤을 더한다 (가산합성 + 지수 감쇠 엔벨로프)
function addTone(buf, { start, dur, freq, amp = 0.5, decay = 6, attack = 0.005, harmonics = [1], wave = 'sine', vibratoHz = 0, vibratoDepth = 0 }) {
  const startI = Math.floor(start * SR)
  const n = Math.floor(dur * SR)
  for (let i = 0; i < n; i++) {
    const idx = startI + i
    if (idx >= buf.length) break
    const t = i / SR
    const env = (t < attack ? t / attack : 1) * Math.exp(-decay * t)
    const vib = vibratoHz ? Math.sin(2 * Math.PI * vibratoHz * t) * vibratoDepth : 0
    let s = 0
    for (const [mult, hAmp] of harmonics.map((h, k) => (Array.isArray(h) ? h : [h, 1 / (k + 1)]))) {
      const f = freq * mult + vib
      const phase = 2 * Math.PI * f * t
      s += (wave === 'square' ? Math.sign(Math.sin(phase)) : Math.sin(phase)) * hAmp
    }
    buf[idx] += s * amp * env
  }
}

// buf에 필터링된 노이즈(퍽/두드리는 소리 등)를 더한다
function addNoiseBurst(buf, { start, dur, amp = 0.4, decay = 20, lowpass = 6 }) {
  const startI = Math.floor(start * SR)
  const n = Math.floor(dur * SR)
  let prev = 0
  for (let i = 0; i < n; i++) {
    const idx = startI + i
    if (idx >= buf.length) break
    const t = i / SR
    const env = Math.exp(-decay * t)
    let raw = Math.random() * 2 - 1
    for (let k = 0; k < lowpass; k++) raw = (raw + prev) / 2
    prev = raw
    buf[idx] += raw * amp * env
  }
}

function normalize(buf, ceiling = 0.92) {
  let max = 0
  for (const v of buf) max = Math.max(max, Math.abs(v))
  if (max > ceiling) {
    const g = ceiling / max
    for (let i = 0; i < buf.length; i++) buf[i] *= g
  }
}

function writeWav(name, buf) {
  normalize(buf)
  const bytesPerSample = 2
  const dataSize = buf.length * bytesPerSample
  const out = Buffer.alloc(44 + dataSize)
  out.write('RIFF', 0)
  out.writeUInt32LE(36 + dataSize, 4)
  out.write('WAVE', 8)
  out.write('fmt ', 12)
  out.writeUInt32LE(16, 16)
  out.writeUInt16LE(1, 20) // PCM
  out.writeUInt16LE(1, 22) // mono
  out.writeUInt32LE(SR, 24)
  out.writeUInt32LE(SR * bytesPerSample, 28)
  out.writeUInt16LE(bytesPerSample, 32)
  out.writeUInt16LE(16, 34)
  out.write('data', 36)
  out.writeUInt32LE(dataSize, 40)
  for (let i = 0; i < buf.length; i++) {
    const s = Math.max(-1, Math.min(1, buf[i]))
    out.writeInt16LE(Math.round(s * 32767), 44 + i * bytesPerSample)
  }
  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(path.join(OUT_DIR, name), out)
  console.log('wrote', path.join('public/sfx', name), `${(out.length / 1024).toFixed(1)}KB`)
}

const BELL = [1, [2, 0.45], [3, 0.2], [4, 0.08]]

// 1. UI 클릭 (표지판 취소, 일반 확인)
{
  const buf = makeBuffer(0.12)
  addTone(buf, { start: 0, dur: 0.1, freq: 950, amp: 0.35, decay: 45, attack: 0.001 })
  writeWav('ui_click.wav', buf)
}

// 2. 배달 콜 수락 — 상승 2음
{
  const buf = makeBuffer(0.32)
  addTone(buf, { start: 0, dur: 0.14, freq: 523.25, amp: 0.4, decay: 14, harmonics: BELL })
  addTone(buf, { start: 0.09, dur: 0.2, freq: 783.99, amp: 0.42, decay: 10, harmonics: BELL })
  writeWav('job_accept.wav', buf)
}

// 3. 픽업 완료 (가게에서 박스 수령) — 톡 치는 노이즈 + 낮은 톤
{
  const buf = makeBuffer(0.2)
  addNoiseBurst(buf, { start: 0, dur: 0.06, amp: 0.5, decay: 60, lowpass: 3 })
  addTone(buf, { start: 0, dur: 0.15, freq: 330, amp: 0.3, decay: 18, wave: 'square' })
  writeWav('pickup.wav', buf)
}

// 4. 주차 성공 (표지판 선택 확정) — 부드러운 벨
{
  const buf = makeBuffer(0.45)
  addTone(buf, { start: 0, dur: 0.18, freq: 587.33, amp: 0.35, decay: 10, harmonics: BELL })
  addTone(buf, { start: 0.1, dur: 0.32, freq: 880, amp: 0.4, decay: 7, harmonics: BELL })
  writeWav('park_success.wav', buf)
}

// 5. 배달 완료 (정시) — 상승 아르페지오
{
  const buf = makeBuffer(0.65)
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((f, i) => {
    addTone(buf, { start: i * 0.09, dur: 0.3, freq: f, amp: 0.34, decay: 8, harmonics: BELL })
  })
  addNoiseBurst(buf, { start: 0.34, dur: 0.2, amp: 0.08, decay: 12, lowpass: 1 })
  writeWav('delivery_success.wav', buf)
}

// 6. 배달 완료 (지각, 배달비 50%) — 살짝 아쉬운 2음
{
  const buf = makeBuffer(0.4)
  addTone(buf, { start: 0, dur: 0.16, freq: 587.33, amp: 0.3, decay: 12, harmonics: BELL })
  addTone(buf, { start: 0.12, dur: 0.26, freq: 493.88, amp: 0.28, decay: 9, harmonics: BELL })
  writeWav('delivery_late.wav', buf)
}

// 7. 벌금 딱지 — 거친 부저음
{
  const buf = makeBuffer(0.55)
  addTone(buf, { start: 0, dur: 0.5, freq: 196, amp: 0.32, decay: 4, wave: 'square', vibratoHz: 14, vibratoDepth: 10 })
  addTone(buf, { start: 0, dur: 0.5, freq: 185, amp: 0.24, decay: 4, wave: 'square', vibratoHz: 11, vibratoDepth: 8 })
  writeWav('fine.wav', buf)
}

// 8. 하루 종료 — 잔잔한 하강 벨 (밤)
{
  const buf = makeBuffer(0.9)
  const notes = [783.99, 659.25, 523.25]
  notes.forEach((f, i) => {
    addTone(buf, { start: i * 0.22, dur: 0.4, freq: f, amp: 0.28, decay: 5, harmonics: BELL })
  })
  writeWav('day_end.wav', buf)
}

// 9. 게임오버 — 느린 하강 (파산)
{
  const buf = makeBuffer(1.3)
  const notes = [392, 349.23, 311.13, 261.63]
  notes.forEach((f, i) => {
    addTone(buf, { start: i * 0.24, dur: 0.5, freq: f, amp: 0.32, decay: 4.5, wave: 'square', vibratoHz: 5, vibratoDepth: 3 })
  })
  writeWav('game_over.wav', buf)
}

// 10. 편의점 밥먹기 — 짧은 아삭 소리 두 번
{
  const buf = makeBuffer(0.4)
  addNoiseBurst(buf, { start: 0, dur: 0.09, amp: 0.45, decay: 35, lowpass: 2 })
  addNoiseBurst(buf, { start: 0.16, dur: 0.09, amp: 0.4, decay: 35, lowpass: 2 })
  writeWav('eat.wav', buf)
}

// 11. 취소 (주차 안 함) — 짧은 하강 블립
{
  const buf = makeBuffer(0.18)
  addTone(buf, { start: 0, dur: 0.16, freq: 440, amp: 0.3, decay: 16, wave: 'square' })
  addTone(buf, { start: 0.04, dur: 0.12, freq: 330, amp: 0.24, decay: 16, wave: 'square' })
  writeWav('cancel.wav', buf)
}
