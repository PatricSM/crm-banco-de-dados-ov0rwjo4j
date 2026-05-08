migrate(
  (app) => {
    const leads = new Collection({
      name: 'leads',
      type: 'base',
      listRule: "@request.auth.role = 'gestor' || colaborador_id = @request.auth.id",
      viewRule: "@request.auth.role = 'gestor' || colaborador_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.role = 'gestor' || colaborador_id = @request.auth.id",
      deleteRule: "@request.auth.role = 'gestor'",
      fields: [
        { name: 'nome', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['Novo', 'Em Atendimento', 'Agendado', 'Compareceu', 'Vendido', 'Perdido'],
          maxSelect: 1,
        },
        { name: 'origem', type: 'text' },
        {
          name: 'colaborador_id',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'valor_orcamento', type: 'number' },
        { name: 'data_agendamento', type: 'date' },
        { name: 'data_comparecimento', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_leads_colaborador ON leads (colaborador_id)',
        'CREATE INDEX idx_leads_status ON leads (status)',
      ],
    })
    app.save(leads)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('leads'))
  },
)
