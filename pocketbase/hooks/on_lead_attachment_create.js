onRecordAfterCreateSuccess((e) => {
  const historico = new Record($app.findCollectionByNameOrId('historico'))
  historico.set('lead_id', e.record.getString('lead_id'))
  historico.set('acao', `Anexo enviado: ${e.record.getString('original_name')}`)
  historico.set('detalhes', `Tipo: ${e.record.getString('kind')}`)
  $app.save(historico)
  e.next()
}, 'lead_attachments')
