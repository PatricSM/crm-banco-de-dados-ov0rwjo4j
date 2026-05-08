import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getLeads } from '@/services/leads'
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
import { Plus, Search } from 'lucide-react'

const STATUSES = ['Novo', 'Em Atendimento', 'Agendado', 'Compareceu', 'Vendido', 'Perdido']

export default function LeadsPage() {
  const navigate = useNavigate()
  const [leads, setLeads] = useState<Lead[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos')

  const loadData = async () => setLeads(await getLeads())
  useEffect(() => {
    loadData()
  }, [])
  useRealtime('leads', loadData)

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        l.nome.toLowerCase().includes(search.toLowerCase()) ||
        (l.origem && l.origem.toLowerCase().includes(search.toLowerCase()))
      const matchStatus = statusFilter === 'todos' || l.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [leads, search, statusFilter])

  const KanbanColumn = ({ status }: { status: string }) => {
    const colLeads = filteredLeads.filter((l) => l.status === status)
    return (
      <div className="flex flex-col gap-3 w-80 shrink-0 bg-slate-100 rounded-xl p-4 h-full border border-slate-200/60 overflow-y-auto shadow-sm">
        <h3 className="font-semibold text-sm flex items-center justify-between text-slate-700">
          {status}{' '}
          <Badge variant="secondary" className="bg-slate-200">
            {colLeads.length}
          </Badge>
        </h3>
        <div className="flex flex-col gap-3">
          {colLeads.map((l) => (
            <Link key={l.id} to={`/leads/${l.id}`}>
              <Card className="hover:shadow-md transition-shadow border-none shadow-sm cursor-pointer hover:-translate-y-0.5 duration-200">
                <CardContent className="p-4">
                  <p className="font-medium text-slate-900 line-clamp-1">{l.nome}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                      {l.valor_orcamento ? `R$ ${l.valor_orcamento}` : 'R$ 0'}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                      {l.expand?.colaborador_id?.name || 'N/A'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">Gerencie o seu pipeline e negociações.</p>
        </div>
        <Button asChild className="shrink-0">
          <Link to="/leads/novo">
            <Plus className="mr-2 h-4 w-4" /> Novo Lead
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="kanban" className="flex-1 flex flex-col overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <TabsList className="w-fit">
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="lista">Lista</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar leads..."
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
                <SelectItem value="todos">Todos Status</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="kanban" className="flex-1 overflow-x-auto mt-6 pb-4 outline-none">
          <div className="flex gap-4 h-full min-h-[500px]">
            {STATUSES.map((s) => (
              <KanbanColumn key={s} status={s} />
            ))}
          </div>
        </TabsContent>

        <TabsContent
          value="lista"
          className="flex-1 overflow-y-auto mt-6 bg-white rounded-xl shadow-subtle border outline-none"
        >
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Responsável</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((l) => (
                <TableRow
                  key={l.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => navigate(`/leads/${l.id}`)}
                >
                  <TableCell className="font-medium">{l.nome}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50">
                      {l.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{l.origem || '-'}</TableCell>
                  <TableCell className="font-medium text-emerald-600">
                    {l.valor_orcamento ? `R$ ${l.valor_orcamento}` : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {l.expand?.colaborador_id?.name || '-'}
                  </TableCell>
                </TableRow>
              ))}
              {filteredLeads.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum lead encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>
  )
}
