import { useState } from 'react'
import { User, LeadStatus } from '@/types'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Loader2, X, Archive, ArchiveRestore, Download, Trash2 } from 'lucide-react'

interface BulkActionBarProps {
  selectedCount: number
  onClear: () => void
  onUpdateStatus: (status: LeadStatus) => Promise<void>
  onUpdateOwner: (ownerId: string) => Promise<void>
  onArchive: () => Promise<void>
  onUnarchive: () => Promise<void>
  onExportCSV: () => Promise<void>
  onDelete: () => Promise<void>
  isGestor: boolean
  users: User[]
  statusOptions: string[]
}

export function BulkActionBar({
  selectedCount,
  onClear,
  onUpdateStatus,
  onUpdateOwner,
  onArchive,
  onUnarchive,
  onExportCSV,
  onDelete,
  isGestor,
  users,
  statusOptions,
}: BulkActionBarProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const handleAction = async (actionName: string, actionFn: () => Promise<void>) => {
    setLoadingAction(actionName)
    try {
      await actionFn()
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-x-auto max-w-[95vw] scrollbar-thin">
      <div className="flex items-center gap-2 pr-4 border-r shrink-0">
        <span className="bg-primary text-primary-foreground text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center">
          {selectedCount}
        </span>
        <span className="text-sm font-medium text-slate-700 hidden sm:inline-block">
          selecionados
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full ml-1 text-slate-500 hover:text-slate-900"
          onClick={onClear}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Select
          onValueChange={(val) => handleAction('status', () => onUpdateStatus(val as LeadStatus))}
          disabled={loadingAction !== null}
        >
          <SelectTrigger className="h-9 text-sm w-[130px] sm:w-[150px] bg-slate-50 border-slate-200">
            {loadingAction === 'status' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            <SelectValue placeholder="Mudar Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          onValueChange={(val) => handleAction('owner', () => onUpdateOwner(val))}
          disabled={loadingAction !== null}
        >
          <SelectTrigger className="h-9 text-sm w-[130px] sm:w-[150px] bg-slate-50 border-slate-200">
            {loadingAction === 'owner' ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            <SelectValue placeholder="Reatribuir" />
          </SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 gap-2"
          onClick={() => handleAction('archive', onArchive)}
          disabled={loadingAction !== null}
        >
          {loadingAction === 'archive' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Archive className="w-4 h-4" />
          )}
          <span className="hidden sm:inline-block">Arquivar</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 gap-2"
          onClick={() => handleAction('unarchive', onUnarchive)}
          disabled={loadingAction !== null}
        >
          {loadingAction === 'unarchive' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArchiveRestore className="w-4 h-4" />
          )}
          <span className="hidden xl:inline-block">Desarquivar</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 gap-2"
          onClick={() => handleAction('export', onExportCSV)}
          disabled={loadingAction !== null}
        >
          {loadingAction === 'export' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span className="hidden md:inline-block">Exportar</span>
        </Button>

        {isGestor && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="h-9 px-3 gap-2"
                disabled={loadingAction !== null}
              >
                {loadingAction === 'delete' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span className="hidden lg:inline-block">Excluir</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação excluirá permanentemente os {selectedCount} leads selecionados e todo o
                  seu histórico.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleAction('delete', onDelete)}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  Excluir Leads
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  )
}
