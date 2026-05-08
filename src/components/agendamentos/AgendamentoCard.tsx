import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Agendamento } from '@/types'

export function AgendamentoCard({
  agendamento,
  compact = false,
}: {
  agendamento: Agendamento
  compact?: boolean
}) {
  const statusConfig: Record<string, string> = {
    Agendado: 'bg-blue-100 text-blue-800 border-blue-200',
    Confirmado: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Compareceu: 'bg-emerald-700 text-white border-emerald-800',
    'No-show': 'bg-rose-100 text-rose-800 border-rose-200',
    Cancelado: 'bg-gray-100 text-gray-500 border-gray-200 line-through',
  }
  const color = statusConfig[agendamento.status] || 'bg-slate-100 text-slate-800 border-slate-200'

  return (
    <div
      className={cn(
        'p-1.5 rounded text-xs border cursor-pointer hover:brightness-95 transition-all truncate shadow-sm',
        color,
      )}
    >
      <div className="font-semibold">{format(new Date(agendamento.data_inicio), 'HH:mm')}</div>
      <div className="truncate">{agendamento.expand?.lead_id?.nome || 'Lead'}</div>
      {!compact && agendamento.procedimento && (
        <div className="truncate opacity-80 text-[10px] mt-0.5">{agendamento.procedimento}</div>
      )}
    </div>
  )
}
