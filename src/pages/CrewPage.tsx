import { Link } from 'react-router-dom'
import { ChevronRight, HeartPulse, ShieldAlert, Users, Wind } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCrew } from '@/hooks/use-health'

const sevBadge = {
  critical: { variant: 'destructive' as const, label: 'CRÍTICA' },
  warning: { variant: 'warning' as const, label: 'ALERTA' },
  info: { variant: 'secondary' as const, label: 'INFO' },
}

export default function CrewPage() {
  const { data: crew, isLoading } = useCrew()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Users className="size-6" /> Tripulación
        </h1>
        <p className="text-sm text-muted-foreground">Vista de control de misión — todos los astronautas</p>
      </div>

      {isLoading && <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-48" /><Skeleton className="h-48" /></div>}

      <div className="grid gap-4 md:grid-cols-2">
        {crew?.map((c) => {
          const hr = c.vitals.find((m) => m.type === 'heart_rate')
          const spo2 = c.vitals.find((m) => m.type === 'spo2')
          const sev = c.worstSeverity ? sevBadge[c.worstSeverity] : null
          const scoreColor = c.healthScore >= 80 ? 'text-emerald-400' : c.healthScore >= 50 ? 'text-amber-400' : 'text-red-400'

          return (
            <Card key={c.astronaut.id} className="transition-colors hover:border-primary/40">
              <Link to={`/app/astronaut/${c.astronaut.id}`} className="block">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback className="bg-primary/20 text-primary">
                    {c.astronaut.nombre.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                  </AvatarFallback></Avatar>
                  <div>
                    <CardTitle className="text-base">{c.astronaut.nombre}</CardTitle>
                    <p className="text-xs text-muted-foreground">Astronauta</p>
                  </div>
                  {sev && <Badge variant={sev.variant} className="ml-auto">{sev.label}</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-3xl font-bold tabular-nums ${scoreColor}`}>{c.healthScore}</p>
                    <p className="text-xs text-muted-foreground">health score</p>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <span className="flex items-center gap-1.5">
                      <HeartPulse className="size-4 text-muted-foreground" />
                      <b className="tabular-nums">{hr?.value ?? '—'}</b> bpm
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Wind className="size-4 text-muted-foreground" />
                      <b className="tabular-nums">{spo2?.value ?? '—'}</b> %
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ShieldAlert className="size-4 text-muted-foreground" />
                      <b className="tabular-nums">{c.activeAlertCount}</b> alertas
                    </span>
                  </div>
                  <ChevronRight className="mt-3 size-4 text-muted-foreground" />
                </div>
              </CardContent>
              </Link>
            </Card>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Vista de cada astronauta disponible en <Link to="/app" className="text-primary hover:underline">Panel de Salud</Link> con ?astronautId en la API.
      </p>
    </div>
  )
}
