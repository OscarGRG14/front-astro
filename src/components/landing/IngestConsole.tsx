// src/components/landing/IngestConsole.tsx
import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'lucide-react'

const LINE_POOL = [
  () => ({ text: `POST /api/v1/ingest 201 · { accepted: 2, rejected: [] }`, tone: 'ok' }),
  () => ({ text: `ESP01 >> hr=${rand(68, 82)}bpm spo2=${(96 + Math.random() * 3).toFixed(1)}%`, tone: 'data' }),
  () => ({ text: `ESP01 >> co2=${rand(540, 780)}ppm temp=${(21 + Math.random() * 2).toFixed(1)}°C`, tone: 'data' }),
  () => ({ text: `rule_engine · hr_normal — sin alerta`, tone: 'dim' }),
  () => ({ text: `POST /api/v1/ingest 201 · { accepted: 3, rejected: [] }`, tone: 'ok' }),
  () => ({ text: `ESP01 >> spo2=${(88 + Math.random() * 1.5).toFixed(1)}%`, tone: 'data' }),
  () => ({ text: `⚠ alert_engine · spo2_low → warning`, tone: 'warn' }),
  () => ({ text: `socket · emit alert:new → mission:MISSION-01`, tone: 'dim' }),
  () => ({ text: `ESP01 >> spo2=${(96 + Math.random() * 2).toFixed(1)}%`, tone: 'data' }),
  () => ({ text: `alert_engine · spo2_low → auto-resolved`, tone: 'ok' }),
]

function rand(min: number, max: number) { return Math.floor(min + Math.random() * (max - min)) }

const toneClass: Record<string, string> = {
  ok: 'text-emerald-400', data: 'text-slate-300', dim: 'text-muted-foreground/60', warn: 'text-amber-400',
}

/** Consola tipo log que va imprimiendo el flujo real de ingesta. */
export function IngestConsole() {
  const [lines, setLines] = useState<{ text: string; tone: string; id: number }[]>([])
  const idx = useRef(0)
  const idRef = useRef(0)
  const boxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const push = () => {
      const line = LINE_POOL[idx.current % LINE_POOL.length]()
      idx.current++
      const ts = new Date().toLocaleTimeString('es-ES', { hour12: false })
      setLines((l) => [...l.slice(-9), { ...line, text: `${ts}  ${line.text}`, id: idRef.current++ }])
    }
    push(); push()
    const id = setInterval(push, 1400)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-black/50 backdrop-blur">
      <div className="flex items-center gap-2 border-b border-border/40 px-4 py-2.5">
        <Terminal className="size-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">ingesta — ESP01 → backend (en vivo)</span>
        <span className="ml-auto flex gap-1.5">
          <span className="size-2.5 rounded-full bg-rose-500/70" />
          <span className="size-2.5 rounded-full bg-amber-500/70" />
          <span className="size-2.5 rounded-full bg-emerald-500/70" />
        </span>
      </div>
      <div ref={boxRef} className="h-56 space-y-1.5 overflow-hidden p-4 font-mono text-[11px] leading-relaxed sm:text-xs">
        {lines.map((l) => (
          <p key={l.id} className={`animate-in fade-in slide-in-from-left-2 duration-300 ${toneClass[l.tone]}`}>
            {l.text}
          </p>
        ))}
      </div>
    </div>
  )
}
