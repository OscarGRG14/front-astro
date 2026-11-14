import { cn } from '@/lib/utils'

/** Anillo SVG con el score de salud 0-100 */
export function HealthScore({ score, size = 160 }: { score: number; size?: number }) {
  const stroke = 10
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? 'stroke-emerald-400' : score >= 50 ? 'stroke-amber-400' : 'stroke-red-400'
  const text = score >= 80 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke}
          className="stroke-secondary fill-none" />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          className={cn('fill-none transition-all duration-700', color)} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={cn('text-4xl font-bold tabular-nums', text)}>{score}</span>
        <span className="text-xs text-muted-foreground">health score</span>
      </div>
    </div>
  )
}
