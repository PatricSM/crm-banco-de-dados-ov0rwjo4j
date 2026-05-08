import { useState } from 'react'
import { Search, Bell, Plus, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { AppSidebar } from './AppSidebar'
import { useToast } from '@/hooks/use-toast'
import { LeadForm } from './LeadForm'
import { Lead } from '@/types'
import pb from '@/lib/pocketbase/client'

export function TopBar() {
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  const handleCreateLead = async (data: Partial<Lead>) => {
    try {
      await pb.collection('leads').create(data)
      toast({ title: 'Lead criado com sucesso!' })
      setDialogOpen(false)
    } catch (error: any) {
      toast({ title: 'Erro ao criar lead', description: error.message, variant: 'destructive' })
    }
  }

  return (
    <header className="h-16 border-b bg-card px-6 flex items-center justify-between shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden shrink-0">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <SheetTitle className="sr-only">Navegação</SheetTitle>
            <SheetDescription className="sr-only">Menu principal do sistema</SheetDescription>
            <AppSidebar onNavigate={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>

        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-[18px] text-muted-foreground" />
          <Input
            placeholder="Buscar leads..."
            className="pl-10 bg-muted/50 border-transparent focus-visible:bg-background h-10 rounded-xl"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground rounded-full"
          onClick={() =>
            toast({
              title: 'Feature coming soon',
              description: 'Notificações estarão disponíveis em breve.',
            })
          }
        >
          <Bell className="size-5" />
        </Button>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl shadow-sm gap-2">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Novo Lead</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Lead</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para cadastrar um novo lead.
              </DialogDescription>
            </DialogHeader>
            <LeadForm onSave={handleCreateLead} />
          </DialogContent>
        </Dialog>
      </div>
    </header>
  )
}
