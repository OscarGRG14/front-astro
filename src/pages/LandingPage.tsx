import { Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { animate, stagger } from 'animejs'
import {
  Activity, ArrowRight, BookOpen, BrainCircuit, Cpu, ExternalLink, Gauge, HeartPulse, Moon,
  Radiation, Rocket, Satellite, ShieldAlert, Signal, Users, Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Starfield } from '@/components/landing/Starfield'
import { OrbitVisual } from '@/components/landing/OrbitVisual'
import { TelemetryStrip } from '@/components/landing/TelemetryStrip'
import { IngestConsole } from '@/components/landing/IngestConsole'
import { REFERENCES, REFERENCE_CATEGORIES } from '@/data/references'

// ---------- datos ----------
const hazards = [
  { icon: Radiation, label: 'Radiación espacial', desc: 'Dosimetría acumulada contra el límite de misión, con alertas progresivas.' },
  { icon: HeartPulse, label: 'Eventos cardiovasculares', desc: 'HR, SpO2, presión arterial y temperatura monitoreados cada pocos segundos.' },
  { icon: Activity, label: 'Pérdida ósea y muscular', desc: 'Adherencia al ejercicio contramedida y tendencias de bienestar físico.' },
  { icon: Moon, label: 'Aislamiento y confinamiento', desc: 'PHQ-9, GAD-7, sueño y síntomas — la salud mental también es telemetría.' },
]

const steps = [
  { n: '01', t: 'Captura', d: 'ESP-01/ESP32 con MAX30102 y sensores de cabina envían lecturas por HTTPS con API key por dispositivo.', icon: Cpu },
  { n: '02', t: 'Evaluación', d: 'Motor de reglas clínicas dispara alertas por umbral o acumulado — con anti-spam y auto-resolución.', icon: Gauge },
  { n: '03', t: 'Análisis IA', d: 'Gemini sintetiza vitales + bienestar + alertas en un reporte accionable con nivel de riesgo.', icon: BrainCircuit },
  { n: '04', t: 'Acción', d: 'El astronauta actúa a bordo; control de misión supervisa toda la tripulación en tiempo real.', icon: Zap },
]

const features = [
  { icon: Signal, title: 'Tiempo real por WebSocket', desc: 'Socket.IO empuja métricas y alertas al panel en el instante en que el sensor las reporta.' },
  { icon: ShieldAlert, title: 'Motor de alertas clínicas', desc: 'Umbrales por severidad, anti-duplicación y auto-resolución cuando el valor se normaliza.' },
  { icon: BrainCircuit, title: 'Flight Surgeon IA', desc: 'Insights diarios generados por Gemini: resumen, riesgo y recomendaciones concretas.' },
  { icon: Moon, title: 'Salud conductual', desc: 'Cuestionarios PHQ-9/GAD-7/PSS integrados al score — porque el aislamiento también se mide.' },
  { icon: Users, title: 'Tres roles, una misión', desc: 'Astronauta se auto-monitorea, médico supervisa la tripulación, admin gestiona dispositivos.' },
  { icon: Satellite, title: 'Hardware real', desc: 'Firmware ESP8266/ESP32 con reintentos y auth por API key hasheada — no es un mock.' },
]

const stats = [
  { value: 4, suffix: '', label: 'riesgos de la NASA cubiertos' },
  { value: 12, suffix: '+', label: 'tipos de métricas telemetradas' },
  { value: 1, prefix: '<', suffix: 's', label: 'latencia sensor → pantalla' },
  { value: 3, suffix: '', label: 'roles con paneles dedicados' },
]

// ---------- helpers de animación ----------
function Reveal({ children, delay = 0, className = '', y = 28 }: {
  children: ReactNode; delay?: number; className?: string; y?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current!
    el.style.opacity = '0'
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        animate(el, { opacity: [0, 1], translateY: [y, 0], delay, duration: 900, ease: 'outExpo' })
        io.disconnect()
      }
    }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [delay, y])
  return <div ref={ref} className={className}>{children}</div>
}

