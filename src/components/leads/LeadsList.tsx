import { Lead } from '@/types'
import { Link, useNavigate } from 'react-router-dom'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Eye, Edit, Archive } from 'lucide-react'
import { StatusChip } from '@/components/StatusChip'
import { leadStatusToTone } from '@/lib/leadStatus'
import { EmptyState } from '@/components/EmptyState'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Skeleton } from '@/components/ui/skeleton'

interface LeadsListProps {
  leads: Lead[]
  isLoading: boolean
  page: number
  totalPages: number
  onPageChange: (p: number) => void
  selectedLeads?: string[]
  onToggleSelect?: (id: string) => void
  onToggleSelectAll?: () => void
}

export function LeadsList({
  leads,
  isLoading,
  page,
  totalPages,
  onPageChange,
  selectedLeads = [],
  onToggleSelect,
  onToggleSelectAll,
}: LeadsListProps) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <EmptyState
        title="Nenhum lead encontrado"
        description="Ajuste os filtros ou crie um novo lead."
      />
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              {onToggleSelectAll && (
                <TableHead className="w-[40px] px-4">
                  <Checkbox
                    checked={leads.length > 0 && leads.every((l) => selectedLeads.includes(l.id))}
                    onCheckedChange={onToggleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              <TableHead>Nome</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valor estimado</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Atualizado</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow
                key={lead.id}
                className="group hover:bg-slate-50/80 transition-colors"
                data-state={selectedLeads.includes(lead.id) ? 'selected' : undefined}
              >
                {onToggleSelect && (
                  <TableCell className="w-[40px] px-4">
                    <Checkbox
                      checked={selectedLeads.includes(lead.id)}
                      onCheckedChange={() => onToggleSelect(lead.id)}
                      aria-label={`Select ${lead.nome}`}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <Link
                    to={`/leads/${lead.id}`}
                    className="font-medium text-slate-900 hover:text-primary hover:underline"
                  >
                    {lead.nome}
                  </Link>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-700">{lead.email || '-'}</span>
                    <span className="text-xs text-muted-foreground">{lead.telefone || '-'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusChip tone={leadStatusToTone(lead.status)} label={lead.status} />
                </TableCell>
                <TableCell className="tabular-nums text-slate-700">
                  {lead.valor_orcamento
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        lead.valor_orcamento,
                      )
                    : '-'}
                </TableCell>
                <TableCell>
                  {lead.expand?.colaborador_id ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={lead.expand.colaborador_id.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {lead.expand.colaborador_id.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-slate-700">
                        {lead.expand.colaborador_id.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(lead.updated), { addSuffix: true, locale: ptBR })}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}`)}>
                        <Eye className="mr-2 h-4 w-4" /> Ver
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/leads/${lead.id}?edit=true`)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-rose-600 focus:text-rose-700 focus:bg-rose-50">
                        <Archive className="mr-2 h-4 w-4" /> Arquivar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center p-4 border-t bg-slate-50/50">
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1
              return (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`flex items-center justify-center h-9 w-9 rounded-md text-sm font-medium transition-all ${
                    page === p
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
