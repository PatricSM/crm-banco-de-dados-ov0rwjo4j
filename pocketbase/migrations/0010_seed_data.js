migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'admin@aesthetix.crm')
      admin.set('role', 'gestor')
      app.save(admin)
    } catch (_) {
      admin = new Record(users)
      admin.setEmail('admin@aesthetix.crm')
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      admin.set('name', 'Administrador')
      admin.set('role', 'gestor')
      app.save(admin)
    }

    let vendedor
    try {
      vendedor = app.findAuthRecordByEmail('_pb_users_auth_', 'vendedor@aesthetix.crm')
    } catch (_) {
      vendedor = new Record(users)
      vendedor.setEmail('vendedor@aesthetix.crm')
      vendedor.setPassword('Skip@Pass')
      vendedor.setVerified(true)
      vendedor.set('name', 'Vendedor Demo')
      vendedor.set('role', 'vendedor')
      app.save(vendedor)
    }

    const leads = app.findCollectionByNameOrId('leads')
    const historico = app.findCollectionByNameOrId('historico')

    const seedLead = (nome, status, valor, colabId) => {
      try {
        app.findFirstRecordByData('leads', 'nome', nome)
      } catch (_) {
        const l = new Record(leads)
        l.set('nome', nome)
        l.set('status', status)
        l.set('origem', 'Site Institucional')
        l.set('colaborador_id', colabId)
        l.set('valor_orcamento', valor)
        app.save(l)

        const h = new Record(historico)
        h.set('lead_id', l.id)
        h.set('acao', 'Lead Criado')
        h.set('detalhes', 'Lead originado pelo formulário do site.')
        app.save(h)
      }
    }

    seedLead('Empresa Alpha Ltda', 'Novo Contato', 5000, admin.id)
    seedLead('Beta Tech Services', 'Em Atendimento', 12500, vendedor.id)
    seedLead('Gama Corp Global', 'Agendado', 8500, vendedor.id)
    seedLead('Delta Innovators Inc', 'Convertido', 20000, admin.id)
    seedLead('Zeta Solutions', 'Perdido', 3000, admin.id)
  },
  (app) => {
    // Safe down-migration omitting exact records to prevent full table loss.
  },
)
