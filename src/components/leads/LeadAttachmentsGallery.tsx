import { useState, useRef, useEffect } from 'react'
import { LeadAttachment, AttachmentKind } from '@/types'
import { getLeadAttachments, uploadAttachment, deleteAttachment } from '@/services/lead-attachments'
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import pb from '@/lib/pocketbase/client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

import {
  Paperclip,
  FileText,
  File,
  MoreVertical,
  Download,
  Trash2,
  UploadCloud,
  Loader2,
  Camera,
  Stethoscope,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeadAttachmentsGalleryProps {
  leadId: string
  leadStatus: string
}

const KIND_LABELS: Record<AttachmentKind, string> = {
  foto_antes: 'Foto (Antes)',
  foto_depois: 'Foto (Depois)',
  documento: 'Documento',
  contrato: 'Contrato',
  exame: 'Exame',
  comprovante: 'Comprovante',
  outro: 'Outro',
}

const KIND_ICONS: Record<AttachmentKind, React.FC<any>> = {
  foto_antes: Camera,
  foto_depois: Camera,
  documento: FileText,
  contrato: Briefcase,
  exame: Stethoscope,
  comprovante: FileText,
  outro: File,
}

export function LeadAttachmentsGallery({ leadId, leadStatus }: LeadAttachmentsGalleryProps) {
  const [attachments, setAttachments] = useState<LeadAttachment[]>([])
  const [loading, setLoading] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedKind, setSelectedKind] = useState<AttachmentKind>('documento')

  const { user } = useAuth()

  const loadAttachments = async () => {
    try {
      const data = await getLeadAttachments(leadId)
      setAttachments(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAttachments()
  }, [leadId])

  useRealtime('lead_attachments', () => {
    loadAttachments()
  })

  const getFileUrl = (record: LeadAttachment) => {
    return pb.files.getUrl(record, record.file)
  }

  const isImage = (filename: string) => {
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(filename)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
      processFiles(files)
    }
  }

  const processFiles = async (files: File[], forceKind?: AttachmentKind) => {
    if (!user?.id) return
    setUploading(true)
    setUploadProgress(0)

    const total = files.length
    let successCount = 0

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('lead_id', leadId)
      formData.append('file', file)
      formData.append('original_name', file.name)
      formData.append('size', file.size.toString())
      formData.append('uploaded_by', user.id)

      let kind: AttachmentKind = forceKind || 'documento'
      if (!forceKind) {
        if (leadStatus === 'Em Atendimento' || leadStatus === 'Compareceu') kind = 'foto_depois'
        else if (leadStatus === 'Convertido' || leadStatus === 'Vendido') kind = 'comprovante'
        else if (file.type.startsWith('image/')) kind = 'foto_antes'
      }

      formData.append('kind', kind)

      try {
        await uploadAttachment(formData)
        successCount++
      } catch (err: any) {
        toast({
          title: `Erro ao enviar ${file.name}`,
          description: err.message,
          variant: 'destructive',
        })
      }
      setUploadProgress(Math.round(((i + 1) / total) * 100))
    }

    setUploading(false)
    setSelectedFiles([])
    setDialogOpen(false)
    if (successCount > 0) {
      toast({ title: `${successCount} arquivo(s) enviado(s) com sucesso.` })
    }
  }

  const handleManualUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedFiles.length > 0) {
      processFiles(selectedFiles, selectedKind)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este anexo?')) return
    try {
      await deleteAttachment(id)
      toast({ title: 'Anexo removido' })
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="bg-white border rounded-2xl shadow-subtle overflow-hidden mt-6">
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-primary" /> Anexos e Documentos
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie fotos, exames e contratos deste lead.
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <UploadCloud className="w-4 h-4" /> Enviar Arquivo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar Anexos</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleManualUploadSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Arquivos</Label>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                  className="cursor-pointer"
                />
                {selectedFiles.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedFiles.length} arquivo(s) selecionado(s)
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={selectedKind}
                  onValueChange={(v) => setSelectedKind(v as AttachmentKind)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(KIND_LABELS).map(([k, label]) => (
                      <SelectItem key={k} value={k}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Enviando...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={selectedFiles.length === 0 || uploading}>
                  {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Enviar
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div
        className={cn(
          'p-6 transition-colors min-h-[200px]',
          isDragging ? 'bg-primary/5 border-2 border-dashed border-primary m-2 rounded-xl' : '',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging ? (
          <div className="h-full flex flex-col items-center justify-center text-primary pointer-events-none min-h-[200px]">
            <UploadCloud className="w-12 h-12 mb-3 animate-bounce" />
            <p className="text-lg font-semibold">Solte os arquivos aqui</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
          </div>
        ) : attachments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
              <Paperclip className="w-8 h-8 text-slate-300" />
            </div>
            <h4 className="text-slate-700 font-medium mb-1">Nenhum anexo encontrado</h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
              Arraste e solte arquivos aqui ou clique no botão acima para adicionar fotos, exames e
              documentos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {attachments.map((att) => {
              const fileUrl = getFileUrl(att)
              const isImg = isImage(att.file)
              const Icon = KIND_ICONS[att.kind] || File

              return (
                <div
                  key={att.id}
                  className="group relative bg-slate-50 border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-slate-100 flex items-center justify-center relative overflow-hidden border-b">
                    {isImg ? (
                      <img
                        src={fileUrl}
                        alt={att.original_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Icon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                        <span className="text-[10px] font-medium text-slate-500 uppercase px-2 py-1 bg-slate-200 rounded">
                          {att.file.split('.').pop()}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full"
                        asChild
                      >
                        <a href={fileUrl} target="_blank" rel="noreferrer" download>
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                            onClick={() => handleDelete(att.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <div className="p-3">
                    <p
                      className="text-sm font-medium text-slate-900 truncate"
                      title={att.original_name}
                    >
                      {att.original_name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-slate-500">{KIND_LABELS[att.kind]}</span>
                      {att.size && (
                        <span className="text-[10px] text-slate-400">
                          {(att.size / 1024).toFixed(0)} KB
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
