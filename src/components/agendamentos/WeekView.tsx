import { format, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getWeekGrid } from '@/lib/calendar'
import { AgendamentoCard } from './AgendamentoCard'
import { Agendamento } from '@/types'

export function WeekView({ currentDate, agendamentos, onAgendamentoClick }: any) {
  const grid = getWeekGrid(currentDate)
  const hours = Array.from({ length: 17 }, (_, i) => i + 6) // 6 to 22

  return (
    <div className="flex flex-col border rounded-lg overflow-auto h-[600px] bg-white">
      <div className="flex border-b sticky top-0 bg-white z-20 shadow-sm">
        <div className="w-16 flex-shrink-0 border-r bg-slate-50" />
        <div className="flex-1 grid grid-cols-7">
          {grid.map((date) => (
            <div
              key={date.toString()}
              className="p-2 text-center border-r last:border-r-0 font-medium text-sm bg-slate-50 truncate"
            >
              {format(date, 'EEE, dd', { locale: ptBR })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex relative">
        <div className="w-16 flex-shrink-0 bg-slate-50 border-r">
          {hours.map((h) => (
            <div key={h} className="h-20 border-b text-xs text-slate-400 text-right pr-2 py-1">
              {h}:00
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-7 relative">
          {grid.map((date, i) => (
            <div key={i} className="border-r last:border-r-0 relative min-w-[100px]">
              {hours.map((h) => (
                <div key={h} className="h-20 border-b border-slate-100" />
              ))}
              {agendamentos
                .filter((a: Agendamento) => isSameDay(new Date(a.data_inicio), date))
                .map((a: Agendamento) => {
                  const d = new Date(a.data_inicio)
                  const top = (d.getHours() - 6) * 80 + (d.getMinutes() / 60) * 80
                  return (
                    <div
                      key={a.id}
                      className="absolute left-1 right-1 z-10"
                      style={{ top: `${top}px` }}
                      onClick={() => onAgendamentoClick(a)}
                    >
                      <AgendamentoCard agendamento={a} compact />
                    </div>
                  )
                })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
