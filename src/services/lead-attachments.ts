import pb from '@/lib/pocketbase/client'
import { LeadAttachment } from '@/types'

export const getLeadAttachments = (leadId: string) => {
  return pb.collection('lead_attachments').getFullList<LeadAttachment>({
    filter: `lead_id = "${leadId}"`,
    sort: '-created',
    expand: 'uploaded_by',
  })
}

export const getAllLeadAttachments = () => {
  return pb.collection('lead_attachments').getFullList<LeadAttachment>({
    sort: '-created',
  })
}

export const getMonthlyAttachmentsCount = async (startDate: string, endDate: string) => {
  const result = await pb.collection('lead_attachments').getList(1, 1, {
    filter: `created >= "${startDate}" && created <= "${endDate}"`,
  })
  return result.totalItems
}

export const uploadAttachment = (data: FormData) => {
  return pb.collection('lead_attachments').create<LeadAttachment>(data)
}

export const deleteAttachment = (id: string) => {
  return pb.collection('lead_attachments').delete(id)
}
