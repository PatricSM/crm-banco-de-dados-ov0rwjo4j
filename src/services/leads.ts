import pb from '@/lib/pocketbase/client'
import { Lead } from '@/types'

export interface LeadsFilters {
  dateFrom?: string
  dateTo?: string
  status?: string
  origem?: string
  colaboradorId?: string
}

export const getLeads = async (filters?: LeadsFilters) => {
  const filterParts: string[] = []
  if (filters?.dateFrom) filterParts.push(`created >= "${filters.dateFrom} 00:00:00"`)
  if (filters?.dateTo) filterParts.push(`created <= "${filters.dateTo} 23:59:59"`)
  if (filters?.status && filters.status !== 'all') filterParts.push(`status = "${filters.status}"`)
  if (filters?.origem && filters.origem !== 'all') filterParts.push(`origem = "${filters.origem}"`)
  if (filters?.colaboradorId && filters.colaboradorId !== 'all')
    filterParts.push(`colaborador_id = "${filters.colaboradorId}"`)

  const filterString = filterParts.join(' && ')

  return await pb.collection('leads').getFullList<Lead>({
    filter: filterString,
    expand: 'colaborador_id',
    sort: '-created',
  })
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
