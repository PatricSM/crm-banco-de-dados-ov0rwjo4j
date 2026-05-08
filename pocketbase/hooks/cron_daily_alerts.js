cronAdd('daily_alerts', '0 8 * * *', () => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const startStr = today.toISOString().replace('T', ' ')
    const endStr = todayEnd.toISOString().replace('T', ' ')

    const agendamentos = $app.findRecordsByFilter(
      'agendamentos',
      `status = 'Agendado' && data_inicio >= {:start} && data_inicio <= {:end}`,
      '-created',
      1000,
      0,
      { start: startStr, end: endStr },
    )

    const notifCol = $app.findCollectionByNameOrId('notifications')

    for (const ag of agendamentos) {
      const profId = ag.getString('profissional_id')
      if (profId) {
        const notif = new Record(notifCol)
        notif.set('recipient', profId)
        notif.set('kind', 'agendamento_proximo')
        notif.set('title', 'Lembrete: Agendamento Hoje')
        notif.set('body', `Você tem um agendamento hoje.`)
        notif.set('agendamento_id', ag.id)
        notif.set('lead_id', ag.getString('lead_id'))
        notif.set('link', `/agenda`)
        $app.saveNoValidate(notif)
      }
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const limitStr = sevenDaysAgo.toISOString().replace('T', ' ')

    const leads = $app.findRecordsByFilter(
      'leads',
      `status != 'Convertido' && status != 'Perdido' && status != 'Vendido' && updated <= {:limit}`,
      '-updated',
      1000,
      0,
      { limit: limitStr },
    )

    for (const lead of leads) {
      const colabId = lead.getString('colaborador_id')
      if (colabId) {
        const notif = new Record(notifCol)
        notif.set('recipient', colabId)
        notif.set('kind', 'lead_sem_contato')
        notif.set('title', 'Atenção: Lead sem contato')
        notif.set(
          'body',
          `O lead ${lead.getString('nome')} não tem atualizações há mais de 7 dias.`,
        )
        notif.set('lead_id', lead.id)
        notif.set('link', `/leads/${lead.id}`)
        $app.saveNoValidate(notif)
      }
    }
  } catch (err) {
    $app.logger().error('cron daily_alerts failed', 'err', String(err))
  }
})
