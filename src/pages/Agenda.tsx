import { useState, useEffect } from 'react'
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getAgendamentos } from '@/services/agendamentos'
import { Agendamento, User } from '@/types'
import { useRealtime } from '@/hooks/use-realtime'
import { getWeekGrid } from '@/lib/calendar'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AgendamentoForm } from '@/components/agendamentos/AgendamentoForm'
import { MonthView } from '@/components/agendamentos/MonthView'
import { WeekView } from '@/components/agendamentos/WeekView'
import { DayView } from '@/components/agendamentos/DayView'
import pb from '@/lib/pocketbase/client'

export default function Agenda() {
  const { user } = useAuth()
  const isGestor = user?.role === 'gestor'

  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filterProf, setFilterProf] = useState(isGestor ? 'all' : user?.id || '')

  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [profissionais, setProfissionais] = useState<User[]>([])

  const [formOpen, setFormOpen] = useState(false)
  const [selectedApt, setSelectedApt] = useState<Agendamento | undefined>()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  const loadData = async () => {
    const apts = await getAgendamentos(filterProf)
    setAgendamentos(apts)
  }

  useEffect(() => {
    loadData()
  }, [filterProf])

  useEffect(() => {
    pb.collection('users').getFullList<User>().then(setProfissionais)
  }, [])

  useRealtime('agendamentos', () => loadData())

  const handlePrev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1))
    if (view === 'week') setCurrentDate(subWeeks(currentDate, 1))
    if (view === 'day') setCurrentDate(subDays(currentDate, 1))
  }

  const handleNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1))
    if (view === 'week') setCurrentDate(addWeeks(currentDate, 1))
    if (view === 'day') setCurrentDate(addDays(currentDate, 1))
  }

  const handleOpenForm = (apt?: Agendamento, date?: Date) => {
    setSelectedApt(apt)
    setSelectedDate(date || new Date())
    setFormOpen(true)
  }

  return (
    <div className="max-w-[1400px] mx-auto w-full p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <CalendarIcon className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Agenda</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isGestor && (
            <Select value={filterProf} onValueChange={setFilterProf}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos profissionais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos profissionais</SelectItem>
                {profissionais.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center border rounded-lg bg-slate-50 p-1">
            {(['month', 'week', 'day'] as const).map((v) => (
              <Button
                key={v}
                variant="ghost"
                size="sm"
                className={cn('text-xs px-3 h-7', view === v && 'bg-white shadow-sm')}
                onClick={() => setView(v)}
              >
                {v === 'month' ? 'Mês' : v === 'week' ? 'Semana' : 'Dia'}
              </Button>
            ))}
          </div>

          <Button onClick={() => handleOpenForm()} className="gap-2">
            <Plus className="w-4 h-4" /> Novo
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold capitalize text-slate-800">
            {view === 'month' && format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            {view === 'week' &&
              `Semana de ${format(getWeekGrid(currentDate)[0], 'd MMM', { locale: ptBR })}`}
            {view === 'day' && format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
          </h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {view === 'month' && (
          <MonthView
            currentDate={currentDate}
            agendamentos={agendamentos}
            onDateClick={(d: Date) => handleOpenForm(undefined, d)}
            onAgendamentoClick={handleOpenForm}
          />
        )}
        {view === 'week' && (
          <WeekView
            currentDate={currentDate}
            agendamentos={agendamentos}
            onAgendamentoClick={handleOpenForm}
          />
        )}
        {view === 'day' && (
          <DayView
            currentDate={currentDate}
            agendamentos={agendamentos}
            onAgendamentoClick={handleOpenForm}
          />
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Agendamento</DialogTitle>
          <DialogDescription className="sr-only">Formulário de Agendamento</DialogDescription>
          <div className="pt-2">
            <h2 className="text-xl font-bold mb-4">
              {selectedApt ? 'Editar' : 'Novo'} Agendamento
            </h2>
            <AgendamentoForm
              agendamento={selectedApt}
              initialDate={selectedDate}
              profissionais={profissionais}
              onSuccess={() => setFormOpen(false)}
              onCancel={() => setFormOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
