import { BedDouble, Dumbbell, HeartCrack, Stethoscope } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRecords } from '@/hooks/use-health'
import type { ExerciseLog, MoodRecord, SleepLog, SymptomRecord } from '@/lib/api'

const fmt = (d: string) => new Date(d).toLocaleString('es', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
const qualityLabel = ['—', 'muy mala', 'mala', 'regular', 'buena', 'excelente']

function List({ children, loading, empty }: { children: React.ReactNode; loading: boolean; empty: boolean }) {
  if (loading) return <div className="space-y-2"><Skeleton className="h-14" /><Skeleton className="h-14" /><Skeleton className="h-14" /></div>
  if (empty) return <p className="py-8 text-center text-sm text-muted-foreground">Sin registros aún</p>
  return <div className="space-y-2">{children}</div>
}

function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div className="text-sm">{left}</div>
      <div className="text-xs text-muted-foreground">{right}</div>
    </div>
  )
}

export default function RecordsPage() {
  const sleep = useRecords('sleep')
  const exercise = useRecords('exercise')
  const mood = useRecords('mood')
  const symptoms = useRecords('symptoms')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registros de bienestar</h1>
        <p className="text-sm text-muted-foreground">Sueño, ejercicio contramedida, salud conductual y síntomas</p>
      </div>

      <Tabs defaultValue="sleep">
        <TabsList>
          <TabsTrigger value="sleep"><BedDouble className="size-4" /> Sueño</TabsTrigger>
          <TabsTrigger value="exercise"><Dumbbell className="size-4" /> Ejercicio</TabsTrigger>
          <TabsTrigger value="mood"><Stethoscope className="size-4" /> Ánimo</TabsTrigger>
          <TabsTrigger value="symptoms"><HeartCrack className="size-4" /> Síntomas</TabsTrigger>
        </TabsList>

        <TabsContent value="sleep">
          <Card>
            <CardHeader><CardTitle className="text-base">Sueño</CardTitle><CardDescription>Ciclos de descanso registrados</CardDescription></CardHeader>
            <CardContent>
              <List loading={sleep.isLoading} empty={!sleep.data?.length}>
                {(sleep.data as SleepLog[] | undefined)?.map((s) => (
                  <Row key={s._id}
                    left={<span><b className="tabular-nums">{Math.floor(s.durationMinutes / 60)}h {s.durationMinutes % 60}m</b>
                      {s.quality != null && <Badge variant="secondary" className="ml-2">{qualityLabel[s.quality]}</Badge>}
                      {s.awakenings ? <span className="ml-2 text-muted-foreground">{s.awakenings} despertares</span> : null}</span>}
                    right={fmt(s.date)} />
                ))}
              </List>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exercise">
          <Card>
            <CardHeader><CardTitle className="text-base">Ejercicio contramedida</CardTitle><CardDescription>Sesiones contra pérdida ósea/muscular</CardDescription></CardHeader>
            <CardContent>
              <List loading={exercise.isLoading} empty={!exercise.data?.length}>
                {(exercise.data as ExerciseLog[] | undefined)?.map((e) => (
                  <Row key={e._id}
                    left={<span><b className="capitalize">{e.exerciseType}</b> · {e.durationMinutes} min
                      <Badge variant="secondary" className="ml-2">{e.intensity}</Badge></span>}
                    right={fmt(e.date)} />
                ))}
              </List>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mood">
          <Card>
            <CardHeader><CardTitle className="text-base">Cuestionarios conductuales</CardTitle><CardDescription>PHQ-9, GAD-7, PSS</CardDescription></CardHeader>
            <CardContent>
              <List loading={mood.isLoading} empty={!mood.data?.length}>
                {(mood.data as MoodRecord[] | undefined)?.map((m) => (
                  <Row key={m._id}
                    left={<span><Badge variant="outline">{m.instrument}</Badge>
                      <b className={`ml-2 tabular-nums ${m.score >= 15 ? 'text-red-400' : m.score >= 10 ? 'text-amber-400' : ''}`}>{m.score} pts</b>
                      {m.notes && <span className="ml-2 text-muted-foreground">{m.notes}</span>}</span>}
                    right={fmt(m.recordedAt)} />
                ))}
              </List>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms">
          <Card>
            <CardHeader><CardTitle className="text-base">Diario de síntomas</CardTitle><CardDescription>Reportados por la tripulación</CardDescription></CardHeader>
            <CardContent>
              <List loading={symptoms.isLoading} empty={!symptoms.data?.length}>
                {(symptoms.data as SymptomRecord[] | undefined)?.map((s) => (
                  <Row key={s._id}
                    left={<span>{s.description}
                      <Badge variant={s.severity && s.severity >= 7 ? 'warning' : 'secondary'} className="ml-2">sev {s.severity}</Badge></span>}
                    right={fmt(s.recordedAt)} />
                ))}
              </List>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
