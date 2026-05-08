import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Lead } from '@/types'
import { getLead, createLead, updateLead } from '@/services/leads'
import { LeadForm } from '@/components/LeadForm'
import { LeadHistory } from '@/components/LeadHistory'
import { createHistorico } from '@/services/historico'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'

const STATUSES = ['Novo', 'Em Atendimento', 'Agendado', 'Compareceu', 'Vendido', 'Perdido']

export default function LeadDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState<Lead | null>(null)

  const loadLead = async () => {
    if (id !== 'novo') {
      const data = await getLead(id!)
      setLead(data)
    }
  }

  useEffect(() => {
    loadLead()
  }, [id])

  const handleSave = async (data: Partial<Lead>) => {
    try {
      if (id === 'novo') {
        const created = await createLead(data)
        toast({ title: 'Lead Criado', description: 'O lead foi salvo com sucesso.' })
        navigate(`/leads/${created.id}`)
      } else {
        await updateLead(id!, data)
        await createHistorico({
          lead_id: id!,
          acao: 'Detalhes Atualizados',
          detalhes: 'Informações base do lead foram editadas.',
        })
        toast({ title: 'Lead Atualizado', description: 'O lead foi salvo com sucesso.' })
        loadLead()
      }
    } catch (e: any) {
      toast({ title: 'Erro ao Salvar', description: e.message, variant: 'destructive' })
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!lead?.id || lead.status === newStatus) return
    try {
      await updateLead(lead.id, { status: newStatus as any })
      await createHistorico({
        lead_id: lead.id,
        acao: 'Status Alterado',
        detalhes: `Status movido para: ${newStatus}`,
      })
      toast({ title: 'Status Atualizado' })
      loadLead()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="max-w-5xl mx-auto w-full space-y-6 pb-12 animate-fade-in">
      <Button
        variant="ghost"
        onClick={() => navigate('/leads')}
        className="text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {id === 'novo' ? 'Adicionar Novo Lead' : lead?.nome}
          </h1>
          {id !== 'novo' && lead?.expand?.colaborador_id && (
            <p className="text-muted-foreground mt-1">
              Responsável: {lead.expand.colaborador_id.name}
            </p>
          )}
        </div>
      </div>

      {id !== 'novo' && lead && (
        <div className="flex items-center w-full bg-white p-6 rounded-xl shadow-subtle border overflow-x-auto">
          {STATUSES.map((s, i) => {
            const isActive = lead.status === s
            const isPast = STATUSES.indexOf(lead.status) >= i
            return (
              <div key={s} className="flex items-center shrink-0">
                <button
                  onClick={() => handleStatusChange(s)}
                  className={`h-9 px-5 rounded-full flex items-center justify-center text-sm font-medium border transition-all hover:scale-105 active:scale-95 ${isActive ? 'bg-primary text-primary-foreground border-primary shadow-md' : isPast ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20' : 'bg-slate-50 text-muted-foreground hover:bg-slate-100'}`}
                >
                  {isPast && <CheckCircle2 className="w-4 h-4 mr-2 opacity-80" />}
                  {s}
                </button>
                {i < STATUSES.length - 1 && (
                  <div
                    className={`w-6 sm:w-10 h-[2px] mx-2 ${isPast ? 'bg-primary/40' : 'bg-slate-200'}`}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 items-start">
        <div className="bg-white border rounded-xl p-6 shadow-subtle">
          <h2 className="text-xl font-semibold mb-6 text-slate-800">Ficha do Lead</h2>
          <LeadForm lead={lead || undefined} onSave={handleSave} />
        </div>

        {id !== 'novo' && lead && (
          <div className="bg-white border rounded-xl p-6 shadow-subtle sticky top-20">
            <h2 className="text-xl font-semibold mb-6 text-slate-800">Timeline de Interações</h2>
            <LeadHistory leadId={lead.id} />
          </div>
        )}
      </div>
    </div>
  )
}
