import { useState } from 'react'
import { Orcamento } from '@/types'
import { createOrcamento, updateOrcamento, deleteOrcamento } from '@/services/orcamentos'
import { createHistorico } from '@/services/historico'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { Plus, FileText, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { StatusChip } from './StatusChip'
import { orcamentoStatusToTone } from '@/lib/leadStatus'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface OrcamentosListProps {
  leadId: string
  orcamentos: Orcamento[]
}

export function OrcamentosList({ leadId, orcamentos }: OrcamentosListProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Orcamento>>({
    status: 'Pendente',
    forma_pagamento: 'Pix',
    desconto_aplicado: 0,
    valor_total: 0,
    procedimentos: '',
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const valor = Number(formData.valor_total)
    const desc = Number(formData.desconto_aplicado)

    if (desc > valor * 0.2) {
      toast({
        title: 'Desconto Inválido',
        description: 'O desconto máximo permitido é de 20%.',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      await createOrcamento({ ...formData, lead_id: leadId })
      await createHistorico({
        lead_id: leadId,
        acao: 'Orçamento Criado',
        detalhes: `Orçamento de R$ ${valor.toFixed(2)} criado.`,
      })
      toast({ title: 'Orçamento salvo com sucesso!' })
      setOpen(false)
      setFormData({
        status: 'Pendente',
        forma_pagamento: 'Pix',
        desconto_aplicado: 0,
        valor_total: 0,
        procedimentos: '',
      })
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este orçamento permanentemente?')) return
    try {
      await deleteOrcamento(id)
      toast({ title: 'Orçamento excluído!' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary/60" /> Orçamentos
        </h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8">
              <Plus className="w-4 h-4 mr-2" /> Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>Novo Orçamento</DialogTitle>
                <DialogDescription>Crie uma proposta financeira para este lead.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Procedimentos</Label>
                  <Input
                    required
                    value={formData.procedimentos}
                    onChange={(e) => setFormData({ ...formData, procedimentos: e.target.value })}
                    placeholder="Ex: Clareamento, Limpeza..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Valor Total (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      required
                      value={formData.valor_total || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, valor_total: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Desconto (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.desconto_aplicado || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, desconto_aplicado: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Validade</Label>
                    <Input
                      type="date"
                      required
                      value={formData.validade?.slice(0, 10) || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          validade: new Date(e.target.value).toISOString(),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Forma de Pgto</Label>
                    <Select
                      value={formData.forma_pagamento}
                      onValueChange={(v) => setFormData({ ...formData, forma_pagamento: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pix">Pix</SelectItem>
                        <SelectItem value="Cartão">Cartão</SelectItem>
                        <SelectItem value="Boleto">Boleto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
        {orcamentos.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            Nenhum orçamento registrado.
          </div>
        ) : (
          orcamentos.map((o) => (
            <div
              key={o.id}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative group"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono font-medium text-slate-500">
                  #QT-{o.id.slice(0, 6).toUpperCase()}
                </span>
                <StatusChip status={o.status} tone={orcamentoStatusToTone(o.status)} />
              </div>

              <div className="mb-3">
                <p
                  className="text-sm font-medium text-slate-800 line-clamp-1"
                  title={o.procedimentos}
                >
                  {o.procedimentos || 'Sem descrição'}
                </p>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  R$ {o.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span>{format(new Date(o.created), 'dd MMM yyyy', { locale: ptBR })}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-slate-400 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDelete(o.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
