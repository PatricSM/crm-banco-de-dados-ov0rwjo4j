import { Outlet, Navigate } from 'react-router-dom'
import { AppSidebar } from './AppSidebar'
import { TopBar } from './TopBar'
import { useAuth } from '@/hooks/use-auth'

export default function Layout() {
  const { user, loading } = useAuth()

  if (loading)
    return <div className="h-screen w-screen flex items-center justify-center">Carregando...</div>
  if (!user) return <Navigate to="/login" />

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar className="hidden md:flex w-64 sticky top-0 h-screen" />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar />
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
