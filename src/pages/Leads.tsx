import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getLeads, updateLead } from '@/services/leads'
import { Lead } from '@/types'
import { useRealtime } from '@/hooks/use-realtime'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, Calendar, Mail, Phone, MapPin, AlertCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/use-toast'

const STATUSES = ['Novo Contato', 'Agendado', 'Em Atendimento', 'Convertido', 'Perdido']

export default function LeadsPage() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState<Lead[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')
  const [loading, setLoading] = useState(true)

  const loadData = async (isRealtime = false) => {
    if (!isRealtime) setLoading(true)
    const data = await getLeads()
    setLeads(data)
    if (!isRealtime) setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('leads', () => loadData(true))

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        l.nome.toLowerCase().includes(search.toLowerCase()) ||
        (l.origem && l.origem.toLowerCase().includes(search.toLowerCase())) ||
        (l.email && l.email.toLowerCase().includes(search.toLowerCase())) ||
        (l.telefone && l.telefone.includes(search))
      const matchStatus = statusFilter === 'todos' || l.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [leads, search, statusFilter])

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    const leadId = e.dataTransfer.getData('leadId')
    if (!leadId) return

    const lead = leads.find((l) => l.id === leadId)
    if (lead && lead.status !== newStatus) {
      setLeads(leads.map((l) => (l.id === leadId ? { ...l, status: newStatus as any } : l)))
      try {
        await updateLead(leadId, { status: newStatus as any })
        toast({ title: 'Status Atualizado' })
      } catch (err) {
        toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
        loadData()
      }
    }
  }

  const KanbanColumn = ({ status }: { status: string }) => {
    const colLeads = filteredLeads.filter((l) => l.status === status)
    return (
      <div
        onDrop={(e) => handleDrop(e, status)}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col gap-3 w-[320px] shrink-0 bg-slate-100/80 rounded-xl p-4 h-full border border-slate-200/60 overflow-y-auto shadow-sm"
      >
        <h3 className="font-semibold text-sm flex items-center justify-between text-slate-700">
          {status}{' '}
          <Badge variant="secondary" className="bg-slate-200">
            {colLeads.length}
          </Badge>
        </h3>
        <div className="flex flex-col gap-3 min-h-[100px]">
          {colLeads.map((l) => {
            const isDelayed =
              l.data_proximo_contato && new Date(l.data_proximo_contato) < new Date()

            return (
              <div
                key={l.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData('leadId', l.id)}
                onClick={() => navigate(`/leads/${l.id}`)}
                className="group"
              >
                <Card className="hover:shadow-md transition-all border-none shadow-sm cursor-grab active:cursor-grabbing group-hover:-translate-y-1 duration-300">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <p className="font-semibold text-slate-900 line-clamp-1">{l.nome}</p>
                      {isDelayed && <AlertCircle className="w-4 h-4 text-destructive shrink-0" />}
                    </div>

                    <div className="space-y-1.5 mt-2">
                      {l.telefone && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Phone className="w-3 h-3" /> {l.telefone}
                        </p>
                      )}
                      {l.email && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                          <Mail className="w-3 h-3" /> {l.email}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                        <Target className="w-3 h-3" /> {l.procedimento_interesse || 'Não informado'}
                      </p>
                      {l.origem && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                          <MapPin className="w-3 h-3" /> {l.origem}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-2">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-[10px] bg-slate-50">
                          {l.tentativas_contato || 0} Tentativas
                        </Badge>
                        {isDelayed && (
                          <Badge variant="destructive" className="text-[10px]">
                            Atrasado
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{' '}
                        {new Date(l.created).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6 max-w-[1600px] mx-auto animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Gerenciamento de Leads
          </h1>
          <p className="text-muted-foreground">
            Acompanhe seu pipeline e arraste os cards para atualizar o status.
          </p>
        </div>
        <Button asChild className="shrink-0 hover:scale-105 transition-transform shadow-sm">
          <Link to="/leads/novo">
            <Plus className="mr-2 h-4 w-4" /> Novo Lead
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="kanban" className="flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3 rounded-xl border shadow-subtle">
          <TabsList className="w-fit">
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="lista">Lista</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar (Nome, Email, Tel)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="kanban" className="flex-1 overflow-x-auto mt-4 pb-4 outline-none">
          {loading ? (
            <div className="flex gap-4 h-full min-h-[500px]">
              {STATUSES.map((s) => (
                <div
                  key={s}
                  className="flex flex-col gap-3 w-[320px] shrink-0 bg-slate-100/50 rounded-xl p-4 h-full border border-slate-200/60 shadow-sm"
                >
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-36 w-full rounded-xl" />
                  <Skeleton className="h-36 w-full rounded-xl" />
                  <Skeleton className="h-36 w-full rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-4 h-full min-h-[500px]">
              {STATUSES.map((s) => (
                <KanbanColumn key={s} status={s} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="lista"
          className="flex-1 overflow-y-auto mt-4 bg-white rounded-xl shadow-subtle border outline-none"
        >
          {loading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Interesse</TableHead>
                  <TableHead className="text-center">Tentativas</TableHead>
                  <TableHead>Próximo Contato</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((l) => {
                  const isDelayed =
                    l.data_proximo_contato && new Date(l.data_proximo_contato) < new Date()
                  return (
                    <TableRow
                      key={l.id}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => navigate(`/leads/${l.id}`)}
                    >
                      <TableCell className="font-medium">
                        {l.nome}
                        {l.telefone && (
                          <span className="block text-xs text-muted-foreground font-normal">
                            {l.telefone}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-slate-50">
                          {l.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {l.procedimento_interesse || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-slate-100">
                          {l.tentativas_contato || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {l.data_proximo_contato ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm ${isDelayed ? 'text-destructive font-medium' : 'text-muted-foreground'}`}
                            >
                              {new Date(l.data_proximo_contato).toLocaleString('pt-BR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </span>
                            {isDelayed && <AlertCircle className="w-4 h-4 text-destructive" />}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filteredLeads.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum lead encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
function Target(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
