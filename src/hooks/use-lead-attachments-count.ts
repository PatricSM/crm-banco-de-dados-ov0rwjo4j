import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from './use-realtime'

export function useLeadAttachmentsCount() {
  const [counts, setCounts] = useState<Record<string, number>>({})

  const fetchCounts = async () => {
    try {
      const records = await pb.collection('lead_attachments').getFullList({
        fields: 'id,lead_id',
      })
      const newCounts: Record<string, number> = {}
      records.forEach((r) => {
        newCounts[r.lead_id] = (newCounts[r.lead_id] || 0) + 1
      })
      setCounts(newCounts)
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetchCounts()
  }, [])

  useRealtime('lead_attachments', () => {
    fetchCounts()
  })

  return counts
}
