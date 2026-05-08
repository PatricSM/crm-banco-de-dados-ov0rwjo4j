import pb from '@/lib/pocketbase/client'
import { Lead } from '@/types'

export const getLeads = async () => {
  return await pb
    .collection('leads')
    .getFullList<Lead>({ expand: 'colaborador_id', sort: '-created' })
}

export const getLead = async (id: string) => {
  return await pb.collection('leads').getOne<Lead>(id, { expand: 'colaborador_id' })
}

export const createLead = async (data: Partial<Lead>) => {
  return await pb.collection('leads').create<Lead>(data)
}

export const updateLead = async (id: string, data: Partial<Lead>) => {
  return await pb.collection('leads').update<Lead>(id, data)
}

export const deleteLead = async (id: string) => {
  return await pb.collection('leads').delete(id)
}
