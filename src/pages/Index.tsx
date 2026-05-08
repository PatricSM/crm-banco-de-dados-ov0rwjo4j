import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getLeads, LeadsFilters } from '@/services/leads'
import { getAllOrcamentos } from '@/services/orcamentos'
import { getUsers } from '@/services/users'
import { Lead, User, Orcamento } from '@/types'
import { Bar, BarChart, XAxis, YAxis, PieChart, Pie, Cell, Legend } from 'recharts'
import { format, subDays, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import {
  Activity,
  Users,
  DollarSign,
  Calendar as CalendarIcon,
  Target,
  TrendingUp,
  Trophy,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import { DateRange } from 'react-day-picker'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Dashboard() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [usersList, setUsersList] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [status, setStatus] = useState<string>('all')
  const [colaboradorId, setColaboradorId] = useState<string>('all')

  useEffect(() => {
    getUsers().then(setUsersList)
    getAllOrcamentos().then(setOrcamentos)
  }, [])

  useEffect(() => {
    setLoading(true)
    const filters: LeadsFilters = {
      dateFrom: date?.from ? format(date.from, 'yyyy-MM-dd') : undefined,
      dateTo: date?.to ? format(date.to, 'yyyy-MM-dd') : undefined,
      status,
      colaboradorId,
    }
    getLeads(filters).then((data) => {
      setLeads(data)
      setLoading(false)
    })
  }, [date, status, colaboradorId])

  const totalLeads = leads.length
  const convertidos = leads.filter((l) => l.status === 'Convertido').length

  const orcamentosFiltrados = useMemo(() => {
    return orcamentos.filter((o) => {
      if (!date?.from || !date?.to) return true
      const d = new Date(o.created)
      return d >= date.from && d <= date.to
    })
  }, [orcamentos, date])

  const orcamentosAprovados = orcamentosFiltrados.filter((o) => o.status === 'Aprovado')
  const faturamento = orcamentosAprovados.reduce((acc, o) => acc + o.valor_total, 0)
  const ticketMedio = orcamentosAprovados.length ? faturamento / orcamentosAprovados.length : 0
  const taxaConversao = totalLeads ? (convertidos / totalLeads) * 100 : 0

  const monthlyData = useMemo(() => {
    const map = leads.reduce(
      (acc, lead) => {
        const dateObj = parseISO(lead.created)
        const month = format(dateObj, 'MMM/yy', { locale: ptBR })
        if (!acc[month])
          acc[month] = {
            name: month,
            leads: 0,
            convertidos: 0,
            sortKey: format(dateObj, 'yyyy-MM'),
          }
        acc[month].leads += 1
        if (lead.status === 'Convertido') acc[month].convertidos += 1
        return acc
      },
      {} as Record<string, any>,
    )
    return Object.values(map).sort((a, b) => a.sortKey.localeCompare(b.sortKey))
  }, [leads])

  const origensData = useMemo(() => {
    const map = leads.reduce(
      (acc, lead) => {
        const orig = lead.origem || 'Desconhecida'
        if (!acc[orig]) acc[orig] = 0
        acc[orig] += 1
        return acc
      },
      {} as Record<string, number>,
    )

    const colors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
    ]
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      fill: colors[i % colors.length],
    }))
  }, [leads])

  const origensConfig = useMemo(() => {
    return origensData.reduce(
      (acc, curr) => {
        acc[curr.name] = { label: curr.name, color: curr.fill }
        return acc
      },
      {} as Record<string, any>,
    )
  }, [origensData])

  const ranking = useMemo(() => {
    const map: Record<string, { id: string; name: string; points: number; avatar: string }> = {}
    usersList.forEach((u) => {
      map[u.id] = { id: u.id, name: u.name || u.email, avatar: u.avatar, points: 0 }
    })

    orcamentosAprovados.forEach((o) => {
      const colabId =
        o.expand?.lead_id?.colaborador_id || leads.find((l) => l.id === o.lead_id)?.colaborador_id
      if (colabId && map[colabId as string]) {
        map[colabId as string].points += 1
      }
    })

    return Object.values(map).sort((a, b) => b.points - a.points)
  }, [orcamentosAprovados, usersList, leads])

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Comercial</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe as métricas e o volume do seu funil de vendas baseado nos Orçamentos Aprovados.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center bg-white p-4 rounded-lg shadow-subtle border border-slate-100">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant="outline"
              className={cn(
                'w-[300px] justify-start text-left font-normal bg-white',
                !date && 'text-muted-foreground',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'dd/MM/yyyy')} - {format(date.to, 'dd/MM/yyyy')}
                  </>
                ) : (
                  format(date.from, 'dd/MM/yyyy')
                )
              ) : (
                <span>Selecione um período</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {user?.role === 'gestor' && (
          <Select value={colaboradorId} onValueChange={setColaboradorId}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Colaborador" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Colab.</SelectItem>
              {usersList.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name || u.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-none shadow-subtle bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card className="border-none shadow-subtle bg-white hover:-translate-y-1 transition-transform duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total de Leads</CardTitle>
                <div className="p-2 bg-slate-50 rounded-full group-hover:bg-primary/10 transition-colors">
                  <Users className="h-4 w-4 text-slate-500 group-hover:text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{totalLeads}</div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-subtle bg-white hover:-translate-y-1 transition-transform duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Faturamento Aprovado
                </CardTitle>
                <div className="p-2 bg-emerald-50 rounded-full group-hover:bg-emerald-100 transition-colors">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    faturamento,
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-subtle bg-white hover:-translate-y-1 transition-transform duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Ticket Médio</CardTitle>
                <div className="p-2 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                    ticketMedio,
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-subtle bg-white hover:-translate-y-1 transition-transform duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Taxa de Conversão
                </CardTitle>
                <div className="p-2 bg-amber-50 rounded-full group-hover:bg-amber-100 transition-colors">
                  <Activity className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{taxaConversao.toFixed(1)}%</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
        <Card className="border-none shadow-subtle bg-white col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Performance Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[320px] w-full" />
            ) : (
              <ChartContainer
                config={{
                  leads: { label: 'Leads', color: 'hsl(var(--primary))' },
                  convertidos: { label: 'Convertidos', color: 'hsl(var(--chart-2))' },
                }}
                className="h-[320px] w-full"
              >
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} />
                  <YAxis axisLine={false} tickLine={false} tickMargin={10} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="leads"
                    fill="var(--color-leads)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="convertidos"
                    fill="var(--color-convertidos)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-subtle bg-white col-span-1">
          <CardHeader>
            <CardTitle>Origem dos Leads</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[320px] w-full" />
            ) : (
              <ChartContainer config={origensConfig} className="h-[320px] w-full">
                <PieChart>
                  <Pie
                    data={origensData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label
                  >
                    {origensData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Card className="border-none shadow-subtle bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" /> Ranking de Gestão (Orçamentos Aprovados)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4 mt-4">
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </div>
            ) : (
              <div className="space-y-3 mt-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ranking.map((u, idx) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border shadow-sm hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm',
                          idx === 0
                            ? 'bg-amber-100 text-amber-600'
                            : idx === 1
                              ? 'bg-slate-200 text-slate-600'
                              : idx === 2
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-primary/10 text-primary',
                        )}
                      >
                        {idx + 1}º
                      </div>
                      <Avatar className="w-10 h-10 border">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback className="bg-primary/5 text-primary font-medium">
                          {u.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-slate-900">{u.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{u.points}</p>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                        Aprovações
                      </p>
                    </div>
                  </div>
                ))}
                {ranking.length === 0 && (
                  <div className="md:col-span-3 text-center py-10 text-muted-foreground bg-slate-50 rounded-xl border border-dashed">
                    Nenhuma aprovação registrada neste período.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
