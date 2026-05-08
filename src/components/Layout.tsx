import { Outlet, Navigate, Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { useAuth } from '@/hooks/use-auth'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export default function Layout() {
  const { user, loading, signOut } = useAuth()

  if (loading)
    return <div className="h-screen w-screen flex items-center justify-center">Carregando...</div>
  if (!user) return <Navigate to="/login" />

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6 shadow-sm sticky top-0 z-10">
          <SidebarTrigger />
          <div className="font-semibold text-lg ml-2 flex-1">
            {/* Can add Global Search here if needed */}
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="outline-none ring-0">
                <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary transition-colors cursor-pointer">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">
                      Perfil: {user.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive cursor-pointer"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8 overflow-auto animate-fade-in bg-slate-50/50">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
