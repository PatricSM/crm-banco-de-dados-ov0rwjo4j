import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getLeads } from '@/services/leads'
import { getRecentHistorico } from '@/services/historico'
import { Lead, Historico } from '@/types'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { format, subDays } from 'date-fns'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Activity, BarChart3, Users, DollarSign } from 'lucide-react'

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [historico, setHistorico] = useState<Historico[]>([])

  useEffect(() => {
    getLeads().then(setLeads)
    getRecentHistorico().then(setHistorico)
  }, [])

  const totalOrcamento = leads.reduce((acc, l) => acc + (l.valor_orcamento || 0), 0)
  const pendentes = leads.filter((l) => ['Novo', 'Em Atendimento'].includes(l.status)).length
  const conversao = leads.length
    ? (leads.filter((l) => l.status === 'Vendido').length / leads.length) * 100
    : 0

  const data = Array.from({ length: 7 }).map((_, i) => {
    const d = subDays(new Date(), 6 - i)
    const count = leads.filter((l) => l.created.startsWith(format(d, 'yyyy-MM-dd'))).length
    return { name: format(d, 'dd/MM'), leads: count }
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Visão Geral</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe as métricas principais do seu pipeline de vendas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-subtle bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-subtle bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads Pendentes</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendentes}</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-subtle bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversao.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-subtle bg-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamento em Curso</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                totalOrcamento,
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-subtle bg-white">
          <CardHeader>
            <CardTitle>Aquisição (Últimos 7 dias)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{ leads: { label: 'Leads', color: 'hsl(var(--primary))' } }}
              className="h-[320px] w-full"
            >
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} />
                <YAxis axisLine={false} tickLine={false} tickMargin={10} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="leads"
                  fill="var(--color-leads)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3 border-none shadow-subtle bg-white">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {historico.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma atividade recente.</p>
              ) : (
                historico.map((h) => (
                  <div key={h.id} className="flex gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary/80 shrink-0" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{h.expand?.lead_id?.nome}</p>
                      <p className="text-sm text-muted-foreground">{h.acao}</p>
                      <p className="text-xs text-muted-foreground/60">
                        {new Date(h.created).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
