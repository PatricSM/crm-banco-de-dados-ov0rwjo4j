import pb from '@/lib/pocketbase/client'
import { User } from '@/types'

export const getUsers = async () => {
  return await pb.collection('users').getFullList<User>({ sort: 'name' })
}

export const updateUserRole = async (id: string, role: 'gestor' | 'vendedor') => {
  return await pb.collection('users').update<User>(id, { role })
}
