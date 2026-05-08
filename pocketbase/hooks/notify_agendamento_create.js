onRecordCreateRequest((e) => {
  e.next()

  const agendamento = e.record
  const profId = agendamento.getString('profissional_id')
  const authId = e.auth?.id

  if (profId && profId !== authId) {
    try {
      const collection = $app.findCollectionByNameOrId('notifications')
      const notif = new Record(collection)
      notif.set('recipient', profId)
      notif.set('kind', 'agendamento_confirmar')
      notif.set('title', 'Novo agendamento marcado')
      notif.set('body', `Um novo agendamento foi marcado para você.`)
      notif.set('agendamento_id', agendamento.id)
      notif.set('lead_id', agendamento.getString('lead_id'))
      notif.set('link', `/agenda`)
      $app.saveNoValidate(notif)
    } catch (err) {
      $app.logger().error('notify_agendamento_create failed', 'err', String(err))
    }
  }
}, 'agendamentos')
