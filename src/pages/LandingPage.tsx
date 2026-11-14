import { Link } from 'react-router-dom'
import { Activity, ArrowRight, BrainCircuit, Cpu, HeartPulse, Moon, Radiation, ShieldAlert, Satellite } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const features = [
  { icon: HeartPulse, title: 'Telemetría en vivo', desc: 'Signos vitales capturados por sensores ESP32 cada pocos segundos, con historial completo.' },
  { icon: ShieldAlert, title: 'Motor de alertas', desc: 'Reglas clínicas por umbrales y tendencias. SpO2, frecuencia cardíaca, CO2 en cabina, radiación acumulada.' },
  { icon: BrainCircuit, title: 'Flight Surgeon IA', desc: 'Gemini analiza el contexto completo y genera recomendaciones accionables a bordo.' },
  { icon: Moon, title: 'Salud conductual', desc: 'Cuestionarios PHQ-9/GAD-7, sueño y síntomas — porque el aislamiento también se monitorea.' },
]

const hazards = [
  { icon: Radiation, label: 'Radiación espacial', value: 'dosis acumulada vs. límite de misión' },
  { icon: HeartPulse, label: 'Cardiovascular', value: 'HR, SpO2, presión arterial en tiempo real' },
  { icon: Activity, label: 'Pérdida ósea', value: 'adherencia a ejercicio contramedida' },
  { icon: Moon, label: 'Aislamiento', value: 'ánimo, sueño y estrés percibido' },
]

export default function LandingPage() {
  return (
    <div className="starfield min-h-screen">
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <Satellite className="size-5 text-primary" />
          <span className="font-semibold tracking-tight">AstroHealth</span>
          <Badge variant="outline" className="ml-2 text-xs">NASA Space Apps</Badge>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/login">Acceder a la consola</Link>
        </Button>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
        <Badge variant="secondary" className="mb-6">Misión AURA-01 · Monitoreo autónomo de salud</Badge>
        <h1 className="mx-auto max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
          La salud de la tripulación,{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            en tiempo real
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          En misiones de larga duración el astronauta es su propio médico. AstroHealth integra
          sensores wearable, ambiente de cabina y bienestar conductual con alertas clínicas
          e insights generados por IA.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/login">Ver demo en vivo <ArrowRight className="size-4" /></Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="http://localhost:3000/api/docs" target="_blank" rel="noreferrer">API Docs</a>
          </Button>
        </div>
      </section>

      {/* Los 4 riesgos del challenge */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hazards.map((h) => (
            <Card key={h.label} className="bg-card/60 backdrop-blur">
              <CardHeader>
                <h.icon className="size-5 text-primary" />
                <CardTitle className="text-base">{h.label}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{h.value}</p></CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <Card className="bg-card/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Cpu className="size-5 text-primary" /> Del sensor a la decisión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              {[
                { n: '01', t: 'Captura', d: 'ESP32 + MAX30102 y sensores de cabina envían lecturas por HTTP con API key.' },
                { n: '02', t: 'Evaluación', d: 'Motor de reglas clínicas dispara alertas por umbral, tendencia o acumulado.' },
                { n: '03', t: 'Análisis IA', d: 'Gemini sintetiza vitales + bienestar en un reporte diario accionable.' },
                { n: '04', t: 'Acción', d: 'El astronauta actúa; control de misión supervisa toda la tripulación.' },
              ].map((s) => (
                <div key={s.n}>
                  <p className="font-mono text-xs text-primary">{s.n}</p>
                  <p className="mt-1 font-medium">{s.t}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <Card key={f.title} className="bg-card/60 backdrop-blur">
              <CardHeader>
                <f.icon className="size-5 text-primary" />
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{f.desc}</p></CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="mx-auto max-w-6xl opacity-50" />
      <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-muted-foreground">
        <span>AstroHealth — NASA Space Apps Challenge 2026</span>
        <span>React · Express · MongoDB · ESP32 · Gemini</span>
      </footer>
    </div>
  )
}
