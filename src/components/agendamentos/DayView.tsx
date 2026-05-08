import { isSameDay } from 'date-fns'
import { timeSlots } from '@/lib/calendar'
import { AgendamentoCard } from './AgendamentoCard'
import { Agendamento } from '@/types'

export function DayView({ currentDate, agendamentos, onAgendamentoClick }: any) {
  const slots = timeSlots()
  const dayApts = agendamentos.filter((a: Agendamento) =>
    isSameDay(new Date(a.data_inicio), currentDate),
  )

  return (
    <div className="flex flex-col border rounded-lg overflow-auto h-[600px] bg-white">
      {slots.map((time) => {
        const [h, m] = time.split(':').map(Number)
        const slotApts = dayApts.filter((a: Agendamento) => {
          const d = new Date(a.data_inicio)
          return d.getHours() === h && (m === 0 ? d.getMinutes() < 30 : d.getMinutes() >= 30)
        })
        return (
          <div
            key={time}
            className="flex border-b min-h-16 relative hover:bg-slate-50 transition-colors"
          >
            <div className="w-20 flex-shrink-0 bg-slate-50 border-r text-xs text-slate-500 font-medium p-2 text-right">
              {time}
            </div>
            <div className="flex-1 p-1 grid grid-cols-1 md:grid-cols-2 gap-1">
              {slotApts.map((a: Agendamento) => (
                <div key={a.id} onClick={() => onAgendamentoClick(a)}>
                  <AgendamentoCard agendamento={a} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
