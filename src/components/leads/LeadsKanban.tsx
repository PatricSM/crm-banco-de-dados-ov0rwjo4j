import { Lead, LeadStatus } from '@/types'
import { Link } from 'react-router-dom'
import { StatusChip } from '@/components/StatusChip'
import { leadStatusToTone } from '@/lib/leadStatus'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LeadsKanbanProps {
  leads: Lead[]
  isLoading: boolean
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void
}

const COLUMNS: { label: string; statuses: LeadStatus[]; color: string }[] = [
  { label: 'Novo Contato', statuses: ['Novo', 'Novo Contato'], color: 'text-blue-600' },
  { label: 'Agendado', statuses: ['Agendado'], color: 'text-purple-600' },
  { label: 'Em Atendimento', statuses: ['Em Atendimento', 'Compareceu'], color: 'text-amber-600' },
  { label: 'Convertido', statuses: ['Vendido', 'Convertido'], color: 'text-emerald-600' },
  { label: 'Perdido', statuses: ['Perdido'], color: 'text-rose-600' },
]

export function LeadsKanban({ leads, isLoading, onStatusChange }: LeadsKanbanProps) {
  if (isLoading) {
    return (
      <div className="flex gap-4 h-full min-h-[500px] overflow-hidden">
        {COLUMNS.map((c, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 w-[300px] shrink-0 bg-slate-50/50 rounded-xl p-3 border border-slate-200"
          >
            <Skeleton className="h-6 w-24 mb-2" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-4 h-full min-h-[600px] overflow-x-auto pb-4 snap-x">
      {COLUMNS.map((col) => {
        const colLeads = leads.filter((l) => col.statuses.includes(l.status))
        return (
          <div
            key={col.label}
            className="flex flex-col gap-3 w-[320px] shrink-0 bg-slate-100/60 rounded-xl p-3 border border-slate-200/60 snap-start"
          >
            <div className="flex items-center justify-between px-1">
              <h3 className={`font-semibold text-sm ${col.color}`}>{col.label}</h3>
              <span className="bg-white text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium shadow-sm border border-slate-100">
                {colLeads.length}
              </span>
            </div>
            <div className="flex flex-col gap-3 overflow-y-auto min-h-[100px] pb-2">
              {colLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 hover:shadow-md transition-shadow group relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <Link
                      to={`/leads/${lead.id}`}
                      className="font-semibold text-slate-900 text-sm hover:text-primary line-clamp-1 pr-6"
                    >
                      {lead.nome}
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 absolute top-2 right-2 text-slate-400 opacity-0 group-hover:opacity-100"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Mover para</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {COLUMNS.map((c) => (
                          <DropdownMenuItem
                            key={c.label}
                            onClick={() => onStatusChange(lead.id, c.statuses[0])}
                          >
                            {c.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-1 mb-3">
                    {lead.email && (
                      <div className="flex items-center text-xs text-slate-500">
                        <Mail className="w-3 h-3 mr-1.5" />{' '}
                        <span className="truncate">{lead.email}</span>
                      </div>
                    )}
                    {lead.telefone && (
                      <div className="flex items-center text-xs text-slate-500">
                        <Phone className="w-3 h-3 mr-1.5" /> <span>{lead.telefone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                    <StatusChip
                      tone={leadStatusToTone(lead.status)}
                      label={lead.status}
                      className="scale-90 origin-left"
                    />
                    <div className="flex items-center gap-1.5">
                      {lead.valor_orcamento && (
                        <span className="text-xs font-medium text-slate-700 tabular-nums">
                          R$ {lead.valor_orcamento.toLocaleString('pt-BR')}
                        </span>
                      )}
                      {lead.expand?.colaborador_id && (
                        <Avatar className="h-5 w-5 ml-1">
                          <AvatarImage src={lead.expand.colaborador_id.avatar} />
                          <AvatarFallback className="text-[10px]">
                            {lead.expand.colaborador_id.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                  {lead.data_proximo_contato && (
                    <div className="mt-2 text-[10px] text-muted-foreground flex items-center justify-between">
                      <span>Próx. contato:</span>
                      <span
                        className={
                          new Date(lead.data_proximo_contato) < new Date()
                            ? 'text-rose-600 font-medium'
                            : ''
                        }
                      >
                        {formatDistanceToNow(new Date(lead.data_proximo_contato), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {colLeads.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400 border border-dashed rounded-lg bg-slate-50/50">
                  Nenhum lead nesta etapa
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
