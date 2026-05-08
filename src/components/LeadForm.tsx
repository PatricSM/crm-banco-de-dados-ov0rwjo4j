import { useState, useEffect } from 'react'
import { Lead, User } from '@/types'
import { getUsers } from '@/services/users'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'

interface LeadFormProps {
  lead?: Partial<Lead>
  onSave: (data: Partial<Lead>) => Promise<void>
}

export function LeadForm({ lead, onSave }: LeadFormProps) {
  const { user } = useAuth()
  const [data, setData] = useState<Partial<Lead>>(lead || {})
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.role === 'gestor') getUsers().then(setUsers)
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({
        ...data,
        colaborador_id: data.colaborador_id || user?.id,
        status: data.status || 'Novo',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
      <div className="space-y-2">
        <Label>Nome do Lead</Label>
        <Input
          required
          value={data.nome || ''}
          onChange={(e) => setData({ ...data, nome: e.target.value })}
          placeholder="Nome Completo ou Empresa"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Origem</Label>
          <Input
            value={data.origem || ''}
            onChange={(e) => setData({ ...data, origem: e.target.value })}
            placeholder="Ex: Site, Indicação..."
          />
        </div>
        <div className="space-y-2">
          <Label>Valor do Orçamento (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={data.valor_orcamento || ''}
            onChange={(e) => setData({ ...data, valor_orcamento: parseFloat(e.target.value) })}
            placeholder="0.00"
          />
        </div>
      </div>

      {user?.role === 'gestor' && (
        <div className="space-y-2">
          <Label>Colaborador Responsável</Label>
          <Select
            value={data.colaborador_id}
            onValueChange={(v) => setData({ ...data, colaborador_id: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Atribuir a..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Agendamento</Label>
          <Input
            type="datetime-local"
            value={data.data_agendamento?.slice(0, 16) || ''}
            onChange={(e) =>
              setData({ ...data, data_agendamento: new Date(e.target.value).toISOString() })
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Comparecimento</Label>
          <Input
            type="datetime-local"
            value={data.data_comparecimento?.slice(0, 16) || ''}
            onChange={(e) =>
              setData({ ...data, data_comparecimento: new Date(e.target.value).toISOString() })
            }
          />
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Salvando...' : 'Salvar Detalhes'}
        </Button>
      </div>
    </form>
  )
}
