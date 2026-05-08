migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.add(
      new SelectField({
        name: 'role',
        values: ['gestor', 'vendedor'],
        maxSelect: 1,
        required: true,
      }),
    )
    users.listRule = "id = @request.auth.id || @request.auth.role = 'gestor'"
    users.viewRule = "id = @request.auth.id || @request.auth.role = 'gestor'"
    users.updateRule = "id = @request.auth.id || @request.auth.role = 'gestor'"
    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.fields.removeByName('role')
    users.listRule = 'id = @request.auth.id'
    users.viewRule = 'id = @request.auth.id'
    users.updateRule = 'id = @request.auth.id'
    app.save(users)
  },
)
