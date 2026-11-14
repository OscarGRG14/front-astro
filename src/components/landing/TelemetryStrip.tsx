// src/components/landing/TelemetryStrip.tsx
import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { Activity, HeartPulse, Thermometer, Wind } from 'lucide-react'

interface Channel { key: string; icon: typeof HeartPulse; label: string; unit: string; gen: (t: number) => number; fmt: (v: number) => string; color: string }

const CHANNELS: Channel[] = [
  { key: 'hr',   icon: HeartPulse,  label: 'HR',        unit: 'bpm', gen: (t) => 72 + 8 * Math.sin(t / 4000) + Math.random() * 2, fmt: (v) => v.toFixed(0), color: 'text-rose-400' },
  { key: 'spo2', icon: Wind,        label: 'SpO2',      unit: '%',   gen: (t) => 97 + Math.sin(t / 6000) + Math.random() * 0.4,    fmt: (v) => v.toFixed(1), color: 'text-cyan-400' },
  { key: 'co2',  icon: Activity,    label: 'CO2 cabina', unit: 'ppm', gen: (t) => 640 + 90 * Math.sin(t / 9000) + Math.random() * 20, fmt: (v) => v.toFixed(0), color: 'text-amber-400' },
  { key: 'temp', icon: Thermometer, label: 'Temp cabina', unit: '°C', gen: (t) => 22.4 + 0.8 * Math.sin(t / 11000), fmt: (v) => v.toFixed(1), color: 'text-emerald-400' },
]

/** Tira de telemetría en vivo (simulada) — los valores laten cada ~2s. */
export function TelemetryStrip() {
  const [tick, setTick] = useState(0)
  const valueRefs = useRef<Record<string, HTMLElement | null>>({})
  const liveRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!tick) return
    for (const c of CHANNELS) {
      const el = valueRefs.current[c.key]
      if (el) animate(el, { scale: [1.12, 1], duration: 500, ease: 'outQuad' })
    }
    if (liveRef.current) animate(liveRef.current, { opacity: [1, 0.25, 1], duration: 900, ease: 'inOutSine' })
  }, [tick])

  const now = performance.now()

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {CHANNELS.map((c) => (
        <div key={c.key} className="rounded-xl border border-border/60 bg-card/50 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            <c.icon className="size-3.5" /> {c.label}
            <span ref={c.key === 'hr' ? liveRef : undefined} className="ml-auto size-1.5 rounded-full bg-emerald-400" />
          </div>
          <p className="mt-1.5 flex items-baseline gap-1">
            <span ref={(el) => { valueRefs.current[c.key] = el }} className={`inline-block font-mono text-2xl font-semibold tabular-nums ${c.color}`}>
              {c.fmt(c.gen(now + tick * 2000))}
            </span>
            <span className="text-xs text-muted-foreground">{c.unit}</span>
          </p>
        </div>
      ))}
    </div>
  )
}
