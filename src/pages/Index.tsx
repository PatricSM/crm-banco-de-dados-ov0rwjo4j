import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfQuarter,
  endOfQuarter,
  subQuarters,
  startOfYear,
  endOfYear,
  subYears,
  isWithinInterval,
  eachDayOfInterval,
  eachMonthOfInterval,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import {
  Plus,
  Inbox,
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  Target,
  Activity,
  Paperclip,
} from 'lucide-react'

import { useRealtime } from '@/hooks/use-realtime'
import { getLeads } from '@/services/leads'
import { getAllOrcamentos } from '@/services/orcamentos'
import { getMonthlyAttachmentsCount } from '@/services/lead-attachments'
import { Lead, Orcamento } from '@/types'
import { cn } from '@/lib/utils'

type Timeframe = 'monthly' | 'quarterly' | 'yearly'

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const funnelColors: Record<string, string> = {
  Novo: 'bg-blue-500',
  Agendado: 'bg-violet-500',
  'Em Atendimento': 'bg-amber-500',
  Vendido: 'bg-emerald-500',
  Perdido: 'bg-rose-500',
}

export default function Index() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [attachmentsCount, setAttachmentsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<Timeframe>('monthly')

  const loadData = async () => {
    try {
      const now = new Date()
      let currStart = startOfMonth(now).toISOString()
      let currEnd = endOfMonth(now).toISOString()

      const [fetchedLeads, fetchedOrcamentos, attCount] = await Promise.all([
        getLeads(),
        getAllOrcamentos(),
        getMonthlyAttachmentsCount(currStart, currEnd),
      ])
      setLeads(fetchedLeads)
      setOrcamentos(fetchedOrcamentos)
      setAttachmentsCount(attCount)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('leads', () => {
    loadData()
  })
  useRealtime('orcamentos', () => {
    loadData()
  })
  useRealtime('lead_attachments', () => {
    loadData()
  })

  const data = useMemo(() => {
    const now = new Date()
    let currStart: Date, currEnd: Date, prevStart: Date, prevEnd: Date

    if (timeframe === 'monthly') {
      currStart = startOfMonth(now)
      currEnd = endOfMonth(now)
      prevStart = subMonths(currStart, 1)
      prevEnd = subMonths(currEnd, 1)
    } else if (timeframe === 'quarterly') {
      currStart = startOfQuarter(now)
      currEnd = endOfQuarter(now)
      prevStart = subQuarters(currStart, 1)
      prevEnd = subQuarters(currEnd, 1)
    } else {
      currStart = startOfYear(now)
      currEnd = endOfYear(now)
      prevStart = subYears(currStart, 1)
      prevEnd = subYears(currEnd, 1)
    }

    const currentLeads = leads.filter(
      (l) => l.created && isWithinInterval(new Date(l.created), { start: currStart, end: currEnd }),
    )
    const previousLeads = leads.filter(
      (l) => l.created && isWithinInterval(new Date(l.created), { start: prevStart, end: prevEnd }),
    )
    const currentOrcamentos = orcamentos.filter(
      (o) => o.created && isWithinInterval(new Date(o.created), { start: currStart, end: currEnd }),
    )

    const activeLeadsCount = currentLeads.filter(
      (l) => l.status !== 'Vendido' && l.status !== 'Convertido' && l.status !== 'Perdido',
    ).length

    const newLeadsCount = currentLeads.length
    const prevNewLeadsCount = previousLeads.length
    const newLeadsTrend =
      prevNewLeadsCount === 0
        ? newLeadsCount > 0
          ? 100
          : 0
        : Math.round(((newLeadsCount - prevNewLeadsCount) / prevNewLeadsCount) * 100)

    const openBudgetsCount = currentOrcamentos.filter((o) => o.status === 'Pendente').length
    const pipelineRevenueValue = currentOrcamentos
      .filter((o) => o.status === 'Aprovado')
      .reduce((acc, o) => acc + (o.valor_total || 0), 0)

    const chartData = []
    if (timeframe === 'monthly') {
      const days = eachDayOfInterval({
        start: currStart,
        end: Math.min(currEnd.getTime(), now.getTime()),
      })
      days.forEach((day) => {
        const label = format(day, 'dd/MM')
        const total = currentOrcamentos
          .filter((o) => o.status === 'Aprovado' && format(new Date(o.created), 'dd/MM') === label)
          .reduce((acc, o) => acc + (o.valor_total || 0), 0)
        chartData.push({ label, total })
      })
    } else {
      const months = eachMonthOfInterval({
        start: currStart,
        end: Math.min(currEnd.getTime(), now.getTime()),
      })
      months.forEach((month) => {
        const label = format(month, 'MMM/yy', { locale: ptBR })
        const total = currentOrcamentos
          .filter(
            (o) =>
              o.status === 'Aprovado' &&
              format(new Date(o.created), 'MMM/yy', { locale: ptBR }) === label,
          )
          .reduce((acc, o) => acc + (o.valor_total || 0), 0)
        chartData.push({ label, total })
      })
    }

    const funnelData = [
      { label: 'Novo', status: 'Novo' },
      { label: 'Agendado', status: 'Agendado' },
      { label: 'Em Atendimento', status: 'Em Atendimento' },
      { label: 'Vendido', status: 'Vendido' },
      { label: 'Perdido', status: 'Perdido' },
    ].map((stage) => {
      const count = currentLeads.filter(
        (l) =>
          l.status === stage.status ||
          (stage.status === 'Novo' && l.status === 'Novo Contato') ||
          (stage.status === 'Vendido' && l.status === 'Convertido'),
      ).length
      const percentage = currentLeads.length > 0 ? (count / currentLeads.length) * 100 : 0
      return { ...stage, count, percentage }
    })

    const procedureGroups = new Map<
      string,
      { leads: number; conversions: number; revenue: number }
    >()
    currentLeads.forEach((l) => {
      const proc = l.procedimento_interesse || 'Não informado'
      if (!procedureGroups.has(proc)) {
        procedureGroups.set(proc, { leads: 0, conversions: 0, revenue: 0 })
      }
      const group = procedureGroups.get(proc)!
      group.leads += 1
      if (l.status === 'Vendido' || l.status === 'Convertido') {
        group.conversions += 1
      }
    })

    currentOrcamentos
      .filter((o) => o.status === 'Aprovado')
      .forEach((o) => {
        const lead = currentLeads.find((l) => l.id === o.lead_id)
        if (lead) {
          const proc = lead.procedimento_interesse || 'Não informado'
          if (procedureGroups.has(proc)) {
            procedureGroups.get(proc)!.revenue += o.valor_total || 0
          }
        }
      })

    const proceduresData = Array.from(procedureGroups.entries())
      .map(([procedimento, d]) => ({ procedimento, ...d }))
      .sort((a, b) => b.revenue - a.revenue)

    return {
      activeLeadsCount,
      newLeadsCount,
      newLeadsTrend,
      openBudgetsCount,
      pipelineRevenueValue,
      chartData,
      funnelData,
      proceduresData,
    }
  }, [leads, orcamentos, timeframe])

  const chartConfig = {
    total: {
      label: 'Receita',
      color: 'hsl(var(--primary))',
    },
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Dashboard"
        subtitle="Monitore o desempenho do seu funil e receita em tempo real."
        actions={
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Tabs
              value={timeframe}
              onValueChange={(v) => setTimeframe(v as Timeframe)}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid w-full grid-cols-3 sm:w-auto">
                <TabsTrigger value="monthly">Mensal</TabsTrigger>
                <TabsTrigger value="quarterly">Trimestral</TabsTrigger>
                <TabsTrigger value="yearly">Anual</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button asChild className="w-full sm:w-auto">
              <Link to="/leads?new=true">
                <Plus className="size-4 mr-2" />
                Novo Lead
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <KpiCard
          title="Leads Ativos"
          value={data.activeLeadsCount.toString()}
          icon={Activity}
          loading={loading}
        />
        <KpiCard
          title="Novos no período"
          value={data.newLeadsCount.toString()}
          trend={data.newLeadsTrend}
          icon={Users}
          loading={loading}
        />
        <KpiCard
          title="Orçamentos Abertos"
          value={data.openBudgetsCount.toString()}
          icon={Target}
          loading={loading}
        />
        <KpiCard
          title="Receita Pipeline"
          value={formatCurrency(data.pipelineRevenueValue)}
          icon={Wallet}
          loading={loading}
        />
        <KpiCard
          title="Anexos no mês"
          value={attachmentsCount.toString()}
          icon={Paperclip}
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Evolução do Faturamento</CardTitle>
            <CardDescription>Receita de orçamentos aprovados ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="w-full h-[300px]" />
            ) : data.chartData.length === 0 || data.chartData.every((d) => d.total === 0) ? (
              <EmptyState
                title="Sem dados"
                description="Não há orçamentos aprovados neste período."
              />
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart
                  data={data.chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="hsl(var(--muted-foreground)/0.2)"
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    width={80}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(val) => (val === 0 ? 'R$ 0' : `R$ ${(val / 1000).toFixed(0)}k`)}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent formatter={(val: any) => formatCurrency(Number(val))} />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="var(--color-total)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Funil de Vendas</CardTitle>
            <CardDescription>Distribuição de leads por etapa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data.funnelData.every((d) => d.count === 0) ? (
              <EmptyState title="Sem leads" description="Nenhum lead encontrado neste período." />
            ) : (
              data.funnelData.map((stage) => (
                <div key={stage.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{stage.label}</span>
                    <span className="text-muted-foreground font-medium">
                      {stage.count} ({Math.round(stage.percentage)}%)
                    </span>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-1000 ease-out',
                        funnelColors[stage.label],
                      )}
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Desempenho por Procedimento</CardTitle>
          <CardDescription>Análise de conversão e receita por tipo de procedimento</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : data.proceduresData.length === 0 ? (
            <EmptyState
              title="Sem procedimentos"
              description="Não há leads com procedimentos informados neste período."
            />
          ) : (
            <div className="rounded-xl border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Procedimento</TableHead>
                    <TableHead className="text-right">Leads</TableHead>
                    <TableHead className="text-right">Conversões</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.proceduresData.map((proc) => (
                    <TableRow key={proc.procedimento} className="hover:bg-muted/30">
                      <TableCell className="font-medium">{proc.procedimento}</TableCell>
                      <TableCell className="text-right">{proc.leads}</TableCell>
                      <TableCell className="text-right">{proc.conversions}</TableCell>
                      <TableCell className="text-right text-emerald-600 font-medium">
                        {formatCurrency(proc.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function KpiCard({
  title,
  value,
  trend,
  icon: Icon,
  loading,
}: {
  title: string
  value: string
  trend?: number
  icon: any
  loading: boolean
}) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 bg-primary/5 rounded-full">
            <Icon className="size-4 text-primary" />
          </div>
        </div>
        {loading ? (
          <div className="mt-4 space-y-2">
            <Skeleton className="h-8 w-1/2" />
            {trend !== undefined && <Skeleton className="h-4 w-2/3" />}
          </div>
        ) : (
          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
            {trend !== undefined && (
              <p
                className={cn(
                  'text-xs mt-2 flex items-center gap-1 font-medium',
                  trend >= 0 ? 'text-emerald-600' : 'text-rose-600',
                )}
              >
                {trend >= 0 ? (
                  <TrendingUp className="size-3" />
                ) : (
                  <TrendingDown className="size-3" />
                )}
                <span>
                  {Math.abs(trend)}%
                  <span className="text-muted-foreground ml-1">em relação ao período anterior</span>
                </span>
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="size-14 rounded-full bg-muted flex items-center justify-center mb-4">
        <Inbox className="size-6 text-muted-foreground/60" />
      </div>
      <h3 className="font-semibold text-lg text-foreground">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-[280px] mt-1.5 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
