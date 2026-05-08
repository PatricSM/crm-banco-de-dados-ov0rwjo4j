import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, UserCog, Sparkles, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface AppSidebarProps {
  className?: string
  onNavigate?: () => void
}

export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
  const { pathname } = useLocation()
  const { user, signOut } = useAuth()

  const isGestor = user?.role === 'gestor'

  return (
    <div className={cn('flex flex-col bg-card border-r h-full', className)}>
      <div className="px-6 py-5 border-b flex items-center gap-3 shrink-0">
        <div className="size-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <Sparkles className="size-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-lg text-primary truncate">Aesthetix CRM</span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
            Principal
          </p>
          <nav className="space-y-1">
            <Link
              to="/"
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors',
                pathname === '/'
                  ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <LayoutDashboard className="size-4" />
              Dashboard
            </Link>
            <Link
              to="/leads"
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors',
                pathname.startsWith('/leads')
                  ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Users className="size-4" />
              Leads
            </Link>
          </nav>
        </div>

        {isGestor && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
              Configurações
            </p>
            <nav className="space-y-1">
              <Link
                to="/usuarios"
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors',
                  pathname.startsWith('/usuarios')
                    ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <UserCog className="size-4" />
                Usuários
              </Link>
            </nav>
          </div>
        )}
      </div>

      <div className="p-4 border-t shrink-0">
        <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-xl border border-border/50">
          <Avatar className="size-9 border border-primary/10 bg-background">
            <AvatarFallback className="bg-primary/5 text-primary text-sm font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-foreground">
              {user?.name || user?.email}
            </p>
            <p className="text-xs text-muted-foreground capitalize truncate">{user?.role}</p>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive size-8"
                onClick={() => signOut()}
              >
                <LogOut className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Sair</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
