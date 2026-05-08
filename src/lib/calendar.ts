import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const getMonthGrid = (date: Date) => {
  const start = startOfWeek(startOfMonth(date), { weekStartsOn: 0 })
  const end = endOfWeek(endOfMonth(date), { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
}

export const getWeekGrid = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  const end = endOfWeek(date, { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
}

export const timeSlots = () => {
  const slots = []
  for (let i = 6; i <= 22; i++) {
    slots.push(`${i.toString().padStart(2, '0')}:00`)
    slots.push(`${i.toString().padStart(2, '0')}:30`)
  }
  return slots
}

export const formatDayLabel = (date: Date) => {
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR })
}
