import { useState, useEffect } from 'react'
import { Orcamento } from '@/types'
import {
  getOrcamentosByLead,
  createOrcamento,
  updateOrcamento,
  deleteOrcamento,
} from '@/services/orcamentos'
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
import { Trash2, Plus } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function OrcamentosList({ leadId }: { leadId: string }) {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Orcamento>>({
    status: 'Pendente',
    forma_pagamento: 'Pix',
    desconto_aplicado: 0,
    valor_total: 0,
  })

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getOrcamentosByLead(leadId)
      setOrcamentos(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (leadId && leadId !== 'novo') loadData()
    else setLoading(false)
  }, [leadId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const valor = Number(formData.valor_total)
    const desc = Number(formData.desconto_aplicado)

    if (desc > valor * 0.2) {
      toast({
        title: 'Desconto Inválido',
        description: 'O desconto máximo permitido é de 20%. Necessário aprovação do gestor.',
        variant: 'destructive',
      })
      return
    }

    try {
      await createOrcamento({ ...formData, lead_id: leadId })
      await createHistorico({
        lead_id: leadId,
        acao: 'Orçamento Criado',
        detalhes: `Orçamento no valor de R$ ${valor} criado.`,
      })
      toast({ title: 'Orçamento salvo com sucesso!' })
      setShowForm(false)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateOrcamento(id, { status: newStatus as any })
      toast({ title: 'Status atualizado!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteOrcamento(id)
      toast({ title: 'Orçamento excluído!' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  if (leadId === 'novo') return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-800">Orçamentos e Controle Financeiro</h3>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            size="sm"
            variant="outline"
            className="transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Orçamento
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-primary/20 shadow-sm animate-fade-in">
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Procedimentos</Label>
                  <Input
                    required
                    value={formData.procedimentos || ''}
                    onChange={(e) => setFormData({ ...formData, procedimentos: e.target.value })}
                    placeholder="Ex: Clareamento, Limpeza"
                  />
                </div>
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
                  <Label>Desconto Aplicado (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.desconto_aplicado || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, desconto_aplicado: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Validade</Label>
                  <Input
                    type="date"
                    required
                    value={formData.validade?.slice(0, 10) || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, validade: new Date(e.target.value).toISOString() })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Forma de Pagamento</Label>
                  <Select
                    value={formData.forma_pagamento}
                    onValueChange={(v) => setFormData({ ...formData, forma_pagamento: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pix">Pix</SelectItem>
                      <SelectItem value="Cartão">Cartão</SelectItem>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                      <SelectItem value="Transferência">Transferência</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status Inicial</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Aprovado">Aprovado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Orçamento</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : orcamentos.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          Nenhum orçamento registrado para este lead.
        </p>
      ) : (
        <div className="space-y-3">
          {orcamentos.map((o) => (
            <Card
              key={o.id}
              className="shadow-subtle border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-800">{o.procedimentos}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <span className="font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      R$ {o.valor_total}
                    </span>
                    <span>•</span>
                    <span>Desc: R$ {o.desconto_aplicado}</span>
                    <span>•</span>
                    <span>{o.forma_pagamento}</span>
                    <span>•</span>
                    <span>Validade: {new Date(o.validade).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Select value={o.status} onValueChange={(v) => handleStatusChange(o.id, v)}>
                    <SelectTrigger className="w-[130px] h-8 text-xs bg-slate-50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pendente">Pendente</SelectItem>
                      <SelectItem value="Aprovado">Aprovado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 h-8 w-8 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Orçamento?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita e os dados deste orçamento serão perdidos.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(o.id)}
                          className="bg-destructive hover:bg-destructive/90 text-white"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
