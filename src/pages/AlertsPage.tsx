import { useState } from 'react'
import { AlertTriangle, CheckCheck, CircleCheck, Info, ShieldAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAckAlert, useAlerts, useResolveAlert } from '@/hooks/use-health'

const sev = {
  critical: { icon: ShieldAlert, badge: 'destructive' as const, label: 'CRÍTICA', cls: 'text-red-400' },
  warning: { icon: AlertTriangle, badge: 'warning' as const, label: 'ALERTA', cls: 'text-amber-400' },
  info: { icon: Info, badge: 'secondary' as const, label: 'INFO', cls: 'text-muted-foreground' },
}
const statusLabel = { active: 'activa', acknowledged: 'reconocida', resolved: 'resuelta' }
type Severity = keyof typeof sev

export default function AlertsPage() {
  const [severity, setSeverity] = useState<Severity | ''>('')
  const [includeResolved, setIncludeResolved] = useState(false)
  const { data: alerts, isLoading } = useAlerts({ severity: severity || undefined, includeResolved })
  const ack = useAckAlert()
  const resolve = useResolveAlert()

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <ShieldAlert className="size-6" /> Alertas
          </h1>
          <p className="text-sm text-muted-foreground">Generadas por el motor de reglas clínicas</p>
        </div>
        <div className="flex items-center gap-2">
          {(['', 'critical', 'warning', 'info'] as const).map((s) => (
            <button key={s} onClick={() => setSeverity(s)}
              className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${severity === s ? 'border-primary bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-accent'}`}>
              {s === '' ? 'Todas' : sev[s].label}
            </button>
          ))}
          <label className="ml-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <input type="checkbox" checked={includeResolved} onChange={(e) => setIncludeResolved(e.target.checked)} className="accent-primary" />
            incluir resueltas
          </label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{alerts?.length ?? 0} alerta(s)</CardTitle>
          <CardDescription>Reconoce o resuelve desde aquí</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <div className="space-y-2"><Skeleton className="h-14" /><Skeleton className="h-14" /></div>}
          {alerts?.map((a) => {
            const s = sev[a.severity]
            const Icon = s.icon
            return (
              <div key={a._id} className={`flex items-start gap-3 rounded-lg border p-3 ${a.status !== 'active' ? 'opacity-50' : ''}`}>
                <Icon className={`mt-0.5 size-4 shrink-0 ${s.cls}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={s.badge}>{s.label}</Badge>
                    <Badge variant="outline">{statusLabel[a.status]}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.createdAt).toLocaleString('es', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{a.message}</p>
                </div>
                {a.status === 'active' && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" title="Reconocer" onClick={() => ack.mutate(a._id)} disabled={ack.isPending}>
                      <CheckCheck className="size-4" />
                    </Button>
                    <Button size="sm" variant="ghost" title="Resolver" onClick={() => resolve.mutate(a._id)} disabled={resolve.isPending}>
                      <CircleCheck className="size-4" />
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
          {!isLoading && !alerts?.length && (
            <p className="py-8 text-center text-sm text-muted-foreground">Sin alertas que coincidan con el filtro</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
