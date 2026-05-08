import { useState, useEffect } from 'react'
import { Historico } from '@/types'
import { getHistoricoByLead, createHistorico } from '@/services/historico'
import { useRealtime } from '@/hooks/use-realtime'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function LeadHistory({ leadId }: { leadId: string }) {
  const [history, setHistory] = useState<Historico[]>([])
  const [acao, setAcao] = useState('')
  const [detalhes, setDetalhes] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = async (isRealtime = false) => {
    if (!isRealtime) setLoading(true)
    setHistory(await getHistoricoByLead(leadId))
    if (!isRealtime) setLoading(false)
  }
  useEffect(() => {
    loadData()
  }, [leadId])
  useRealtime('historico', () => loadData(true))

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!acao) return
    await createHistorico({ lead_id: leadId, acao, detalhes })
    setAcao('')
    setDetalhes('')
  }

  return (
    <div className="flex flex-col h-full animate-slide-up">
      <div className="border-l-2 border-primary/20 ml-3 pl-6 space-y-6 max-h-[400px] overflow-y-auto pb-4 pr-2">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-primary/20 ring-4 ring-card" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-48 mb-2" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))
        ) : history.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum histórico registrado.</p>
        ) : (
          history.map((h) => (
            <div
              key={h.id}
              className="relative hover:bg-slate-50 p-2 -ml-2 rounded-lg transition-colors group"
            >
              <div className="absolute -left-[23px] top-3.5 h-3 w-3 rounded-full bg-primary ring-4 ring-card transition-transform group-hover:scale-125" />
              <p className="text-sm font-semibold text-slate-900">{h.acao}</p>
              {h.detalhes && <p className="text-sm text-slate-600 mt-0.5">{h.detalhes}</p>}
              <p className="text-xs text-muted-foreground/60 mt-1">
                {new Date(h.created).toLocaleString('pt-BR')}
              </p>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleAdd}
        className="mt-8 flex flex-col gap-3 bg-muted/20 p-4 rounded-lg border"
      >
        <h4 className="text-sm font-medium flex items-center gap-2 mb-1">
          <Plus className="h-4 w-4 text-primary" /> Nova Interação
        </h4>
        <Input
          value={acao}
          onChange={(e) => setAcao(e.target.value)}
          placeholder="Ação (ex: Ligação realizada)"
          required
        />
        <Input
          value={detalhes}
          onChange={(e) => setDetalhes(e.target.value)}
          placeholder="Detalhes da interação (opcional)"
        />
        <Button type="submit" variant="secondary" className="self-end mt-1">
          Registrar
        </Button>
      </form>
    </div>
  )
}
