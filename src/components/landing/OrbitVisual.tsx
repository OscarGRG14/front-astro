// src/components/landing/OrbitVisual.tsx
import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

/**
 * Visual del hero: planeta con glow + órbitas con satélite y astronauta
 * rotando (CSS loop). Entrada animada con anime.js.
 */
export function OrbitVisual() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    animate(ref.current.querySelectorAll('.orbit-el'), {
      opacity: [0, 1],
      scale: [0.6, 1],
      duration: 1400,
      delay: stagger(200, { start: 400 }),
      ease: 'outExpo',
    })
  }, [])

  return (
    <div ref={ref} className="relative mx-auto aspect-square w-full max-w-md select-none" aria-hidden>
      {/* planeta */}
      <div className="orbit-el absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-0"
        style={{
          background: 'radial-gradient(circle at 35% 30%, #164e63 0%, #0c2432 55%, #060d14 100%)',
          boxShadow: '0 0 80px 18px rgba(34,211,238,0.28), inset -18px -14px 40px rgba(0,0,0,0.7)',
        }}>
        {/* atmósfera */}
        <div className="absolute -inset-1.5 rounded-full border border-cyan-400/25" />
        {/* continentes sugeridos */}
        <div className="absolute left-6 top-8 h-8 w-14 rounded-[50%] bg-emerald-400/10 blur-[3px]" />
        <div className="absolute bottom-8 right-7 h-6 w-10 rounded-[50%] bg-emerald-400/10 blur-[3px]" />
      </div>

      {/* órbita 1 — satélite */}
      <div className="orbit-el absolute left-1/2 top-1/2 size-[290px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-400/20 opacity-0"
        style={{ animation: 'orbit-spin 22s linear infinite' }}>
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <div className="relative">
            <div className="size-3.5 rounded-sm bg-cyan-300 shadow-[0_0_14px_4px_rgba(34,211,238,0.7)]" />
            <div className="absolute -left-5 top-0.5 h-2 w-4 rounded-[2px] bg-cyan-500/60" />
            <div className="absolute -right-5 top-0.5 h-2 w-4 rounded-[2px] bg-cyan-500/60" />
          </div>
        </div>
      </div>

      {/* órbita 2 — astronauta (inclinada, contrarotación) */}
      <div className="orbit-el absolute left-1/2 top-1/2 size-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-emerald-400/15 opacity-0"
        style={{ animation: 'orbit-spin 38s linear infinite reverse' }}>
        <div className="absolute left-1/2 top-full -translate-x-1/2">
          <div className="size-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_3px_rgba(52,211,153,0.7)]" />
        </div>
      </div>

      {/* pulso de telemetría */}
      <div className="orbit-el absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0">
        <div className="size-40 rounded-full border border-cyan-400/30" style={{ animation: 'ping-slow 2.4s cubic-bezier(0,0,.2,1) infinite' }} />
      </div>
    </div>
  )
}
