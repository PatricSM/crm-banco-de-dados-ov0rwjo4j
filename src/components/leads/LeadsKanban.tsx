import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Lead, LeadStatus } from '@/types'
import { Link } from 'react-router-dom'
import { StatusChip } from '@/components/StatusChip'
import { leadStatusToTone } from '@/lib/leadStatus'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { MoreVertical, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDragScroll } from '@/hooks/use-drag-scroll'
import { cn } from '@/lib/utils'
import { Paperclip, Loader2 } from 'lucide-react'
import { useLeadAttachmentsCount } from '@/hooks/use-lead-attachments-count'
import { uploadAttachment } from '@/services/lead-attachments'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { AttachmentKind } from '@/types'

interface LeadsKanbanProps {
  leads: Lead[]
  isLoading: boolean
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void
}

const COLUMNS: { label: string; statuses: LeadStatus[]; color: string }[] = [
  { label: 'Novo Contato', statuses: ['Novo', 'Novo Contato'], color: 'text-blue-600' },
  { label: 'Agendado', statuses: ['Agendado'], color: 'text-purple-600' },
  { label: 'Em Atendimento', statuses: ['Em Atendimento', 'Compareceu'], color: 'text-amber-600' },
  { label: 'Convertido', statuses: ['Vendido', 'Convertido'], color: 'text-emerald-600' },
  { label: 'Perdido', statuses: ['Perdido'], color: 'text-rose-600' },
]

