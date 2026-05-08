import pb from '@/lib/pocketbase/client'
import { Historico } from '@/types'

export const getHistoricoByLead = async (leadId: string) => {
  return await pb.collection('historico').getFullList<Historico>({
    filter: `lead_id = '${leadId}'`,
    sort: '-created',
    expand: 'lead_id',
  })
}

export const getRecentHistorico = async () => {
  return await pb
    .collection('historico')
    .getList<Historico>(1, 15, {
      sort: '-created',
      expand: 'lead_id',
    })
    .then((r) => r.items)
}

export const createHistorico = async (data: Partial<Historico>) => {
  return await pb.collection('historico').create<Historico>(data)
}
