import { useState, useEffect, useCallback } from 'react'
import { getLeads, getLeadsPaginated, updateLead, deleteLead, getLead } from '@/services/leads'
import { getUsers } from '@/services/users'
import { Lead, LeadStatus, User } from '@/types'
import { useRealtime } from '@/hooks/use-realtime'
import { LeadsList } from '@/components/leads/LeadsList'
import { LeadsKanban } from '@/components/leads/LeadsKanban'
import { BulkActionBar } from '@/components/leads/BulkActionBar'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Search, Filter, LayoutList, LayoutGrid } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

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
  const { user } = useAuth()
  const isGestor = user?.role === 'gestor'

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
  const [showArchived, setShowArchived] = useState(false)

  const [users, setUsers] = useState<User[]>([])

  const [selectedLeads, setSelectedLeads] = useState<string[]>([])

  useEffect(() => {
    localStorage.setItem('leads-view-mode', viewMode)
    if (viewMode === 'kanban') {
      setSelectedLeads([])
    }
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
          showArchived,
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
    [viewMode, page, search, statusFilter, ownerFilter, showArchived],
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
    } catch (error) {
      toast({ title: 'Erro ao atualizar status', variant: 'destructive' })
    }
  }

  // --- Bulk Actions ---
  const handleBulkStatusChange = async (newStatus: LeadStatus) => {
    let success = 0,
      failed = 0
    for (const id of selectedLeads) {
      try {
        await updateLead(id, { status: newStatus })
        success++
      } catch (e) {
        failed++
      }
    }
    toast({ title: `${success} leads atualizados${failed > 0 ? `, ${failed} falharam` : ''}` })
    setSelectedLeads([])
  }

  const handleBulkOwnerChange = async (newOwnerId: string) => {
    let success = 0,
      failed = 0
    for (const id of selectedLeads) {
      try {
        await updateLead(id, { colaborador_id: newOwnerId })
        success++
      } catch (e) {
        failed++
      }
    }
    toast({ title: `${success} leads reatribuídos${failed > 0 ? `, ${failed} falharam` : ''}` })
    setSelectedLeads([])
  }

  const handleBulkArchive = async (archive: boolean) => {
    let success = 0,
      failed = 0
    for (const id of selectedLeads) {
      try {
        await updateLead(id, {
          arquivado: archive,
          arquivado_em: archive ? new Date().toISOString() : '',
        })
        success++
      } catch (e) {
        failed++
      }
    }
    toast({ title: `${success} leads ${archive ? 'arquivados' : 'desarquivados'}` })
    setSelectedLeads([])
  }

  const handleBulkDelete = async () => {
    let success = 0,
      failed = 0
    for (const id of selectedLeads) {
      try {
        await deleteLead(id)
        success++
      } catch (e) {
        failed++
      }
    }
    toast({ title: `${success} leads excluídos` })
    setSelectedLeads([])
  }

  const handleExportCSV = async () => {
    try {
      const fullLeads = []
      for (const id of selectedLeads) {
        try {
          fullLeads.push(await getLead(id))
        } catch {
          /* intentionally ignored */
        }
      }

      const rows = fullLeads.map((l) => {
        return [
          l.id,
          `"${(l.nome || '').replace(/"/g, '""')}"`,
          `"${(l.email || '').replace(/"/g, '""')}"`,
          `"${(l.telefone || '').replace(/"/g, '""')}"`,
          l.status,
          `"${(l.origem || '').replace(/"/g, '""')}"`,
          `"${(l.procedimento_interesse || '').replace(/"/g, '""')}"`,
          l.valor_orcamento || '',
          l.data_agendamento || '',
          l.created,
          l.updated,
        ].join(',')
      })
      const csv = [
        'id,nome,email,telefone,status,origem,procedimento_interesse,valor_orcamento,data_agendamento,created,updated',
        ...rows,
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `leads-${new Date().getTime()}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({ title: 'Exportação concluída' })
    } catch (e) {
      toast({ title: 'Erro ao exportar', variant: 'destructive' })
    }
  }

  const handleToggleSelectAll = () => {
    const isAllSelected =
      paginatedLeads.length > 0 && paginatedLeads.every((l) => selectedLeads.includes(l.id))
    if (isAllSelected) {
      setSelectedLeads((prev) => prev.filter((id) => !paginatedLeads.find((l) => l.id === id)))
    } else {
      const newIds = paginatedLeads.map((l) => l.id).filter((id) => !selectedLeads.includes(id))
      setSelectedLeads((prev) => [...prev, ...newIds])
    }
  }

  const handleToggleSelect = (id: string) => {
    setSelectedLeads((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-in flex flex-col h-[calc(100vh-6rem)] relative">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6 shrink-0 justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
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

        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center space-x-2">
            <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
            <Label htmlFor="show-archived" className="text-sm font-medium cursor-pointer">
              Mostrar arquivados
            </Label>
          </div>
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as 'list' | 'kanban')}
            className="bg-white border rounded-md p-0.5"
          >
            <ToggleGroupItem value="list" aria-label="Lista" className="h-8 px-2.5">
              <LayoutList className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="kanban" aria-label="Kanban" className="h-8 px-2.5">
              <LayoutGrid className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {viewMode === 'list' ? (
          <div className="h-full overflow-y-auto pr-1 scrollbar-thin">
            <LeadsList
              leads={paginatedLeads}
              isLoading={isLoading}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              selectedLeads={selectedLeads}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
            />
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            <LeadsKanban leads={leads} isLoading={isLoading} onStatusChange={handleStatusChange} />
          </div>
        )}
      </div>

      {selectedLeads.length > 0 && viewMode === 'list' && (
        <BulkActionBar
          selectedCount={selectedLeads.length}
          onClear={() => setSelectedLeads([])}
          onUpdateStatus={handleBulkStatusChange}
          onUpdateOwner={handleBulkOwnerChange}
          onArchive={() => handleBulkArchive(true)}
          onUnarchive={() => handleBulkArchive(false)}
          onExportCSV={handleExportCSV}
          onDelete={handleBulkDelete}
          isGestor={isGestor}
          users={users}
          statusOptions={STATUS_OPTIONS}
        />
      )}
    </div>
  )
}
