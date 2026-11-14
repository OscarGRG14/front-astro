import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Metric } from '@/lib/api'
import type { LucideIcon } from 'lucide-react'

interface Props {
  title: string
  icon: LucideIcon
  latest?: Metric
  history?: Metric[]
  baseline?: number | null
  status?: 'ok' | 'warning' | 'critical'
  fallback?: string
}

export function VitalCard({ title, icon: Icon, latest, history = [], baseline, status = 'ok', fallback = '—' }: Props) {
  const data = [...history].reverse().map((m) => ({ v: m.value }))
  const statusStyle = {
    ok: 'text-emerald-400',
    warning: 'text-amber-400',
    critical: 'text-red-400',
  }[status]
  const chartColor = { ok: '#34d399', warning: '#fbbf24', critical: '#f87171' }[status]

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Icon className="size-4" /> {title}
        </CardTitle>
        {status !== 'ok' && (
          <Badge variant={status === 'critical' ? 'destructive' : 'warning'}>{status}</Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span className={cn('text-3xl font-bold tabular-nums', latest ? statusStyle : 'text-muted-foreground')}>
            {latest ? latest.value : fallback}
          </span>
          {latest && <span className="text-sm text-muted-foreground">{latest.unit}</span>}
          {baseline != null && (
            <span className="ml-auto text-xs text-muted-foreground">base: {baseline}</span>
          )}
        </div>
        {data.length > 1 && (
          <div className="mt-3 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id={`g-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColor} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={chartColor} strokeWidth={1.5}
                  fill={`url(#g-${title})`} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
