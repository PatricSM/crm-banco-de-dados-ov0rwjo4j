onRecordUpdateRequest((e) => {
  const originalStatus = e.record.original().getString('status')
  e.next()

  const lead = e.record
  const newStatus = lead.getString('status')
  const colabId = lead.getString('colaborador_id')
  const authId = e.auth?.id

  if (originalStatus !== newStatus && colabId && colabId !== authId) {
    try {
      const collection = $app.findCollectionByNameOrId('notifications')
      const notif = new Record(collection)
      notif.set('recipient', colabId)
      notif.set('kind', 'lead_status_changed')
      notif.set('title', 'Status do lead atualizado')
      notif.set('body', `O status do lead ${lead.getString('nome')} mudou para ${newStatus}.`)
      notif.set('lead_id', lead.id)
      notif.set('link', `/leads/${lead.id}`)
      $app.saveNoValidate(notif)
    } catch (err) {
      $app.logger().error('notify_lead_status failed', 'err', String(err))
    }
  }
}, 'leads')
