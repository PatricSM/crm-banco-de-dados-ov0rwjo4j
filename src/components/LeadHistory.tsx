import { useState } from 'react'
import { Historico } from '@/types'
import { createHistorico } from '@/services/historico'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/use-toast'

interface LeadHistoryProps {
  leadId: string
  history: Historico[]
}

export function LeadHistory({ leadId, history }: LeadHistoryProps) {
  const [acao, setAcao] = useState('Observação')
  const [detalhes, setDetalhes] = useState('')
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!detalhes.trim()) return
    setSaving(true)
    try {
      await createHistorico({ lead_id: leadId, acao, detalhes })
      setAcao('Observação')
      setDetalhes('')
      setOpen(false)
      toast({ title: 'Nota adicionada com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const getDotColor = (acaoStr: string) => {
    const l = acaoStr.toLowerCase()
    if (l.includes('ligação') || l.includes('telefone')) return 'bg-blue-500'
    if (l.includes('email') || l.includes('e-mail')) return 'bg-violet-500'
    if (l.includes('agendamento') || l.includes('agendado')) return 'bg-amber-500'
    if (l.includes('atendimento') || l.includes('status')) return 'bg-emerald-500'
    if (l.includes('orçamento')) return 'bg-teal-500'
    return 'bg-slate-400'
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary/60" /> Histórico de Interações
        </h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8">
              <Plus className="w-4 h-4 mr-2" /> Adicionar Nota
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAdd}>
              <DialogHeader>
                <DialogTitle>Nova Interação</DialogTitle>
                <DialogDescription>
                  Registre uma nova observação, ligação ou contato feito com o lead.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Textarea
                  placeholder="Detalhes da interação..."
                  value={detalhes}
                  onChange={(e) => setDetalhes(e.target.value)}
                  className="min-h-[120px]"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar Nota'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        {history.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Nenhuma interação registrada.
          </div>
        ) : (
          <div className="relative pl-5 border-l-2 border-slate-100 space-y-6 pb-6">
            {history.map((h) => (
              <div key={h.id} className="relative group">
                <div
                  className={`absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${getDotColor(
                    h.acao,
                  )} transition-transform group-hover:scale-125`}
                />
                <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 p-3 rounded-lg transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-slate-900">{h.acao}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(h.created), 'dd MMM, HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                  {h.detalhes && (
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {h.detalhes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
