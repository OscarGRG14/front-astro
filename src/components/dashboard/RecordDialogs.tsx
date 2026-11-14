import { useState, type ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateMetric, useCreateRecord } from '@/hooks/use-health'

const VITAL_TYPES = [
  { value: 'heart_rate', label: 'Frec. cardíaca (bpm)' },
  { value: 'spo2', label: 'SpO2 (%)' },
  { value: 'blood_pressure_systolic', label: 'P. sistólica (mmHg)' },
  { value: 'blood_pressure_diastolic', label: 'P. diastólica (mmHg)' },
  { value: 'body_temperature', label: 'Temp. corporal (°C)' },
  { value: 'respiration_rate', label: 'Frec. respiratoria (rpm)' },
]

export function MetricDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState(VITAL_TYPES[0].value)
  const [value, setValue] = useState('')
  const create = useCreateMetric()

  const submit = async () => {
    await create.mutateAsync({ type, value: Number(value) })
    setOpen(false); setValue('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar signo vital</DialogTitle>
          <DialogDescription>Entrada manual — se evalúa contra el motor de alertas</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-input/30 px-3 text-sm">
              {VITAL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Valor</Label>
            <Input type="number" step="0.1" value={value} onChange={(e) => setValue(e.target.value)} />
          </div>
          <Button className="w-full" onClick={submit} disabled={!value || create.isPending}>
            {create.isPending ? 'Guardando…' : 'Registrar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ---- Cuestionarios de salud conductual ----
const OPTIONS = ['Nunca', 'Varios días', 'Más de la mitad', 'Casi siempre']

const INSTRUMENTS: Record<string, { label: string; desc: string; max: number; questions: string[] }> = {
  PHQ9: {
    label: 'PHQ-9', desc: 'Depresión · últimas 2 semanas', max: 27,
    questions: [
      'Poco interés o placer en hacer cosas',
      'Sentirse decaído/a, deprimido/a o sin esperanza',
      'Problemas para dormir o dormir demasiado',
      'Sentirse cansado/a o con poca energía',
      'Poco apetito o comer en exceso',
      'Sentirse mal consigo mismo/a',
      'Dificultad para concentrarse',
      'Moverse/hablar lento o estar inquieto/a',
      'Pensamientos de hacerse daño',
    ],
  },
  GAD7: {
    label: 'GAD-7', desc: 'Ansiedad · últimas 2 semanas', max: 21,
    questions: [
      'Sentirse nervioso/a, ansioso/a o con los nervios de punta',
      'No poder dejar de preocuparse',
      'Preocuparse demasiado por diferentes cosas',
      'Dificultad para relajarse',
      'Estar tan inquieto/a que es difícil quedarse quieto/a',
      'Irritarse o enfadarse fácilmente',
      'Sentir miedo como si algo terrible fuera a pasar',
    ],
  },
  PSS: {
    label: 'PSS', desc: 'Estrés percibido · último mes', max: 40,
    questions: [
      'Molestado/a por algo inesperado',
      'Incapaz de controlar lo importante de la vida',
      'Sentirse nervioso/a o estresado/a',
      'Confianza para manejar problemas personales',
      'Sentir que las cosas van bien',
      'No poder afrontar todo lo que hay que hacer',
      'Poder controlar las irritaciones',
      'Sentir que domina la situación',
      'Enfadado/a por cosas fuera de control',
      'Sentir que las dificultades se acumulan',
    ],
  },
}

export function MoodDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [instrument, setInstrument] = useState<keyof typeof INSTRUMENTS>('PHQ9')
  const [answers, setAnswers] = useState<number[]>(Array(INSTRUMENTS.PHQ9.questions.length).fill(0))
  const create = useCreateRecord('mood')

  const spec = INSTRUMENTS[instrument]
  const score = answers.reduce((a, b) => a + b, 0)

  const switchInstrument = (k: keyof typeof INSTRUMENTS) => {
    setInstrument(k)
    setAnswers(Array(INSTRUMENTS[k].questions.length).fill(0))
  }

  const submit = async () => {
    await create.mutateAsync({ instrument, score, answers })
    setOpen(false); switchInstrument('PHQ9')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cuestionario conductual — {spec.label}</DialogTitle>
          <DialogDescription>{spec.desc} — clave en aislamiento prolongado</DialogDescription>
        </DialogHeader>
        <div className="mb-2 flex gap-1">
          {(Object.keys(INSTRUMENTS) as (keyof typeof INSTRUMENTS)[]).map((k) => (
            <button key={k} type="button" onClick={() => switchInstrument(k)}
              className={`rounded-md border px-3 py-1.5 text-xs transition-colors ${instrument === k ? 'border-primary bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-accent'}`}>
              {INSTRUMENTS[k].label}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {spec.questions.map((q, i) => (
            <div key={i} className="space-y-1.5">
              <p className="text-sm">{i + 1}. {q}</p>
              <div className="grid grid-cols-4 gap-1">
                {OPTIONS.map((opt, v) => (
                  <button key={v} type="button" onClick={() => setAnswers((a) => a.map((x, j) => (j === i ? v : x)))}
                    className={`rounded-md border px-1 py-1.5 text-xs transition-colors ${answers[i] === v ? 'border-primary bg-primary/20 text-primary' : 'border-border text-muted-foreground hover:bg-accent'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-sm text-muted-foreground">Puntaje: <b className="text-foreground">{score}</b>/{spec.max}</span>
            <Button onClick={submit} disabled={create.isPending}>Enviar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SleepDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [duration, setDuration] = useState('')
  const [quality, setQuality] = useState(3)
  const create = useCreateRecord('sleep')

  const submit = async () => {
    await create.mutateAsync({ date: new Date().toISOString(), durationMinutes: Number(duration), quality })
    setOpen(false); setDuration('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Registrar sueño</DialogTitle><DialogDescription>Ciclo de descanso más reciente</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Duración (minutos)</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="420" /></div>
          <div className="space-y-2"><Label>Calidad (1-5)</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((q) => (
                <button key={q} type="button" onClick={() => setQuality(q)}
                  className={`flex-1 rounded-md border py-2 text-sm ${quality === q ? 'border-primary bg-primary/20 text-primary' : 'text-muted-foreground'}`}>{q}</button>
              ))}
            </div></div>
          <Button className="w-full" onClick={submit} disabled={!duration || create.isPending}>Registrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ExerciseDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState('resistencia')
  const [duration, setDuration] = useState('')
  const create = useCreateRecord('exercise')

  const submit = async () => {
    await create.mutateAsync({ date: new Date().toISOString(), exerciseType: type, durationMinutes: Number(duration) })
    setOpen(false); setDuration('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Registrar ejercicio</DialogTitle><DialogDescription>Contramedida contra pérdida ósea/muscular</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Tipo</Label>
            <select value={type} onChange={(e) => setType(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-input/30 px-3 text-sm">
              <option value="resistencia">Resistencia (ARED)</option>
              <option value="aerobico">Aeróbico (treadmill)</option>
              <option value="fuerza">Fuerza</option>
              <option value="movilidad">Movilidad</option>
              <option value="otro">Otro</option>
            </select></div>
          <div className="space-y-2"><Label>Duración (minutos)</Label>
            <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="60" /></div>
          <Button className="w-full" onClick={submit} disabled={!duration || create.isPending}>Registrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SymptomDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [severity, setSeverity] = useState(5)
  const create = useCreateRecord('symptoms')

  const submit = async () => {
    await create.mutateAsync({ description, severity, category: 'fisico' })
    setOpen(false); setDescription('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Reportar síntoma</DialogTitle><DialogDescription>Registro en el diario médico de la misión</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Descripción</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Dolor de cabeza leve…" /></div>
          <div className="space-y-2"><Label>Severidad (1-10): {severity}</Label>
            <input type="range" min={1} max={10} value={severity} onChange={(e) => setSeverity(Number(e.target.value))} className="w-full accent-primary" /></div>
          <Button className="w-full" onClick={submit} disabled={!description || create.isPending}>Reportar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
