import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, UserSquare2 } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'

export function AppSidebar() {
  const { pathname } = useLocation()
  const { user } = useAuth()

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold text-sidebar-primary-foreground tracking-tight py-4">
            Adapta CRM
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/'}>
                  <Link to="/">
                    <LayoutDashboard className="mr-2" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith('/leads')}>
                  <Link to="/leads">
                    <UserSquare2 className="mr-2" />
                    <span>Leads</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {user?.role === 'gestor' && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname.startsWith('/usuarios')}>
                    <Link to="/usuarios">
                      <Users className="mr-2" />
                      <span>Usuários</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
