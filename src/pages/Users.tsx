import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { User } from '@/types'
import { getUsers, updateUserRole } from '@/services/users'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default function Users() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])

  const loadData = async () => setUsers(await getUsers())

  useEffect(() => {
    if (user?.role === 'gestor') loadData()
  }, [user])

  if (user?.role !== 'gestor') return <Navigate to="/" />

  const handleRoleChange = async (userId: string, newRole: 'gestor' | 'vendedor') => {
    try {
      await updateUserRole(userId, newRole)
      toast({ title: 'Sucesso', description: 'Permissão atualizada com sucesso.' })
      loadData()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Gerenciamento de Equipe
        </h1>
        <p className="text-muted-foreground mt-1">Controle de acesso e papéis dos colaboradores.</p>
      </div>

      <div className="bg-white rounded-xl shadow-subtle border overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-[300px]">Usuário</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead className="text-right">Nível de Acesso</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {u.name?.charAt(0).toUpperCase() || u.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{u.name || 'Sem Nome'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{u.email}</TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(u.created).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end items-center gap-3">
                    {u.role === 'gestor' && (
                      <Badge className="bg-primary/10 text-primary border-none hover:bg-primary/20 pointer-events-none">
                        Gestor
                      </Badge>
                    )}
                    <Select
                      value={u.role}
                      onValueChange={(v) => handleRoleChange(u.id, v as 'gestor' | 'vendedor')}
                    >
                      <SelectTrigger className="w-[140px] bg-white h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vendedor">Vendedor</SelectItem>
                        <SelectItem value="gestor">Gestor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
