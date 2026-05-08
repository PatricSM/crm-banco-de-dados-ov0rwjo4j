import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import pb from '@/lib/pocketbase/client'
import { Agendamento, Lead, User } from '@/types'
import { toast } from '@/hooks/use-toast'
import { createAgendamento, updateAgendamento, deleteAgendamento } from '@/services/agendamentos'
import { useAuth } from '@/hooks/use-auth'

function toLocalDatetimeString(dateStr?: string | Date) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const tzOffset = d.getTimezoneOffset() * 60000
  const localIso = new Date(d.getTime() - tzOffset).toISOString()
  return localIso.slice(0, 16)
}

interface Props {
  agendamento?: Agendamento | Partial<Agendamento>
  initialDate?: Date
  profissionais: User[]
  onSuccess: () => void
  onCancel: () => void
}

export function AgendamentoForm({
  agendamento,
  initialDate,
  profissionais,
  onSuccess,
  onCancel,
}: Props) {
  const { user } = useAuth()
  const isGestor = user?.role === 'gestor'

  const [leads, setLeads] = useState<Lead[]>([])

  const [formData, setFormData] = useState({
    lead_id: agendamento?.lead_id || '',
    profissional_id: agendamento?.profissional_id || (isGestor ? '' : user?.id || ''),
    data_inicio: agendamento?.data_inicio
      ? toLocalDatetimeString(agendamento.data_inicio)
      : toLocalDatetimeString(initialDate || new Date()),
    data_fim: agendamento?.data_fim ? toLocalDatetimeString(agendamento.data_fim) : '',
    procedimento: agendamento?.procedimento || '',
    status: agendamento?.status || 'Agendado',
    observacoes: agendamento?.observacoes || '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    pb.collection('leads').getFullList<Lead>({ sort: 'nome' }).then(setLeads)
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...formData,
        data_inicio: new Date(formData.data_inicio).toISOString(),
        data_fim: formData.data_fim ? new Date(formData.data_fim).toISOString() : '',
      }

      if (agendamento?.id) {
        await updateAgendamento(agendamento.id, payload)
        toast({ title: 'Agendamento atualizado!' })
      } else {
        await createAgendamento(payload)
        toast({ title: 'Agendamento criado!' })
      }
      onSuccess()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!agendamento?.id || !isGestor) return
    try {
      await deleteAgendamento(agendamento.id)
      toast({ title: 'Agendamento excluído!' })
      onSuccess()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label>Lead</Label>
          <Select
            value={formData.lead_id}
            onValueChange={(v) => handleChange('lead_id', v)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um lead..." />
            </SelectTrigger>
            <SelectContent>
              {leads.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Profissional</Label>
          <Select
            value={formData.profissional_id}
            onValueChange={(v) => handleChange('profissional_id', v)}
            required
            disabled={!isGestor}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o profissional..." />
            </SelectTrigger>
            <SelectContent>
              {profissionais?.map((p: User) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data Início</Label>
            <Input
              type="datetime-local"
              value={formData.data_inicio}
              onChange={(e) => handleChange('data_inicio', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Data Fim</Label>
            <Input
              type="datetime-local"
              value={formData.data_fim}
              onChange={(e) => handleChange('data_fim', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => handleChange('status', v)}
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Agendado">Agendado</SelectItem>
                <SelectItem value="Confirmado">Confirmado</SelectItem>
                <SelectItem value="Compareceu">Compareceu</SelectItem>
                <SelectItem value="No-show">No-show</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Procedimento</Label>
            <Input
              value={formData.procedimento}
              onChange={(e) => handleChange('procedimento', e.target.value)}
              placeholder="Ex: Avaliação"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Observações</Label>
          <Textarea
            value={formData.observacoes}
            onChange={(e) => handleChange('observacoes', e.target.value)}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4 border-t">
        {agendamento?.id && isGestor ? (
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
            Excluir
          </Button>
        ) : (
          <div />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            Salvar
          </Button>
        </div>
      </div>
    </form>
  )
}
