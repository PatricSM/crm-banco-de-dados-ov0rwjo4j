migrate(
  (app) => {
    const collection = new Collection({
      name: 'lead_attachments',
      type: 'base',
      listRule: "@request.auth.role = 'gestor' || lead_id.colaborador_id = @request.auth.id",
      viewRule: "@request.auth.role = 'gestor' || lead_id.colaborador_id = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.role = 'gestor' || uploaded_by = @request.auth.id",
      deleteRule: "@request.auth.role = 'gestor' || uploaded_by = @request.auth.id",
      fields: [
        {
          name: 'lead_id',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('leads').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'file',
          type: 'file',
          required: true,
          maxSelect: 1,
          maxSize: 26214400,
          mimeTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv',
          ],
        },
        { name: 'original_name', type: 'text', required: true },
        {
          name: 'kind',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: [
            'foto_antes',
            'foto_depois',
            'documento',
            'contrato',
            'exame',
            'comprovante',
            'outro',
          ],
        },
        { name: 'size', type: 'number' },
        {
          name: 'uploaded_by',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
        },
        { name: 'description', type: 'text' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_lead_attachments_lead ON lead_attachments (lead_id)',
        'CREATE INDEX idx_lead_attachments_created ON lead_attachments (created)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('lead_attachments')
    app.delete(collection)
  },
)
