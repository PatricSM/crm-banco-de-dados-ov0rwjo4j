onRecordAfterUpdateSuccess((e) => {
  const original = e.record.original()
  const changes = []

  const statusOld = original.getString('status')
  const statusNew = e.record.getString('status')
  if (statusOld !== statusNew) {
    changes.push(`Status: "${statusOld}" → "${statusNew}"`)
  }

  const colabOld = original.getString('colaborador_id')
  const colabNew = e.record.getString('colaborador_id')
  if (colabOld !== colabNew) {
    changes.push(`Atribuição alterada`)
  }

  const arqOld = original.getBool('arquivado')
  const arqNew = e.record.getBool('arquivado')
  if (arqOld !== arqNew) {
    changes.push(arqNew ? `Lead arquivado` : `Lead desarquivado`)
  }

  if (changes.length > 0) {
    const historicoCol = $app.findCollectionByNameOrId('historico')
    const record = new Record(historicoCol)
    record.set('lead_id', e.record.id)
    record.set('acao', 'Atualização em lote/sistema')

    const userName = e.auth
      ? e.auth.getString('name') || e.auth.getString('email') || 'Usuário'
      : 'Sistema'

    record.set('detalhes', `[${userName}] ` + changes.join(' | '))
    $app.save(record)
  }

  e.next()
}, 'leads')
