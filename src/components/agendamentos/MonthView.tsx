import { cn } from '@/lib/utils'
import { isSameMonth, isSameDay, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getMonthGrid } from '@/lib/calendar'
import { AgendamentoCard } from './AgendamentoCard'
import { Agendamento } from '@/types'

export function MonthView({ currentDate, agendamentos, onDateClick, onAgendamentoClick }: any) {
  const grid = getMonthGrid(currentDate)
  return (
    <div className="grid grid-cols-2 md:grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
        <div
          key={day}
          className="bg-slate-50 py-2 text-center text-xs font-semibold text-slate-500 uppercase hidden md:block"
        >
          {day}
        </div>
      ))}
      {grid.map((date, i) => {
        const dayApts = agendamentos.filter((a: Agendamento) =>
          isSameDay(new Date(a.data_inicio), date),
        )
        return (
          <div
            key={i}
            className={cn(
              'min-h-[120px] bg-white p-2 cursor-pointer hover:bg-slate-50 transition-colors',
              !isSameMonth(date, currentDate) && 'bg-slate-50 text-slate-400',
            )}
            onClick={() => onDateClick(date)}
          >
            <div className="text-sm font-medium mb-1 flex justify-between items-center">
              <span>{format(date, 'd')}</span>
              <span className="md:hidden text-xs">{format(date, 'EEE', { locale: ptBR })}</span>
            </div>
            <div className="space-y-1">
              {dayApts.map((a: Agendamento) => (
                <div
                  key={a.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onAgendamentoClick(a)
                  }}
                >
                  <AgendamentoCard agendamento={a} compact />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
