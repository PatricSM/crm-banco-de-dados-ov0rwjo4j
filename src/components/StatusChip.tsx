import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

export type StatusTone = 'new' | 'scheduled' | 'in_treatment' | 'converted' | 'lost' | 'neutral'

interface StatusChipProps {
  tone: StatusTone
  label: string
  icon?: LucideIcon
  className?: string
}

const toneMap: Record<StatusTone, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  scheduled: 'bg-violet-50 text-violet-700 border-violet-200',
  in_treatment: 'bg-amber-50 text-amber-700 border-amber-200',
  converted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lost: 'bg-rose-50 text-rose-700 border-rose-200',
  neutral: 'bg-muted text-muted-foreground border-border',
}

export function StatusChip({ tone, label, icon: Icon, className }: StatusChipProps) {
  return (
    <div
      className={cn(
        'rounded-full inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium border',
        toneMap[tone],
        className,
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </div>
  )
}
