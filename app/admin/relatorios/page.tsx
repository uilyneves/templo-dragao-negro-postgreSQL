'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Download, 
  Calendar,
  Users,
  Heart,
  DollarSign,
  BarChart3,
  PieChart,
  FileText,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface ReportData {
  period: string;
  totalMembers: number;
  newMembers: number;
  totalConsultations: number;
  completedConsultations: number;
  totalRevenue: number;
  averageTicket: number;
  conversionRate: number;
  memberRetention: number;
}

export default function RelatoriosPage() {
  const [reportData, setReportData] = useState<ReportData>({
    period: 'current_month',
    totalMembers: 0,
    newMembers: 0,
    totalConsultations: 0,
    completedConsultations: 0,
    totalRevenue: 0,
    averageTicket: 0,
    conversionRate: 0,
    memberRetention: 0
  });
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('current_month');
  const [reportType, setReportType] = useState('overview');

  useEffect(() => {
    loadReportData();
  }, [periodFilter]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      if (!supabaseBrowser) throw new Error('Supabase não configurado');

      const currentMonth = new Date().toISOString().slice(0, 7);
      const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

      // Carregar dados dos membros
      const { data: members } = await supabaseBrowser
        .from('members')
        .select('created_at, status, total_consultations, total_spent');

      // Carregar consultas
      const { data: consultations } = await supabaseBrowser
        .from('consultations')
        .select('amount, status, created_at, payment_status');

      // Carregar pedidos
      const { data: orders } = await supabaseBrowser
        .from('orders')
        .select('total, status, created_at, payment_status');

      const membersThisMonth = (members || []).filter(m => 
        m.created_at.startsWith(currentMonth)
      );

      const consultationsThisMonth = (consultations || []).filter(c => 
        c.created_at.startsWith(currentMonth)
      );

      const ordersThisMonth = (orders || []).filter(o => 
        o.created_at.startsWith(currentMonth)
      );

      const completedConsultations = consultationsThisMonth.filter(c => 
        c.status === 'completed'
      );

      const paidConsultations = consultationsThisMonth.filter(c => 
        c.payment_status === 'paid'
      );

      const paidOrders = ordersThisMonth.filter(o => 
        o.payment_status === 'paid'
      );

      const totalRevenue = [
        ...paidConsultations.map(c => c.amount || 0),
        ...paidOrders.map(o => o.total || 0)
      ].reduce((sum, amount) => sum + amount, 0);

      const averageTicket = paidConsultations.length > 0 
        ? paidConsultations.reduce((sum, c) => sum + (c.amount || 0), 0) / paidConsultations.length
        : 0;

      const conversionRate = consultationsThisMonth.length > 0 
        ? (completedConsultations.length / consultationsThisMonth.length) * 100
        : 0;

      setReportData({
        period: currentMonth,
        totalMembers: members?.length || 0,
        newMembers: membersThisMonth.length,
        totalConsultations: consultationsThisMonth.length,
        completedConsultations: completedConsultations.length,
        totalRevenue,
        averageTicket,
        conversionRate,
        memberRetention: 85 // Simulado
      });
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    const csvContent = `
Relatório Templo Dragão Negro - ${reportData.period}
Período,${reportData.period}
Total de Membros,${reportData.totalMembers}
Novos Membros,${reportData.newMembers}
Total de Consultas,${reportData.totalConsultations}
Consultas Realizadas,${reportData.completedConsultations}
Receita Total,R$ ${reportData.totalRevenue.toFixed(2)}
Ticket Médio,R$ ${reportData.averageTicket.toFixed(2)}
Taxa de Conversão,${reportData.conversionRate.toFixed(1)}%
Retenção de Membros,${reportData.memberRetention.toFixed(1)}%
    `.trim();

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-dragao-negro-${reportData.period}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Gerando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Relatórios e Analytics</h2>
          <p className="text-gray-600">Análise completa do desempenho do templo</p>
        </div>
        <div className="flex space-x-4">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Mês Atual</SelectItem>
              <SelectItem value="last_month">Mês Passado</SelectItem>
              <SelectItem value="current_year">Ano Atual</SelectItem>
              <SelectItem value="all_time">Todo o Período</SelectItem>
            </SelectContent>
          </Select>
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Visão Geral</SelectItem>
              <SelectItem value="members">Membros</SelectItem>
              <SelectItem value="consultations">Consultas</SelectItem>
              <SelectItem value="financial">Financeiro</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport} className="bg-green-600 hover:bg-green-700">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalMembers}</div>
            <p className="text-xs text-green-600">+{reportData.newMembers} novos este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Consultas Realizadas</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.completedConsultations}</div>
            <p className="text-xs text-gray-500">de {reportData.totalConsultations} agendadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {reportData.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-green-600">+15% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500">Consultas realizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance por Categoria</CardTitle>
            <CardDescription>Análise detalhada por tipo de serviço</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Heart className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="font-medium">Consultas Espirituais</p>
                    <p className="text-sm text-gray-500">{reportData.completedConsultations} realizadas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">R$ {(reportData.completedConsultations * 120).toFixed(2)}</p>
                  <Badge className="bg-green-100 text-green-800">+12%</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="font-medium">Trabalhos Espirituais</p>
                    <p className="text-sm text-gray-500">Trabalhos personalizados</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">R$ 2.450,00</p>
                  <Badge className="bg-green-100 text-green-800">+8%</Badge>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <PieChart className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium">Loja Ritualística</p>
                    <p className="text-sm text-gray-500">Produtos vendidos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">R$ 1.280,00</p>
                  <Badge className="bg-green-100 text-green-800">+25%</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Engajamento</CardTitle>
            <CardDescription>Indicadores de relacionamento com membros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Retenção de Membros</span>
                  <span className="text-sm font-bold">{reportData.memberRetention.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${reportData.memberRetention}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Taxa de Conversão</span>
                  <span className="text-sm font-bold">{reportData.conversionRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${reportData.conversionRate}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Satisfação dos Clientes</span>
                  <span className="text-sm font-bold">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Frequência de Retorno</span>
                  <span className="text-sm font-bold">78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Análise Detalhada</CardTitle>
          <CardDescription>Insights e tendências do período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Crescimento de Membros</h3>
              <p className="text-3xl font-bold text-blue-600 mb-2">+{reportData.newMembers}</p>
              <p className="text-sm text-gray-600">
                Novos membros este mês, representando um crescimento de{' '}
                {reportData.totalMembers > 0 
                  ? ((reportData.newMembers / reportData.totalMembers) * 100).toFixed(1)
                  : 0}% na base total.
              </p>
            </div>

            <div className="text-center p-6 bg-red-50 rounded-lg">
              <Heart className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Consultas Espirituais</h3>
              <p className="text-3xl font-bold text-red-600 mb-2">{reportData.completedConsultations}</p>
              <p className="text-sm text-gray-600">
                Consultas realizadas com sucesso, mantendo uma taxa de conversão de{' '}
                {reportData.conversionRate.toFixed(1)}% das consultas agendadas.
              </p>
            </div>

            <div className="text-center p-6 bg-green-50 rounded-lg">
              <DollarSign className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">Performance Financeira</h3>
              <p className="text-3xl font-bold text-green-600 mb-2">R$ {reportData.totalRevenue.toFixed(2)}</p>
              <p className="text-sm text-gray-600">
                Receita total do período com ticket médio de R$ {reportData.averageTicket.toFixed(2)}{' '}
                por consulta realizada.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações de Relatório</CardTitle>
          <CardDescription>Gere relatórios específicos para diferentes necessidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <FileText className="h-6 w-6 mb-2" />
              <span className="text-sm">Relatório de Membros</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Heart className="h-6 w-6 mb-2" />
              <span className="text-sm">Relatório de Consultas</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <DollarSign className="h-6 w-6 mb-2" />
              <span className="text-sm">Relatório Financeiro</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span className="text-sm">Relatório Completo</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}