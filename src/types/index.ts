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
  | 'Novo Contato'
  | 'Agendado'
  | 'Em Atendimento'
  | 'Convertido'
  | 'Perdido'
  | 'Novo'
  | 'Compareceu'
  | 'Vendido'

export type AttachmentKind =
  | 'foto_antes'
  | 'foto_depois'
  | 'documento'
  | 'contrato'
  | 'exame'
  | 'comprovante'
  | 'outro'

export interface LeadAttachment {
  id: string
  lead_id: string
  file: string
  original_name: string
  kind: AttachmentKind
  size?: number
  uploaded_by: string
  description?: string
  created: string
  updated: string
  expand?: {
    uploaded_by?: User
    lead_id?: Lead
  }
}

export interface Lead {
  id: string
  nome: string
  status: LeadStatus
  origem: string
  colaborador_id: string
  valor_orcamento: number
  data_agendamento: string
  data_comparecimento: string
  telefone?: string
  email?: string
  procedimento_interesse?: string
  tentativas_contato?: number
  data_proximo_contato?: string
  objecoes?: string
  arquivado?: boolean
  arquivado_em?: string
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

export interface Agendamento {
  id: string
  lead_id: string
  profissional_id: string
  data_inicio: string
  data_fim?: string
  procedimento?: string
  status: 'Agendado' | 'Confirmado' | 'Compareceu' | 'No-show' | 'Cancelado'
  observacoes?: string
  created: string
  updated: string
  expand?: {
    lead_id?: Lead
    profissional_id?: User
  }
}

export interface Orcamento {
  id: string
  lead_id: string
  procedimentos: string
  valor_total: number
  validade: string
  forma_pagamento: string
  desconto_aplicado: number
  status: 'Pendente' | 'Aprovado' | 'Cancelado'
  created: string
  updated: string
  expand?: {
    lead_id?: Lead
  }
}
