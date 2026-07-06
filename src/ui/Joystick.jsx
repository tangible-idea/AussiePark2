import { useRef, useCallback, useEffect } from 'react'
import { useGame } from '../game/store'

const RADIUS = 52 // 스틱 이동 반경(px)

// 왼쪽 하단 가상 조이스틱. 값은 store.joystick(-1..1)으로 전달.
export default function Joystick() {
  const setJoystick = useGame((s) => s.setJoystick)
  const baseRef = useRef(null)
  const knobRef = useRef(null)
  const activeId = useRef(null)

  const moveKnob = useCallback((dx, dy) => {
    if (knobRef.current) knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`
  }, [])

  const handleMove = useCallback(
    (e) => {
      const base = baseRef.current
      if (!base) return
      const rect = base.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      let dx = e.clientX - cx
      let dy = e.clientY - cy
      const len = Math.hypot(dx, dy)
      if (len > RADIUS) {
        dx = (dx / len) * RADIUS
        dy = (dy / len) * RADIUS
      }
      moveKnob(dx, dy)
      setJoystick({ x: dx / RADIUS, y: dy / RADIUS })
    },
    [moveKnob, setJoystick]
  )

  const onPointerDown = useCallback(
    (e) => {
      if (activeId.current !== null) return
      activeId.current = e.pointerId
      e.currentTarget.setPointerCapture(e.pointerId)
      handleMove(e)
    },
    [handleMove]
  )

  const onPointerMove = useCallback(
    (e) => {
      if (e.pointerId !== activeId.current) return
      handleMove(e)
    },
    [handleMove]
  )

  const release = useCallback(
    (e) => {
      if (e.pointerId !== activeId.current) return
      activeId.current = null
      moveKnob(0, 0)
      setJoystick({ x: 0, y: 0 })
    },
    [moveKnob, setJoystick]
  )

  // 데스크톱 테스트용 WASD / 화살표 키
  useEffect(() => {
    const keys = new Set()
    const apply = () => {
      const x = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0)
      const y = (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0)
      setJoystick({ x, y })
    }
    const down = (e) => {
      const k = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) {
        keys.add(k)
        apply()
      }
    }
    const up = (e) => {
      const k = e.key.toLowerCase()
      if (keys.delete(k)) apply()
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [setJoystick])

  return (
    <div
      ref={baseRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={release}
      onPointerCancel={release}
      className="absolute bottom-8 left-6 w-36 h-36 rounded-full bg-white/10 backdrop-blur-sm
                 border-2 border-white/25 flex items-center justify-center touch-none select-none z-40"
    >
      <div
        ref={knobRef}
        className="w-16 h-16 rounded-full bg-white/40 border-2 border-white/60 shadow-lg pointer-events-none"
      />
    </div>
  )
}
