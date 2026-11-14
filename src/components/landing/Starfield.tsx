// src/components/landing/Starfield.tsx
import { useEffect, useRef } from 'react'

interface Star { x: number; y: number; z: number; r: number; phase: number; speed: number }
interface Meteor { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }

/**
 * Campo de estrellas en canvas: 3 capas de profundidad con parallax
 * al mouse, titileo suave y meteoros ocasionales.
 */
export function Starfield({ density = 220 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let w = 0, h = 0, raf = 0
    const stars: Star[] = []
    const meteors: Meteor[] = []
    const mouse = { x: 0.5, y: 0.5 }

    const resize = () => {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio
      h = canvas.height = canvas.offsetHeight * devicePixelRatio
    }
    resize()

    for (let i = 0; i < density; i++) {
      const z = 0.25 + Math.random() * 0.75 // profundidad 0.25–1
      stars.push({
        x: Math.random(), y: Math.random(), z,
        r: z * 1.4, phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 1.2,
      })
    }

    const spawnMeteor = () => {
      meteors.push({
        x: Math.random() * 0.7 + 0.15, y: Math.random() * 0.3,
        vx: 0.25 + Math.random() * 0.2, vy: 0.12 + Math.random() * 0.08,
        life: 0, maxLife: 60 + Math.random() * 40,
      })
    }
    let nextMeteor = 200 + Math.random() * 400

    const onMouse = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth
      mouse.y = e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('resize', resize)

    let t = 0
    const frame = () => {
      t++
      ctx.clearRect(0, 0, w, h)

      // estrellas
      for (const s of stars) {
        const tw = 0.45 + 0.55 * Math.sin(t * 0.02 * s.speed + s.phase)
        const px = (s.x * w) + (mouse.x - 0.5) * 60 * s.z * devicePixelRatio
        const py = (s.y * h) + (mouse.y - 0.5) * 60 * s.z * devicePixelRatio
        ctx.globalAlpha = tw * (0.35 + s.z * 0.65)
        ctx.fillStyle = s.z > 0.8 ? '#a5f3fc' : '#e2e8f0'
        ctx.beginPath()
        ctx.arc(px, py, s.r * devicePixelRatio, 0, Math.PI * 2)
        ctx.fill()
      }

      // meteoros
      if (--nextMeteor <= 0) { spawnMeteor(); nextMeteor = 300 + Math.random() * 500 }
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i]
        m.life++
        m.x += m.vx / 100
        m.y += m.vy / 100
        const fade = Math.sin((m.life / m.maxLife) * Math.PI)
        const tail = 90 * devicePixelRatio
        const grad = ctx.createLinearGradient(m.x * w, m.y * h, m.x * w - tail, m.y * h - tail * (m.vy / m.vx))
        grad.addColorStop(0, `rgba(165,243,252,${0.8 * fade})`)
        grad.addColorStop(1, 'rgba(165,243,252,0)')
        ctx.globalAlpha = 1
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5 * devicePixelRatio
        ctx.beginPath()
        ctx.moveTo(m.x * w, m.y * h)
        ctx.lineTo(m.x * w - tail, m.y * h - tail * (m.vy / m.vx))
        ctx.stroke()
        if (m.life >= m.maxLife) meteors.splice(i, 1)
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize', resize)
    }
  }, [density])

  return <canvas ref={ref} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden />
}
