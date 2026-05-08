import { StatusTone } from '@/components/StatusChip'

export function leadStatusToTone(status: string): StatusTone {
  switch (status) {
    case 'Novo':
    case 'Novo Contato':
      return 'new'
    case 'Agendado':
      return 'scheduled'
    case 'Em Atendimento':
      return 'in_treatment'
    case 'Vendido':
    case 'Convertido':
      return 'converted'
    case 'Perdido':
      return 'lost'
    default:
      return 'neutral'
  }
}
