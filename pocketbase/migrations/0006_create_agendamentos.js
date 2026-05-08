migrate(
  (app) => {
    const leadsCol = app.findCollectionByNameOrId('leads')

    const collection = new Collection({
      name: 'agendamentos',
      type: 'base',
      listRule:
        "@request.auth.role = 'gestor' || profissional_id = @request.auth.id || lead_id.colaborador_id = @request.auth.id",
      viewRule:
        "@request.auth.role = 'gestor' || profissional_id = @request.auth.id || lead_id.colaborador_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.role = 'gestor' || profissional_id = @request.auth.id",
      deleteRule: "@request.auth.role = 'gestor'",
      fields: [
        {
          name: 'lead_id',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: leadsCol.id,
          cascadeDelete: true,
        },
        {
          name: 'profissional_id',
          type: 'relation',
          required: true,
          maxSelect: 1,
          collectionId: '_pb_users_auth_',
        },
        { name: 'data_inicio', type: 'date', required: true },
        { name: 'data_fim', type: 'date' },
        { name: 'procedimento', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Agendado', 'Confirmado', 'Compareceu', 'No-show', 'Cancelado'],
        },
        { name: 'observacoes', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_agendamentos_lead ON agendamentos (lead_id)',
        'CREATE INDEX idx_agendamentos_profissional ON agendamentos (profissional_id)',
        'CREATE INDEX idx_agendamentos_data_inicio ON agendamentos (data_inicio)',
        'CREATE INDEX idx_agendamentos_status ON agendamentos (status)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('agendamentos')
    app.delete(collection)
  },
)
