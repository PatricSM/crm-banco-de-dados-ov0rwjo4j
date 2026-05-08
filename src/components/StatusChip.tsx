import { cn } from '@/lib/utils'

export type StatusTone =
  | 'new'
  | 'scheduled'
  | 'in_treatment'
  | 'converted'
  | 'lost'
  | 'neutral'
  | 'pending'
  | 'approved'
  | 'cancelled'

interface StatusChipProps {
  status: string
  tone?: StatusTone
  className?: string
}

export function StatusChip({ status, tone = 'neutral', className }: StatusChipProps) {
  const tones: Record<StatusTone, string> = {
    new: 'bg-blue-100 text-blue-800 border-blue-200',
    scheduled: 'bg-amber-100 text-amber-800 border-amber-200',
    in_treatment: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    converted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    lost: 'bg-rose-100 text-rose-800 border-rose-200',
    neutral: 'bg-slate-100 text-slate-800 border-slate-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    approved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
  }

  return (
    <span
      className={cn(
        'px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap',
        tones[tone],
        className,
      )}
    >
      {status}
    </span>
  )
}
