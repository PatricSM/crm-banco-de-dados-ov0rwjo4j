export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: 'gestor' | 'vendedor'
  created: string
  updated: string
}

export type LeadStatus =
  | 'Novo'
  | 'Em Atendimento'
  | 'Agendado'
  | 'Compareceu'
  | 'Vendido'
  | 'Perdido'

export interface Lead {
  id: string
  nome: string
  status: LeadStatus
  origem: string
  colaborador_id: string
  valor_orcamento: number
  data_agendamento: string
  data_comparecimento: string
  created: string
  updated: string
  expand?: {
    colaborador_id?: User
  }
}

export interface Historico {
  id: string
  lead_id: string
  acao: string
  detalhes: string
  created: string
  expand?: {
    lead_id?: Lead
  }
}
