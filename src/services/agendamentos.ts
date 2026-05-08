import pb from '@/lib/pocketbase/client'
import { Agendamento } from '@/types'

export const getAgendamentos = async (profissionalId?: string) => {
  let filter = ''
  if (profissionalId && profissionalId !== 'all') {
    filter = `profissional_id = "${profissionalId}"`
  }
  return pb.collection('agendamentos').getFullList<Agendamento>({
    filter,
    expand: 'lead_id,profissional_id',
    sort: 'data_inicio',
  })
}

export const getAgendamentosByLead = async (leadId: string) => {
  return pb.collection('agendamentos').getFullList<Agendamento>({
    filter: `lead_id = "${leadId}"`,
    expand: 'profissional_id,lead_id',
    sort: 'data_inicio',
  })
}

export const createAgendamento = (data: Partial<Agendamento>) =>
  pb.collection('agendamentos').create<Agendamento>(data)

export const updateAgendamento = (id: string, data: Partial<Agendamento>) =>
  pb.collection('agendamentos').update<Agendamento>(id, data)

export const deleteAgendamento = (id: string) => pb.collection('agendamentos').delete(id)
