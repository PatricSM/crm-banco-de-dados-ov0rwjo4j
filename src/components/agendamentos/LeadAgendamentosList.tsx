import { useEffect, useState } from 'react'
import { getAgendamentosByLead } from '@/services/agendamentos'
import { Agendamento, User } from '@/types'
import { AgendamentoCard } from './AgendamentoCard'
import { useRealtime } from '@/hooks/use-realtime'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AgendamentoForm } from './AgendamentoForm'
import pb from '@/lib/pocketbase/client'

export function LeadAgendamentosList({ leadId }: { leadId: string }) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [profissionais, setProfissionais] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [selected, setSelected] = useState<Agendamento | undefined>()

  const loadData = async () => {
    try {
      const [data, profs] = await Promise.all([
        getAgendamentosByLead(leadId),
        pb.collection('users').getFullList<User>(),
      ])
      setAgendamentos(data)
      setProfissionais(profs)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [leadId])
  useRealtime('agendamentos', () => loadData())

  const handleOpen = (apt?: Agendamento) => {
    setSelected(apt)
    setFormOpen(true)
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          Agendamentos
        </h3>
        <Button variant="ghost" size="sm" className="text-primary h-8" onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-1" /> Novo
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
        </div>
      ) : agendamentos.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-4">Nenhum agendamento.</p>
      ) : (
        <div className="space-y-3">
          {agendamentos.map((a) => (
            <div key={a.id} onClick={() => handleOpen(a)}>
              <AgendamentoCard agendamento={a} />
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle className="sr-only">Agendamento</DialogTitle>
          <DialogDescription className="sr-only">Formulário</DialogDescription>
          <div className="pt-2">
            <h2 className="text-xl font-bold mb-4">{selected ? 'Editar' : 'Novo'} Agendamento</h2>
            <AgendamentoForm
              agendamento={selected || { lead_id: leadId }}
              profissionais={profissionais}
              onSuccess={() => setFormOpen(false)}
              onCancel={() => setFormOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
