migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('leads')

    if (!col.fields.getByName('arquivado')) {
      col.fields.add(new BoolField({ name: 'arquivado' }))
    }

    if (!col.fields.getByName('arquivado_em')) {
      col.fields.add(new DateField({ name: 'arquivado_em' }))
    }

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('leads')
    col.fields.removeByName('arquivado')
    col.fields.removeByName('arquivado_em')
    app.save(col)
  },
)