export function LeadsKanban({ leads, isLoading, onStatusChange }: LeadsKanbanProps) {
  const { containerRef, events, isDragging: isScrollDragging } = useDragScroll()
  const attachmentCounts = useLeadAttachmentsCount()
  const { user } = useAuth()
  const [uploadingTo, setUploadingTo] = useState<string | null>(null)

  const [draggingLead, setDraggingLead] = useState<Lead | null>(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 })
  const [hoveredCol, setHoveredCol] = useState<string | null>(null)
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 })
  const [initialTouch, setInitialTouch] = useState({ x: 0, y: 0 })

  const draggingRef = useRef(draggingLead)
  const hoverRef = useRef(hoveredCol)
  const pressTimer = useRef<NodeJS.Timeout | null>(null)
  const initialTouchRef = useRef(initialTouch)

  useEffect(() => {
    draggingRef.current = draggingLead
    hoverRef.current = hoveredCol
    initialTouchRef.current = initialTouch
  }, [draggingLead, hoveredCol, initialTouch])

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>, lead: Lead) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('a')) return

    e.stopPropagation()

    const clientX = e.clientX
    const clientY = e.clientY
    setInitialTouch({ x: clientX, y: clientY })

    const rect = e.currentTarget.getBoundingClientRect()
    const startX = clientX - rect.left
    const startY = clientY - rect.top
    const width = rect.width
    const height = rect.height

    if (e.pointerType === 'touch') {
      pressTimer.current = setTimeout(() => {
        if (navigator.vibrate) navigator.vibrate(50)
        setCardSize({ width, height })
        setDragStartOffset({ x: startX, y: startY })
        setDragPos({ x: clientX, y: clientY })
        setDraggingLead(lead)
        document.body.style.touchAction = 'none'
        document.body.style.overflow = 'hidden'
      }, 350)
    } else {
      setCardSize({ width, height })
      setDragStartOffset({ x: startX, y: startY })
      setDragPos({ x: clientX, y: clientY })
      setDraggingLead(lead)
      document.body.style.userSelect = 'none'
    }
  }

  const handlePointerCancel = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current)
      pressTimer.current = null
    }
  }

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (pressTimer.current && !draggingRef.current) {
        const dx = Math.abs(e.clientX - initialTouchRef.current.x)
        const dy = Math.abs(e.clientY - initialTouchRef.current.y)
        if (dx > 10 || dy > 10) {
          clearTimeout(pressTimer.current)
          pressTimer.current = null
        }
      }

      if (draggingRef.current) {
        e.preventDefault()
        setDragPos({ x: e.clientX, y: e.clientY })

        if (
          e.clientX < 0 ||
          e.clientY < 0 ||
          e.clientX > window.innerWidth ||
          e.clientY > window.innerHeight
        ) {
          return
        }

        const elements = document.elementsFromPoint(e.clientX, e.clientY)
        const colEl = elements.find((el) => el.hasAttribute('data-col-id'))

        if (colEl) {
          const colId = colEl.getAttribute('data-col-id')
          if (colId !== hoverRef.current) {
            setHoveredCol(colId)
          }
        } else if (hoverRef.current !== null) {
          setHoveredCol(null)
        }
      }
    }

    const handleUp = () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current)
        pressTimer.current = null
      }

      document.body.style.touchAction = ''
      document.body.style.overflow = ''
      document.body.style.userSelect = ''

      if (draggingRef.current) {
        if (hoverRef.current) {
          const col = COLUMNS.find((c) => c.label === hoverRef.current)
          if (col && !col.statuses.includes(draggingRef.current.status)) {
            onStatusChange(draggingRef.current.id, col.statuses[0])
          }
        }
        setDraggingLead(null)
        setHoveredCol(null)
      }
    }

    window.addEventListener('pointermove', handleMove, { passive: false })
    window.addEventListener('pointerup', handleUp)
    window.addEventListener('pointercancel', handleUp)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleUp)
      window.removeEventListener('pointercancel', handleUp)
    }
  }, [onStatusChange])

  const handleFileDrop = async (e: React.DragEvent<HTMLDivElement>, lead: Lead) => {
    e.preventDefault()
    e.stopPropagation()
    const files = Array.from(e.dataTransfer.files)
    if (!files.length || !user?.id) return

    setUploadingTo(lead.id)
    try {
      for (const file of files) {
        const formData = new FormData()
        formData.append('lead_id', lead.id)
        formData.append('file', file)
        formData.append('original_name', file.name)
        formData.append('size', file.size.toString())
        formData.append('uploaded_by', user.id)

        let kind: AttachmentKind = 'documento'
        if (lead.status === 'Em Atendimento' || lead.status === 'Compareceu') kind = 'foto_depois'
        else if (lead.status === 'Convertido' || lead.status === 'Vendido') kind = 'comprovante'
        else if (file.type.startsWith('image/')) kind = 'foto_antes'

        formData.append('kind', kind)
        await uploadAttachment(formData)
      }
      toast({ title: 'Anexos enviados com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro ao anexar', description: err.message, variant: 'destructive' })
    } finally {
      setUploadingTo(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy'
      e.currentTarget.classList.add('border-primary', 'bg-primary/5')
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.classList.remove('border-primary', 'bg-primary/5')
  }

  const renderCard = (lead: Lead, isOverlay = false) => {
    const attachCount = attachmentCounts[lead.id] || 0
    const isUploading = uploadingTo === lead.id

    return (
      <div
        className={cn(
          'bg-white rounded-xl p-3 shadow-sm border group kanban-card transition-all select-none',
          isOverlay
            ? 'shadow-xl cursor-grabbing scale-105 rotate-2 border-primary/40 m-0'
            : 'hover:shadow-md cursor-grab border-slate-200 relative',
          draggingLead?.id === lead.id && !isOverlay ? 'opacity-40' : '',
        )}
        onPointerDown={!isOverlay ? (e) => handlePointerDown(e, lead) : undefined}
        onPointerCancel={!isOverlay ? handlePointerCancel : undefined}
        onContextMenu={(e) => {
          if (!isOverlay) e.preventDefault()
        }}
        onDrop={!isOverlay ? (e) => handleFileDrop(e, lead) : undefined}
        onDragOver={!isOverlay ? handleDragOver : undefined}
        onDragLeave={!isOverlay ? handleDragLeave : undefined}
      >
        {isUploading && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
            <span className="text-xs font-medium text-primary">Enviando...</span>
          </div>
        )}
        <div className="flex justify-between items-start mb-2">
          <Link
            to={`/leads/${lead.id}`}
            className="font-semibold text-slate-900 text-sm hover:text-primary line-clamp-1 pr-6 cursor-pointer"
          >
            {lead.nome}
          </Link>
          {!isOverlay && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 absolute top-2 right-2 text-slate-400 opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mover para</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {COLUMNS.map((c) => (
                  <DropdownMenuItem
                    key={c.label}
                    onClick={() => onStatusChange(lead.id, c.statuses[0])}
                    className="cursor-pointer"
                  >
                    {c.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="space-y-1 mb-3">
          {lead.email && (
            <div className="flex items-center text-xs text-slate-500">
              <Mail className="w-3 h-3 mr-1.5 shrink-0" />{' '}
              <span className="truncate">{lead.email}</span>
            </div>
          )}
          {lead.telefone && (
            <div className="flex items-center text-xs text-slate-500">
              <Phone className="w-3 h-3 mr-1.5 shrink-0" /> <span>{lead.telefone}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
          <StatusChip
            tone={leadStatusToTone(lead.status)}
            label={lead.status}
            className="scale-90 origin-left"
          />
          <div className="flex items-center gap-1.5">
            {attachCount > 0 && (
              <div className="flex items-center gap-1 text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded text-xs font-medium border border-slate-100">
                <Paperclip className="w-3 h-3" />
                <span>{attachCount}</span>
              </div>
            )}
            {lead.valor_orcamento && (
              <span className="text-xs font-medium text-slate-700 tabular-nums">
                R$ {lead.valor_orcamento.toLocaleString('pt-BR')}
              </span>
            )}
            {lead.expand?.colaborador_id && (
              <Avatar className="h-5 w-5 ml-1">
                <AvatarImage src={lead.expand.colaborador_id.avatar} />
                <AvatarFallback className="text-[10px]">
                  {lead.expand.colaborador_id.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
        {lead.data_proximo_contato && (
          <div className="mt-2 text-[10px] text-muted-foreground flex items-center justify-between">
            <span>Próx. contato:</span>
            <span
              className={
                new Date(lead.data_proximo_contato) < new Date() ? 'text-rose-600 font-medium' : ''
              }
            >
              {formatDistanceToNow(new Date(lead.data_proximo_contato), {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
          </div>
        )}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-full w-full overflow-x-auto overflow-y-hidden scrollbar-thin pb-4">
        <div className="flex gap-4 h-full min-w-max">
          {COLUMNS.map((c, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 w-[260px] md:w-[300px] shrink-0 bg-slate-50/50 rounded-xl p-3 border border-slate-200"
            >
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      {...events}
      className={cn(
        'h-full w-full overflow-x-auto overflow-y-hidden scrollbar-thin pb-4 select-none touch-pan-x',
        isScrollDragging ? 'cursor-grabbing' : 'cursor-auto',
      )}
    >
      <div className="flex gap-4 h-full min-w-max px-1">
        {COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => col.statuses.includes(l.status))
          return (
            <div
              key={col.label}
              className={cn(
                'flex flex-col w-[260px] md:w-[300px] shrink-0 bg-slate-100/60 rounded-xl p-3 border transition-colors duration-200',
                hoveredCol === col.label
                  ? 'border-primary/50 shadow-sm bg-slate-200/50'
                  : 'border-slate-200/60',
              )}
            >
              <div className="flex items-center justify-between px-1 mb-3 shrink-0">
                <h3 className={`font-semibold text-sm ${col.color}`}>{col.label}</h3>
                <span className="bg-white text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium shadow-sm border border-slate-100">
                  {colLeads.length}
                </span>
              </div>
              <div
                data-col-id={col.label}
                className="flex flex-col gap-3 overflow-y-auto scrollbar-thin flex-1 pr-1 pb-2 rounded-xl"
              >
                {colLeads.map((lead) => (
                  <React.Fragment key={lead.id}>{renderCard(lead)}</React.Fragment>
                ))}
                {colLeads.length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-400 border border-dashed rounded-lg bg-slate-50/50 pointer-events-none">
                    Nenhum lead nesta etapa
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {draggingLead &&
        createPortal(
          <div
            id="drag-overlay"
            className="fixed pointer-events-none z-[100] transition-none opacity-90"
            style={{
              width: cardSize.width,
              height: cardSize.height,
              left: dragPos.x - dragStartOffset.x,
              top: dragPos.y - dragStartOffset.y,
            }}
          >
            {renderCard(draggingLead, true)}
          </div>,
          document.body,
        )}
    </div>
  )
}
