import { useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { LineChart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useMetricHistory } from '@/hooks/use-health'
import { useAuth } from '@/lib/auth'

const GROUPS = [
  { label: 'Vitales', types: ['heart_rate', 'spo2', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'body_temperature', 'respiration_rate'] },
  { label: 'Ambiente', types: ['co2', 'humidity', 'ambient_temperature', 'radiation_dose'] },
]
const LABELS: Record<string, string> = {
  heart_rate: 'Frec. cardíaca', spo2: 'SpO2', blood_pressure_systolic: 'P. sistólica',
  blood_pressure_diastolic: 'P. diastólica', body_temperature: 'Temp. corporal', respiration_rate: 'Frec. respiratoria',
  co2: 'CO2', humidity: 'Humedad', ambient_temperature: 'Temp. cabina', radiation_dose: 'Radiación',
}

export default function MetricsPage() {
  const { user } = useAuth()
  const [type, setType] = useState('heart_rate')
  const [limit, setLimit] = useState(200)
  const scope = GROUPS[1].types.includes(type) ? 'environment' : 'vital'
  const { data, isLoading } = useMetricHistory(type, limit, { scope })

  const chart = useMemo(() =>
    [...(data || [])].reverse().map((m) => ({
      t: new Date(m.recordedAt).toLocaleString('es', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      v: m.value,
    })), [data])

  const stats = useMemo(() => {
    if (!data?.length) return null
    const vals = data.map((m) => m.value)
    return {
      count: vals.length,
      avg: (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1),
      min: Math.min(...vals), max: Math.max(...vals),
      unit: data[0].unit,
    }
  }, [data])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <LineChart className="size-6" /> Historial de métricas
        </h1>
        <p className="text-sm text-muted-foreground">Series temporales de telemetría</p>
      </div>

      {/* Selectores */}
      <div className="flex flex-wrap items-center gap-2">
        {GROUPS.map((g) => (
          <div key={g.label} className="flex flex-wrap items-center gap-1">
            <span className="mr-1 text-xs text-muted-foreground">{g.label}:</span>
            {g.types.map((t) => (
              <button key={t} onClick={() => setType(t)}
                className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${type === t ? 'border-primary bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-accent'}`}>
                {LABELS[t]}
              </button>
            ))}
          </div>
        ))}
        <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}
          className="ml-auto h-8 rounded-md border border-input bg-input/30 px-2 text-xs">
          <option value={50}>50 lecturas</option>
          <option value={200}>200 lecturas</option>
          <option value={500}>500 lecturas</option>
        </select>
      </div>

      {/* Stats */}
      {stats && (
        <div className="flex flex-wrap gap-6 text-sm">
          <span>n: <b className="tabular-nums">{stats.count}</b></span>
          <span>prom: <b className="tabular-nums">{stats.avg} {stats.unit}</b></span>
          <span>mín: <b className="tabular-nums">{stats.min}</b></span>
          <span>máx: <b className="tabular-nums">{stats.max}</b></span>
          {scope === 'environment' && <Badge variant="secondary">ambiente cabina</Badge>}
          {user?.role === 'astronaut' && scope === 'vital' && <Badge variant="secondary">tus datos</Badge>}
        </div>
      )}

      {/* Gráfica */}
      <Card>
        <CardHeader>
          <CardTitle>{LABELS[type]}</CardTitle>
          <CardDescription>{stats ? `${stats.count} lecturas` : 'Cargando…'}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <Skeleton className="h-72 w-full" /> : chart.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Sin datos para este tipo</p>
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chart} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                  <defs>
                    <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#67e8f9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#8b9bab' }} minTickGap={40} />
                  <YAxis tick={{ fontSize: 10, fill: '#8b9bab' }} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ background: 'oklch(0.17 0.02 265)', border: '1px solid oklch(0.27 0.02 265)', borderRadius: 8, fontSize: 12 }}
                    labelStyle={{ color: '#8b9bab' }} />
                  <Area type="monotone" dataKey="v" stroke="#67e8f9" strokeWidth={1.5} fill="url(#gv)" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
