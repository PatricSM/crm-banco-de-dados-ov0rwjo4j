import pb from '@/lib/pocketbase/client'

export type NotificationKind =
  | 'lead_assigned'
  | 'lead_status_changed'
  | 'agendamento_proximo'
  | 'agendamento_confirmar'
  | 'no_show'
  | 'lead_sem_contato'
  | 'mention'
  | 'sistema'

export interface AppNotification {
  id: string
  recipient: string
  kind: NotificationKind
  title: string
  body?: string
  lead_id?: string
  agendamento_id?: string
  link?: string
  read_at?: string
  created: string
  updated: string
}

export const getNotifications = () => {
  return pb.collection('notifications').getList<AppNotification>(1, 50, {
    sort: '-created',
  })
}

export const markAsRead = async (id: string) => {
  return pb.collection('notifications').update<AppNotification>(id, {
    read_at: new Date().toISOString(),
  })
}

export const markAllAsRead = async (ids: string[]) => {
  const promises = ids.map((id) => markAsRead(id))
  await Promise.all(promises)
}
