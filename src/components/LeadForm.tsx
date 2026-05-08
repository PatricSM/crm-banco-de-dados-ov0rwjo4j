import { useState, useEffect, useMemo } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { useAuth } from '@/hooks/use-auth'
import { Save } from 'lucide-react'

interface LeadFormProps {
  lead?: Partial<Lead>
  onSave: (data: Partial<Lead>) => Promise<void>
}

export function LeadForm({ lead, onSave }: LeadFormProps) {
  const { user } = useAuth()
  const [data, setData] = useState<Partial<Lead>>({
    status: 'Novo Contato',
    tentativas_contato: 0,
    ...lead,
  })
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (lead) setData(lead)
  }, [lead])

  useEffect(() => {
    if (user?.role === 'gestor') getUsers().then(setUsers)
  }, [user])

  const isDirty = useMemo(() => {
    if (!lead) return true
    return JSON.stringify(data) !== JSON.stringify(lead)
  }, [data, lead])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({
        ...data,
        colaborador_id: data.colaborador_id || user?.id,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Nome do Lead</Label>
          <Input
            required
            value={data.nome || ''}
            onChange={(e) => setData({ ...data, nome: e.target.value })}
            placeholder="Nome Completo"
          />
        </div>
        <div className="space-y-2">
          <Label>Telefone</Label>
          <Input
            value={data.telefone || ''}
            onChange={(e) => setData({ ...data, telefone: e.target.value })}
            placeholder="(00) 00000-0000"
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            type="email"
            value={data.email || ''}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            placeholder="email@exemplo.com"
          />
        </div>
        <div className="space-y-2">
          <Label>Procedimento de Interesse</Label>
          <Input
            value={data.procedimento_interesse || ''}
            onChange={(e) => setData({ ...data, procedimento_interesse: e.target.value })}
            placeholder="Ex: Implante"
          />
        </div>
        <div className="space-y-2">
          <Label>Origem</Label>
          <Input
            value={data.origem || ''}
            onChange={(e) => setData({ ...data, origem: e.target.value })}
            placeholder="Ex: Instagram"
          />
        </div>
        <div className="space-y-2">
          <Label>Tentativas de Contato</Label>
          <Input
            type="number"
            min="0"
            value={data.tentativas_contato || 0}
            onChange={(e) => setData({ ...data, tentativas_contato: parseInt(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label>Próximo Contato (Follow-up)</Label>
          <Input
            type="datetime-local"
            value={data.data_proximo_contato?.slice(0, 16) || ''}
            onChange={(e) =>
              setData({
                ...data,
                data_proximo_contato: e.target.value ? new Date(e.target.value).toISOString() : '',
              })
            }
          />
        </div>

        {user?.role === 'gestor' && (
          <div className="space-y-2">
            <Label>Responsável</Label>
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
      </div>

      <div className="space-y-2 pt-2">
        <Label className="text-rose-600 font-semibold">Objeções do Paciente</Label>
        <Textarea
          placeholder="Descreva os motivos pelos quais o lead não avançou ou tem dúvidas (preço, tempo, confiança...)"
          value={data.objecoes || ''}
          onChange={(e) => setData({ ...data, objecoes: e.target.value })}
          className="resize-none h-24 border-rose-100 focus-visible:ring-rose-500"
        />
      </div>

      <div className="pt-4 border-t flex justify-end">
        <Button
          type="submit"
          disabled={loading || !isDirty}
          className="transition-all hover:scale-[1.02] shadow-sm"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </form>
  )
}
