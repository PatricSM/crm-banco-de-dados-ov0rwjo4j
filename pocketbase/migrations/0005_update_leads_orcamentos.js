migrate(
  (app) => {
    const leads = app.findCollectionByNameOrId('leads')

    if (!leads.fields.getByName('telefone')) leads.fields.add(new TextField({ name: 'telefone' }))
    if (!leads.fields.getByName('email')) leads.fields.add(new EmailField({ name: 'email' }))
    if (!leads.fields.getByName('procedimento_interesse'))
      leads.fields.add(new TextField({ name: 'procedimento_interesse' }))
    if (!leads.fields.getByName('tentativas_contato'))
      leads.fields.add(new NumberField({ name: 'tentativas_contato' }))
    if (!leads.fields.getByName('data_proximo_contato'))
      leads.fields.add(new DateField({ name: 'data_proximo_contato' }))
    if (!leads.fields.getByName('objecoes')) leads.fields.add(new TextField({ name: 'objecoes' }))

    app.save(leads)

    app.db().newQuery(`UPDATE leads SET status = 'Novo Contato' WHERE status = 'Novo'`).execute()
    app.db().newQuery(`UPDATE leads SET status = 'Convertido' WHERE status = 'Vendido'`).execute()
    app
      .db()
      .newQuery(`UPDATE leads SET status = 'Em Atendimento' WHERE status = 'Compareceu'`)
      .execute()

    const orcamentos = new Collection({
      name: 'orcamentos',
      type: 'base',
      listRule: "@request.auth.role = 'gestor' || lead_id.colaborador_id = @request.auth.id",
      viewRule: "@request.auth.role = 'gestor' || lead_id.colaborador_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.role = 'gestor' || lead_id.colaborador_id = @request.auth.id",
      deleteRule: "@request.auth.role = 'gestor'",
      fields: [
        {
          name: 'lead_id',
          type: 'relation',
          required: true,
          collectionId: leads.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'procedimentos', type: 'text' },
        { name: 'valor_total', type: 'number' },
        { name: 'validade', type: 'date' },
        {
          name: 'forma_pagamento',
          type: 'select',
          values: ['Pix', 'Cartão', 'Boleto', 'Transferência', 'Dinheiro'],
          maxSelect: 1,
        },
        { name: 'desconto_aplicado', type: 'number' },
        {
          name: 'status',
          type: 'select',
          values: ['Pendente', 'Aprovado', 'Cancelado'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(orcamentos)
  },
  (app) => {
    try {
      const orcamentos = app.findCollectionByNameOrId('orcamentos')
      app.delete(orcamentos)
    } catch (_) {}
  },
)
