migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    let admin
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'patric.martins@adapta.org')
      admin.set('role', 'gestor')
      app.save(admin)
    } catch (_) {
      admin = new Record(users)
      admin.setEmail('patric.martins@adapta.org')
      admin.setPassword('Skip@Pass')
      admin.setVerified(true)
      admin.set('name', 'Admin Gestor')
      admin.set('role', 'gestor')
      app.save(admin)
    }

    let vendedor
    try {
      vendedor = app.findAuthRecordByEmail('_pb_users_auth_', 'vendedor@adapta.org')
    } catch (_) {
      vendedor = new Record(users)
      vendedor.setEmail('vendedor@adapta.org')
      vendedor.setPassword('Skip@Pass')
      vendedor.setVerified(true)
      vendedor.set('name', 'João Vendedor')
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

    seedLead('Empresa Alpha Ltda', 'Novo', 5000, admin.id)
    seedLead('Beta Tech Services', 'Em Atendimento', 12500, vendedor.id)
    seedLead('Gama Corp Global', 'Agendado', 8500, vendedor.id)
    seedLead('Delta Innovators Inc', 'Vendido', 20000, admin.id)
    seedLead('Zeta Solutions', 'Perdido', 3000, admin.id)
  },
  (app) => {
    // Safe down-migration omitting exact records to prevent full table loss.
  },
)
