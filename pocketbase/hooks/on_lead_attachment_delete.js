onRecordAfterDeleteSuccess((e) => {
  const historico = new Record($app.findCollectionByNameOrId('historico'))
  historico.set('lead_id', e.record.getString('lead_id'))
  historico.set('acao', `Anexo removido: ${e.record.getString('original_name')}`)
  $app.save(historico)
  e.next()
}, 'lead_attachments')