function Counter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current!
    const obj = { v: 0 }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        animate(obj, {
          v: value, duration: 1600, ease: 'outExpo',
          onUpdate: () => { el.textContent = `${prefix}${Math.round(obj.v)}${suffix}` },
        })
        io.disconnect()
      }
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [value, prefix, suffix])
  return <span ref={ref}>0</span>
}

function useSystemStatus() {
  const [online, setOnline] = useState<boolean | null>(null)
  useEffect(() => {
    fetch('/api/health').then((r) => setOnline(r.ok)).catch(() => setOnline(false))
  }, [])
  return online
}

// ---------- página ----------
export default function LandingPage() {
  const status = useSystemStatus()
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    // reveal del título letra por letra
    if (!titleRef.current) return
    animate(titleRef.current.querySelectorAll('.hl'), {
      opacity: [0, 1],
      translateY: [26, 0],
      rotateX: [40, 0],
      delay: stagger(28, { start: 150 }),
      duration: 800,
      ease: 'outExpo',
    })
    // subtítulo y CTAs
    animate('.hero-fade', {
      opacity: [0, 1], translateY: [20, 0],
      delay: stagger(140, { start: 900 }), duration: 900, ease: 'outExpo',
    })
  }, [])

  const title1 = 'La salud de la tripulación,'
  const title2 = 'en tiempo real.'

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      <Starfield />
      {/* nebulosa de fondo */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute top-[60%] -left-40 h-[400px] w-[500px] rounded-full bg-emerald-500/8 blur-[140px]" />

      {/* ===== Nav ===== */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Satellite className="size-5 text-primary" />
            <span className="font-semibold tracking-tight">AstroHealth</span>
            <Badge variant="outline" className="ml-2 hidden text-[10px] sm:inline-flex">NASA Space Apps</Badge>
          </div>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground md:flex">
            <a href="#riesgos" className="transition-colors hover:text-foreground">Riesgos</a>
            <a href="#sistema" className="transition-colors hover:text-foreground">Sistema</a>
            <a href="#referencias" className="transition-colors hover:text-foreground">Referencias</a>
          </nav>
          <div className="flex items-center gap-3">
            {status !== null && (
              <span className="hidden items-center gap-1.5 text-xs sm:flex">
                <span className={`size-1.5 rounded-full ${status ? 'animate-pulse bg-emerald-400' : 'bg-rose-500'}`} />
                <span className={status ? 'text-emerald-400' : 'text-rose-400'}>
                  {status ? 'SISTEMA OPERATIVO' : 'SISTEMA OFFLINE'}
                </span>
              </span>
            )}
            <Button asChild size="sm"><Link to="/login">Acceder a la consola</Link></Button>
          </div>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section className="relative mx-auto max-w-6xl px-6 pb-10 pt-14 lg:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div className="text-center lg:text-left">
            <Reveal y={12}>
              <Badge variant="secondary" className="mb-6 gap-1.5 border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                <Rocket className="size-3" /> Misión AURA-01 · Monitoreo autónomo de salud
              </Badge>
            </Reveal>
            <h1 ref={titleRef} className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl" style={{ perspective: '600px' }}>
              <TitleWords text={title1} />
              <br />
              <TitleWords text={title2} gradient />
            </h1>
            <p className="hero-fade mx-auto mt-6 max-w-xl text-lg text-muted-foreground opacity-0 lg:mx-0">
              En misiones de larga duración el astronauta es su propio médico.
              AstroHealth integra wearables, ambiente de cabina y bienestar conductual
              con alertas clínicas e insights generados por IA.
            </p>
            <div className="hero-fade mt-8 flex items-center justify-center gap-3 opacity-0 lg:justify-start">
              <Button asChild size="lg" className="gap-2 shadow-[0_0_30px_-8px_rgba(34,211,238,0.6)]">
                <Link to="/login">Ver demo en vivo <ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="http://localhost:3000/api/docs" target="_blank" rel="noreferrer">API Docs</a>
              </Button>
            </div>
          </div>
          <OrbitVisual />
        </div>

        <Reveal delay={200} className="mt-12">
          <TelemetryStrip />
        </Reveal>
      </section>

      {/* ===== Consola de ingesta ===== */}
      <section id="sistema" className="relative mx-auto max-w-6xl scroll-mt-20 px-6 py-14">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Del hardware al panel, <span className="text-cyan-300">en milisegundos</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              El ESP-01 reporta cada lectura por HTTPS con autenticación por API key.
              El backend valida, almacena, evalúa reglas clínicas y empuja todo por
              WebSocket — sin tocar un botón de refresh.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm">
              {[
                'Ingesta por lotes: el firmware tolera desconexiones como una misión real',
                'API keys hasheadas — el secreto solo se muestra una vez',
                'Alertas con anti-spam y auto-resolución al normalizarse',
              ].map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Zap className="mt-0.5 size-4 shrink-0 text-cyan-300" /> {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={150}>
            <IngestConsole />
          </Reveal>
        </div>
      </section>

      {/* ===== Stats ===== */}
      <section className="relative border-y border-border/40 bg-card/20 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 py-10 sm:grid-cols-4">
          {stats.map((s) => (
            <Reveal key={s.label} className="text-center">
              <p className="font-mono text-4xl font-bold text-cyan-300">
                <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Los 4 riesgos ===== */}
      <section id="riesgos" className="relative mx-auto max-w-6xl scroll-mt-20 px-6 py-16">
        <Reveal className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-300">El desafío NASA</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Cuatro amenazas del espacio profundo, cubiertas
          </h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hazards.map((h, i) => (
            <Reveal key={h.label} delay={i * 100}>
              <Card className="group h-full border-border/60 bg-card/50 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_8px_40px_-12px_rgba(34,211,238,0.35)]">
                <CardHeader>
                  <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-300 transition-colors group-hover:bg-cyan-400/20">
                    <h.icon className="size-5" />
                  </div>
                  <CardTitle className="text-base">{h.label}</CardTitle>
                </CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{h.desc}</p></CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Pipeline ===== */}
      <section className="relative mx-auto max-w-6xl px-6 py-14">
        <Reveal className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Del sensor a la decisión</h2>
          <p className="mt-2 text-muted-foreground">Cuatro etapas, un flujo continuo</p>
        </Reveal>
        <div className="relative grid gap-8 md:grid-cols-4">
          {/* línea conectora animada */}
          <PipelineLine />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 150} className="relative">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-400/10 text-cyan-300">
                  <s.icon className="size-5" />
                </div>
                <span className="font-mono text-xs text-cyan-300/70">{s.n}</span>
              </div>
              <p className="font-semibold">{s.t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Features ===== */}
      <section className="relative mx-auto max-w-6xl px-6 py-14">
        <Reveal className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Construido como sistema de misión</h2>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 100}>
              <Card className="h-full border-border/60 bg-card/50 backdrop-blur transition-colors hover:border-primary/40">
                <CardHeader>
                  <f.icon className="size-5 text-primary" />
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{f.desc}</p></CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== Referencias ===== */}
      <section id="referencias" className="relative mx-auto max-w-6xl scroll-mt-20 px-6 py-16">
        <Reveal className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan-300">Fundamento científico</p>
          <h2 className="mt-2 flex items-center justify-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <BookOpen className="size-6 text-primary" /> Fuentes & Referencias
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-muted-foreground">
            Los umbrales de alertas, la taxonomía de riesgos y los instrumentos conductuales
            se basan en documentación pública de la NASA y literatura clínica validada —
            todo de acceso abierto.
          </p>
        </Reveal>
        <div className="grid gap-8 md:grid-cols-2">
          {REFERENCE_CATEGORIES.map((cat, ci) => (
            <Reveal key={cat} delay={ci * 100}>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-cyan-300">
                <span className="h-px w-6 bg-cyan-400/40" /> {cat}
              </h3>
              <ol className="space-y-3">
                {REFERENCES.filter((r) => r.category === cat).map((r) => (
                  <li key={r.id}>
                    <a href={r.url} target="_blank" rel="noreferrer"
                      className="group flex gap-3 rounded-lg border border-transparent p-2.5 -m-2.5 transition-colors hover:border-cyan-400/25 hover:bg-cyan-400/5">
                      <span className="mt-0.5 font-mono text-xs text-cyan-300/60">[{r.id}]</span>
                      <div className="min-w-0">
                        <p className="flex flex-wrap items-center gap-2 text-sm font-medium leading-snug">
                          {r.title}
                          <ExternalLink className="size-3 shrink-0 text-muted-foreground transition-colors group-hover:text-cyan-300" />
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">{r.detail}</p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground/60">{r.source}</p>
                      </div>
                    </a>
                  </li>
                ))}
              </ol>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ===== CTA final ===== */}
      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/10 via-card to-emerald-500/10 px-8 py-14 text-center">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-cyan-400/15 blur-[100px]" />
            <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
              La tripulación ya está transmitiendo
            </h2>
            <p className="relative mx-auto mt-3 max-w-lg text-muted-foreground">
              Entra a la consola, mira las vitales en vivo, provoca una alerta y
              deja que el cirujano de vuelo IA la interprete.
            </p>
            <Button asChild size="lg" className="relative mt-7 gap-2 shadow-[0_0_40px_-10px_rgba(34,211,238,0.7)]">
              <Link to="/login">Abrir consola de misión <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
        </Reveal>
      </section>

      <Separator className="mx-auto max-w-6xl opacity-50" />
      <footer className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-xs text-muted-foreground sm:flex-row">
        <span>AstroHealth — NASA Space Apps Challenge 2026</span>
        <span className="font-mono">React · Express · MongoDB · ESP8266 · Gemini · Socket.IO</span>
      </footer>
    </div>
  )
}


/** Título del hero: letras animadas agrupadas por palabra para que el
 *  salto de línea solo ocurra entre palabras (no dentro de ellas). */
function TitleWords({ text, gradient = false }: { text: string; gradient?: boolean }) {
  const words = text.split(' ')
  let offset = 0
  return (
    <>
      {words.map((word, wi) => {
        const start = offset
        offset += word.length + 1
        return (
          <Fragment key={wi}>
            <span className="inline-block whitespace-nowrap">
              {word.split('').map((c, li) => {
                const i = start + li
                return (
                  <span key={li} className="hl inline-block opacity-0" style={gradient ? {
                    transformStyle: 'preserve-3d',
                    backgroundImage: 'linear-gradient(90deg, #67e8f9, #5eead4, #34d399)',
                    backgroundSize: `${text.length * 100}% 100%`,
                    backgroundPositionX: `${(i / Math.max(text.length - 1, 1)) * 100}%`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  } : { transformStyle: 'preserve-3d' }}>{c}</span>
                )
              })}
            </span>
            {wi < words.length - 1 ? ' ' : null}
          </Fragment>
        )
      })}
    </>
  )
}

/** Línea punteada horizontal que se dibuja al entrar en viewport (solo md+). */
function PipelineLine() {
  const ref = useRef<SVGLineElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const len = el.getTotalLength()
    el.style.strokeDasharray = `${len}`
    el.style.strokeDashoffset = `${len}`
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        animate(el, { strokeDashoffset: [len, 0], duration: 2000, ease: 'inOutSine' })
        io.disconnect()
      }
    }, { threshold: 0.4 })
    io.observe(el.parentElement!)
    return () => io.disconnect()
  }, [])

  return (
    <svg className="pointer-events-none absolute -top-1 left-0 hidden h-px w-full md:block" aria-hidden>
      <line ref={ref} x1="0" y1="0" x2="100%" y2="0" stroke="rgba(34,211,238,0.35)" strokeWidth="2" />
    </svg>
  )
}
