import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { format, formatDistanceToNow, isBefore, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Lead, Historico, Orcamento } from '@/types'
import { getLead, updateLead, deleteLead } from '@/services/leads'
import { getHistoricoByLead, createHistorico } from '@/services/historico'
import { getOrcamentosByLead } from '@/services/orcamentos'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { leadStatusToTone } from '@/lib/leadStatus'

import { LeadForm } from '@/components/LeadForm'
import { LeadHistory } from '@/components/LeadHistory'
import { OrcamentosList } from '@/components/OrcamentosList'
import { LeadAgendamentosList } from '@/components/agendamentos/LeadAgendamentosList'
import { StatusChip } from '@/components/StatusChip'
import { PageHeader } from '@/components/PageHeader'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  ArrowLeft,
  Mail,
  Phone,
  User,
  Target,
  DollarSign,
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  Activity,
  History,
  TrendingUp,
} from 'lucide-react'

export default function LeadDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [lead, setLead] = useState<Lead | null>(null)
  const [historico, setHistorico] = useState<Historico[]>([])
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(true)

  const [editOpen, setEditOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const loadAllData = async (isRealtime = false) => {
    if (!id || id === 'novo') return
    if (!isRealtime) setLoading(true)
    try {
      const [leadData, histData, orcData] = await Promise.all([
        getLead(id),
        getHistoricoByLead(id),
        getOrcamentosByLead(id),
      ])
      setLead(leadData)
      setHistorico(histData)
      setOrcamentos(orcData)
    } catch (e) {
      toast({ title: 'Erro', description: 'Lead não encontrado.', variant: 'destructive' })
      navigate('/leads')
    } finally {
      if (!isRealtime) setLoading(false)
    }
  }

  useEffect(() => {
    loadAllData()
  }, [id])

  useRealtime('leads', () => loadAllData(true))
  useRealtime('historico', () => loadAllData(true))
  useRealtime('orcamentos', () => loadAllData(true))

  const handleStatusChange = async (newStatus: string) => {
    if (!lead?.id || lead.status === newStatus) return
    try {
      const oldStatus = lead.status
      await updateLead(lead.id, { status: newStatus as any })
      await createHistorico({
        lead_id: lead.id,
        acao: 'Mudança de Status',
        detalhes: `Status alterado de "${oldStatus}" para "${newStatus}".`,
      })
      toast({ title: 'Status Atualizado' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!lead?.id) return
    try {
      await deleteLead(lead.id)
      toast({ title: 'Lead Excluído', description: 'O lead foi removido com sucesso.' })
      navigate('/leads')
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const handleSaveEdit = async (data: Partial<Lead>) => {
    if (!lead?.id) return
    try {
      await updateLead(lead.id, data)
      await createHistorico({
        lead_id: lead.id,
        acao: 'Edição',
        detalhes: 'Informações do lead foram atualizadas.',
      })
      toast({ title: 'Lead Atualizado', description: 'As informações foram salvas.' })
      setEditOpen(false)
    } catch (e: any) {
      toast({ title: 'Erro ao Salvar', description: e.message, variant: 'destructive' })
    }
  }

  if (loading || !lead) {
    return (
      <div className="max-w-[1400px] mx-auto w-full space-y-6 animate-fade-in p-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Skeleton className="h-[500px] rounded-2xl" />
          <Skeleton className="h-[500px] lg:col-span-2 rounded-2xl" />
          <Skeleton className="h-[500px] rounded-2xl" />
        </div>
      </div>
    )
  }

  const totalBudgets = orcamentos.reduce((sum, o) => sum + o.valor_total, 0)
  const allDates = [
    lead.updated,
    ...historico.map((h) => h.created),
    ...orcamentos.map((o) => o.created),
  ].map((d) => new Date(d).getTime())
  const lastActivityDate = new Date(Math.max(...allDates))

  const isNextContactUrgent =
    lead.data_proximo_contato &&
    isBefore(new Date(lead.data_proximo_contato), addDays(new Date(), 7))

  return (
    <div className="max-w-[1400px] mx-auto w-full space-y-6 pb-28 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/leads')}
          className="text-muted-foreground hover:text-foreground -ml-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Voltar
        </Button>
      </div>

      {/* Hero Section */}
      <div className="bg-white border rounded-2xl p-6 md:p-8 shadow-subtle flex flex-col md:flex-row gap-6 md:items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />

        <div className="flex items-center gap-5 relative z-10">
          <Avatar className="h-20 w-20 ring-4 ring-white shadow-md">
            <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
              {lead.nome.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{lead.nome}</h1>
              <StatusChip
                status={lead.status}
                tone={leadStatusToTone(lead.status)}
                className="text-xs px-3 py-1"
              />
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              {lead.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {lead.email}
                </span>
              )}
              {lead.telefone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> {lead.telefone}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 md:gap-10 relative z-10 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" /> Total Orçado
            </p>
            <p className="text-xl font-bold text-slate-900">
              R$ {totalBudgets.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="w-px h-10 bg-slate-200 hidden md:block" />
          <div className="space-y-1 text-center md:text-left">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Última Atividade
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {formatDistanceToNow(lastActivityDate, { locale: ptBR, addSuffix: true })}
            </p>
          </div>
          <div className="w-px h-10 bg-slate-200 hidden md:block" />
          <div className="space-y-1 text-center md:text-left">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" /> Cliente Desde
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {format(new Date(lead.created), 'dd MMM yyyy', { locale: ptBR })}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-2 absolute -top-2 -right-2 md:static md:m-0"
              >
                <MoreVertical className="w-4 h-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Ações do Lead</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Edit className="w-4 h-4 mr-2" /> Editar Informações
              </DropdownMenuItem>
              {user?.role === 'gestor' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    onClick={() => setDeleteConfirmOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Excluir Lead
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Info Card */}
        <div className="lg:col-span-1 bg-white border rounded-2xl p-6 shadow-subtle flex flex-col h-[calc(100vh-280px)] min-h-[500px] sticky top-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Detalhes</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-primary"
              onClick={() => setEditOpen(true)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-5 flex-1 overflow-y-auto pr-2">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Mail className="w-3 h-3" /> Email
              </p>
              <p className="text-sm font-medium text-slate-900">{lead.email || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Phone className="w-3 h-3" /> Telefone
              </p>
              <p className="text-sm font-medium text-slate-900">
                {lead.telefone || 'Não informado'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Target className="w-3 h-3" /> Origem
              </p>
              <p className="text-sm font-medium text-slate-900">{lead.origem || 'Direto'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3 h-3" /> Responsável
              </p>
              <p className="text-sm font-medium text-slate-900">
                {lead.expand?.colaborador_id?.name || 'Não atribuído'}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3" /> Interesse
              </p>
              <p className="text-sm font-medium text-slate-900">
                {lead.procedimento_interesse || 'Não especificado'}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <DollarSign className="w-3 h-3" /> Valor Estimado
              </p>
              <p className="text-sm font-medium text-slate-900">
                R${' '}
                {(lead.valor_orcamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            {lead.data_proximo_contato && (
              <div
                className={`p-3 rounded-lg border ${isNextContactUrgent ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-100'}`}
              >
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 ${isNextContactUrgent ? 'text-amber-700' : 'text-blue-700'}`}
                >
                  <Calendar className="w-3 h-3" /> Próximo Contato
                </p>
                <p
                  className={`text-sm font-bold ${isNextContactUrgent ? 'text-amber-900' : 'text-blue-900'}`}
                >
                  {format(new Date(lead.data_proximo_contato), 'dd/MM/yyyy')}
                  <span className="block text-xs font-medium mt-0.5 opacity-80">
                    {formatDistanceToNow(new Date(lead.data_proximo_contato), {
                      locale: ptBR,
                      addSuffix: true,
                    })}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Center Column: Timeline */}
        <div className="lg:col-span-2 bg-white border rounded-2xl p-6 shadow-subtle h-[calc(100vh-280px)] min-h-[500px]">
          <LeadHistory leadId={lead.id} history={historico} />
        </div>

        {/* Right Column: Budgets and Agendamentos */}
        <div className="lg:col-span-1 flex flex-col gap-6 h-[calc(100vh-280px)] min-h-[500px]">
          <div className="bg-white border rounded-2xl p-6 shadow-subtle flex-1 overflow-y-auto">
            <LeadAgendamentosList leadId={lead.id} />
          </div>
          <div className="bg-white border rounded-2xl p-6 shadow-subtle flex-1 overflow-y-auto">
            <OrcamentosList leadId={lead.id} orcamentos={orcamentos} />
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-4 z-40 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.05)]">
        <div className="max-w-[1400px] mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            Gerenciamento rápido de status
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-slate-300 text-slate-600 hover:bg-slate-100"
              onClick={() => handleStatusChange('Perdido')}
              disabled={lead.status === 'Perdido'}
            >
              Descartar Lead
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200"
              onClick={() => handleStatusChange('Perdido')}
              disabled={lead.status === 'Perdido'}
            >
              Marcar como Perdido
            </Button>
            <Button
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
              onClick={() => handleStatusChange('Convertido')}
              disabled={lead.status === 'Convertido'}
            >
              Marcar como Convertido
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-1">
            <h2 className="text-xl font-bold mb-6">Editar Lead</h2>
            <LeadForm lead={lead} onSave={handleSaveEdit} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Excluirá permanentemente o lead "{lead?.nome}" e todo
              o seu histórico e orçamentos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
