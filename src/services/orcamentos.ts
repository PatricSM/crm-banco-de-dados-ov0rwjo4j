import pb from '@/lib/pocketbase/client'
import { Orcamento } from '@/types'

export const getOrcamentosByLead = async (leadId: string) => {
  return await pb.collection('orcamentos').getFullList<Orcamento>({
    filter: `lead_id = '${leadId}'`,
    sort: '-created',
  })
}

export const getAllOrcamentos = async () => {
  return await pb.collection('orcamentos').getFullList<Orcamento>({
    sort: '-created',
    expand: 'lead_id',
  })
}

export const createOrcamento = async (data: Partial<Orcamento>) => {
  return await pb.collection('orcamentos').create<Orcamento>(data)
}

export const updateOrcamento = async (id: string, data: Partial<Orcamento>) => {
  return await pb.collection('orcamentos').update<Orcamento>(id, data)
}

export const deleteOrcamento = async (id: string) => {
  return await pb.collection('orcamentos').delete(id)
}
