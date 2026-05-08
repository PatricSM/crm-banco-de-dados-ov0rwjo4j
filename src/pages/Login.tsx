import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = isSignUp ? await signUp(email, password) : await signIn(email, password)
      if (error) {
        toast({ title: 'Erro de Autenticação', description: error.message, variant: 'destructive' })
      } else {
        toast({ title: 'Bem-vindo(a)!', description: 'Autenticado com sucesso.' })
        navigate('/')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-elevation border-0 animate-slide-up">
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="w-12 h-12 bg-primary rounded-xl mx-auto flex items-center justify-center mb-2 shadow-sm">
            <span className="text-primary-foreground font-bold text-xl">CRM</span>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Adapta CRM</CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Crie sua conta para acessar o sistema'
              : 'Faça login para gerenciar seus leads'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? 'Aguarde...' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center pb-8">
          <Button
            variant="link"
            className="text-sm text-muted-foreground"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? 'Já tenho uma conta. Fazer login' : 'Não tem conta? Cadastre-se'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
