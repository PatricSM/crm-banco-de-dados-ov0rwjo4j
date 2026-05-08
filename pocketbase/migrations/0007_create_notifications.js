migrate(
  (app) => {
    const leadsCol = app.findCollectionByNameOrId('leads')
    const agendamentosCol = app.findCollectionByNameOrId('agendamentos')

    const collection = new Collection({
      name: 'notifications',
      type: 'base',
      listRule: "@request.auth.id != '' && recipient = @request.auth.id",
      viewRule: "@request.auth.id != '' && recipient = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && recipient = @request.auth.id",
      deleteRule: "@request.auth.id != '' && recipient = @request.auth.id",
      fields: [
        {
          name: 'recipient',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          required: true,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'kind',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: [
            'lead_assigned',
            'lead_status_changed',
            'agendamento_proximo',
            'agendamento_confirmar',
            'no_show',
            'lead_sem_contato',
            'mention',
            'sistema',
          ],
        },
        { name: 'title', type: 'text', required: true },
        { name: 'body', type: 'text' },
        {
          name: 'lead_id',
          type: 'relation',
          collectionId: leadsCol.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'agendamento_id',
          type: 'relation',
          collectionId: agendamentosCol.id,
          maxSelect: 1,
          cascadeDelete: true,
        },
        { name: 'link', type: 'text' },
        { name: 'read_at', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_notifications_recipient_read ON notifications (recipient, read_at)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('notifications')
    app.delete(collection)
  },
)
