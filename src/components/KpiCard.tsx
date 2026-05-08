import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon, ArrowUp, ArrowDown } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  trend?: {
    direction: 'up' | 'down'
    value: string
  }
  className?: string
}

export function KpiCard({ label, value, hint, icon: Icon, trend, className }: KpiCardProps) {
  return (
    <Card className={cn('p-6 shadow-soft flex flex-col justify-between gap-4', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="text-display text-primary tabular-nums">{value}</div>
        </div>
        {Icon && (
          <div className="size-10 bg-primary/5 rounded-lg flex items-center justify-center shrink-0">
            <Icon className="size-5 text-primary" />
          </div>
        )}
      </div>

      {(hint || trend) && (
        <div className="flex items-center gap-2 text-sm">
          {trend && (
            <span
              className={cn(
                'flex items-center font-medium',
                trend.direction === 'up' ? 'text-emerald-600' : 'text-destructive',
              )}
            >
              {trend.direction === 'up' ? (
                <ArrowUp className="size-4 mr-0.5" />
              ) : (
                <ArrowDown className="size-4 mr-0.5" />
              )}
              {trend.value}
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </Card>
  )
}
