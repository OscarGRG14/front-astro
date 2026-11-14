import { BrainCircuit, RefreshCw, Sparkles } from 'lucide-react'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useGenerateInsight, useInsight } from '@/hooks/use-health'

const riskBadge = {
  bajo: 'success' as const,
  moderado: 'warning' as const,
  alto: 'warning' as const,
  critico: 'destructive' as const,
}

export function InsightCard({ astronautId }: { astronautId?: string }) {
  const { data, isLoading, isError, error } = useInsight(astronautId)
  const generate = useGenerateInsight(astronautId)
  const insight = data?.insight

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="size-4 text-primary" /> Análisis IA — Flight Surgeon
        </CardTitle>
        <CardDescription>Evaluación diaria generada por Gemini</CardDescription>
        <CardAction>
          <Button size="sm" variant="outline" onClick={() => generate.mutate()} disabled={generate.isPending}>
            <RefreshCw className={`size-3.5 ${generate.isPending ? 'animate-spin' : ''}`} /> Regenerar
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-4 w-2/3" /></div>
        )}
        {isError && (
          <p className="text-sm text-muted-foreground">
            No se pudo generar el insight: {error instanceof Error ? error.message : 'error desconocido'}
          </p>
        )}
        {insight && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant={riskBadge[insight.content.riskLevel] || 'secondary'}>
                riesgo {insight.content.riskLevel}
              </Badge>
              {data?.cached && <span className="text-xs text-muted-foreground">del día</span>}
            </div>
            <p className="text-sm leading-relaxed">{insight.content.summary}</p>
            {insight.content.recommendations?.length > 0 && (
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <Sparkles className="size-3" /> Recomendaciones
                </p>
                <ul className="space-y-1.5">
                  {insight.content.recommendations.slice(0, 4).map((r, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex gap-2">
                      <span className="text-primary">›</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
