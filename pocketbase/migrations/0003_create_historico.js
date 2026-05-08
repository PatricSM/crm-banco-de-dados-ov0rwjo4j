migrate(
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')
    const historico = new Collection({
      name: 'historico',
      type: 'base',
      listRule: "@request.auth.role = 'gestor' || lead_id.colaborador_id = @request.auth.id",
      viewRule: "@request.auth.role = 'gestor' || lead_id.colaborador_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'lead_id',
          type: 'relation',
          required: true,
          collectionId: leads.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'acao', type: 'text', required: true },
        { name: 'detalhes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_historico_lead ON historico (lead_id)'],
    })
    app.save(historico)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('historico'))
  },
)
