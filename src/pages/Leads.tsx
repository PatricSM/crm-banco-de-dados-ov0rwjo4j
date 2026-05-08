import { useState, useEffect, useCallback } from 'react'
import { getLeads, getLeadsPaginated, updateLead, createLead } from '@/services/leads'
import { getUsers } from '@/services/users'
import { Lead, LeadStatus, User } from '@/types'
import { useRealtime } from '@/hooks/use-realtime'
import { PageHeader } from '@/components/PageHeader'
import { LeadsList } from '@/components/leads/LeadsList'
import { LeadsKanban } from '@/components/leads/LeadsKanban'
import { LeadForm } from '@/components/LeadForm'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { List, Columns3, Search, Plus, Filter } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

const STATUS_OPTIONS = [
  'Novo Contato',
  'Agendado',
  'Em Atendimento',
  'Convertido',
  'Perdido',
  'Novo',
  'Compareceu',
  'Vendido',
]

export default function LeadsPage() {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>(() => {
    return (localStorage.getItem('leads-view-mode') as 'list' | 'kanban') || 'list'
  })
  const [leads, setLeads] = useState<Lead[]>([])
  const [paginatedLeads, setPaginatedLeads] = useState<Lead[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [ownerFilter, setOwnerFilter] = useState('all')

  const [users, setUsers] = useState<User[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('leads-view-mode', viewMode)
  }, [viewMode])

  useEffect(() => {
    getUsers().then(setUsers).catch(console.error)
  }, [])

  const loadData = useCallback(
    async (isSilent = false) => {
      if (!isSilent) setIsLoading(true)
      try {
        const filters = {
          search: search.trim() ? search : undefined,
          status: statusFilter,
          colaboradorId: ownerFilter,
        }

        if (viewMode === 'list') {
          const res = await getLeadsPaginated(page, 10, filters)
          setPaginatedLeads(res.items)
          setTotalPages(res.totalPages)
        } else {
          const res = await getLeads(filters)
          setLeads(res)
        }
      } catch (err) {
        toast({ title: 'Erro ao carregar leads', variant: 'destructive' })
      } finally {
        setIsLoading(false)
      }
    },
    [viewMode, page, search, statusFilter, ownerFilter],
  )

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadData()
    }, 300)
    return () => clearTimeout(timeout)
  }, [loadData])

  useRealtime('leads', () => loadData(true))

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await updateLead(leadId, { status: newStatus })
      toast({ title: 'Status atualizado com sucesso' })
      loadData(true)
    } catch (error) {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
    }
  }

  const handleCreateLead = async (data: Partial<Lead>) => {
    try {
      await createLead(data)
      toast({ title: 'Lead criado com sucesso' })
      setIsDialogOpen(false)
      loadData(true)
    } catch (error) {
      toast({ title: 'Erro ao criar lead', variant: 'destructive' })
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in flex flex-col h-[calc(100vh-6rem)]">
      <PageHeader
        title="Leads"
        subtitle="Gerencie seus contatos e oportunidades"
        actions={
          <div className="flex items-center gap-3">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(v) => v && setViewMode(v as 'list' | 'kanban')}
              className="bg-white border rounded-md p-0.5"
            >
              <ToggleGroupItem
                value="list"
                aria-label="Lista"
                className="h-8 px-2 data-[state=on]:bg-slate-100"
              >
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="kanban"
                aria-label="Kanban"
                className="h-8 px-2 data-[state=on]:bg-slate-100"
              >
                <Columns3 className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-sm">
                  <Plus className="mr-2 h-4 w-4" /> Novo Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Lead</DialogTitle>
                  <DialogDescription>
                    Preencha os dados abaixo para cadastrar um novo contato.
                  </DialogDescription>
                </DialogHeader>
                <LeadForm onSave={handleCreateLead} />
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6 shrink-0">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar (Nome, Email, Tel)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-white">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ownerFilter} onValueChange={setOwnerFilter}>
          <SelectTrigger className="w-full sm:w-[200px] bg-white">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Responsáveis</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === 'list' ? (
          <div className="h-full overflow-y-auto pr-1">
            <LeadsList
              leads={paginatedLeads}
              isLoading={isLoading}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : (
          <div className="h-full pr-1">
            <LeadsKanban leads={leads} isLoading={isLoading} onStatusChange={handleStatusChange} />
          </div>
        )}
      </div>
    </div>
  )
}
