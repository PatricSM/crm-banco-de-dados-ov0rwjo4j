onRecordCreateRequest((e) => {
  e.next()

  const lead = e.record
  const colabId = lead.getString('colaborador_id')
  const authId = e.auth?.id

  if (colabId && colabId !== authId) {
    try {
      const collection = $app.findCollectionByNameOrId('notifications')
      const notif = new Record(collection)
      notif.set('recipient', colabId)
      notif.set('kind', 'lead_assigned')
      notif.set('title', 'Novo lead atribuído')
      notif.set('body', `O lead ${lead.getString('nome')} foi atribuído a você.`)
      notif.set('lead_id', lead.id)
      notif.set('link', `/leads/${lead.id}`)
      $app.saveNoValidate(notif)
    } catch (err) {
      $app.logger().error('notify_lead_create failed', 'err', String(err))
    }
  }
}, 'leads')
