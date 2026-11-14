import { AlertTriangle, CheckCheck, Info, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAckAlert } from '@/hooks/use-health'
import type { Alert } from '@/lib/api'

const sev = {
  critical: { icon: ShieldAlert, badge: 'destructive' as const, label: 'CRÍTICA' },
  warning: { icon: AlertTriangle, badge: 'warning' as const, label: 'ALERTA' },
  info: { icon: Info, badge: 'secondary' as const, label: 'INFO' },
}

export function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  const ack = useAckAlert()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="size-4" /> Alertas activas
        </CardTitle>
        <CardDescription>{alerts.length === 0 ? 'Sin alertas — todo nominal' : `${alerts.length} alerta(s) requieren atención`}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((a) => {
          const s = sev[a.severity]
          const Icon = s.icon
          return (
            <div key={a._id} className="flex items-start gap-3 rounded-lg border p-3">
              <Icon className={`mt-0.5 size-4 shrink-0 ${a.severity === 'critical' ? 'text-red-400' : a.severity === 'warning' ? 'text-amber-400' : 'text-muted-foreground'}`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant={s.badge}>{s.label}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(a.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="mt-1 text-sm">{a.message}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => ack.mutate(a._id)} disabled={ack.isPending}>
                <CheckCheck className="size-4" />
              </Button>
            </div>
          )
        })}
        {alerts.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">Todos los sistemas dentro de parámetros</p>
        )}
      </CardContent>
    </Card>
  )
}
