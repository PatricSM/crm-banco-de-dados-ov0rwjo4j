function syncLead(e) {
  const leadId = e.record.getString('lead_id')
  if (!leadId) return e.next()

  try {
    const lead = $app.findRecordById('leads', leadId)
    const activeApts = $app.findRecordsByFilter(
      'agendamentos',
      "lead_id = {:leadId} && (status = 'Agendado' || status = 'Confirmado')",
      'data_inicio',
      100,
      0,
      { leadId: leadId },
    )

    let nextAptDate = ''
    const nowMs = Date.now()
    const futureApts = activeApts
      .filter((a) => {
        const d = a.getString('data_inicio')
        return d && new Date(d).getTime() >= nowMs
      })
      .sort(
        (a, b) =>
          new Date(a.getString('data_inicio')).getTime() -
          new Date(b.getString('data_inicio')).getTime(),
      )

    if (futureApts.length > 0) {
      nextAptDate = futureApts[0].getString('data_inicio')
    }

    let shouldSave = false
    if (lead.getString('data_agendamento') !== nextAptDate) {
      lead.set('data_agendamento', nextAptDate)
      shouldSave = true
    }

    const currentLeadStatus = lead.getString('status')
    const aptStatus = e.record.getString('status')

    if (aptStatus === 'Agendado' || aptStatus === 'Confirmado') {
      if (
        currentLeadStatus === 'Novo' ||
        currentLeadStatus === 'Novo Contato' ||
        currentLeadStatus === 'Em Atendimento'
      ) {
        lead.set('status', 'Agendado')
        shouldSave = true
      }
    }

    if (aptStatus === 'Compareceu') {
      if (!lead.getString('data_comparecimento')) {
        lead.set('data_comparecimento', new Date().toISOString())
        shouldSave = true
      }
      if (currentLeadStatus === 'Agendado') {
        lead.set('status', 'Em Atendimento')
        shouldSave = true
      }
    }

    if (shouldSave) {
      $app.saveNoValidate(lead)
    }
  } catch (err) {
    console.log('Error syncing lead agendamento:', err.message || err)
  }
  return e.next()
}

onRecordAfterCreateSuccess(syncLead, 'agendamentos')
onRecordAfterUpdateSuccess(syncLead, 'agendamentos')
onRecordAfterDeleteSuccess(syncLead, 'agendamentos')
