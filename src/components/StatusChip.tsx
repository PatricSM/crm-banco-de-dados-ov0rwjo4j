import { cn } from '@/lib/utils'

export type StatusTone = 'new' | 'scheduled' | 'in_treatment' | 'converted' | 'lost' | 'neutral'

const toneClasses: Record<StatusTone, string> = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  scheduled: 'bg-purple-100 text-purple-800 border-purple-200',
  in_treatment: 'bg-amber-100 text-amber-800 border-amber-200',
  converted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  lost: 'bg-rose-100 text-rose-800 border-rose-200',
  neutral: 'bg-slate-100 text-slate-800 border-slate-200',
}

export function StatusChip({
  tone,
  label,
  className,
}: {
  tone: StatusTone
  label: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border whitespace-nowrap',
        toneClasses[tone],
        className,
      )}
    >
      {label}
    </span>
  )
}
