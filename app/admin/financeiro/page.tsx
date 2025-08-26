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
import { Input } from '@/components/ui/input';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface FinancialData {
  totalRevenue: number;
  monthlyRevenue: number;
  consultationsRevenue: number;
  productsRevenue: number;
  donationsRevenue: number;
  consultationsCount: number;
  ordersCount: number;
  donationsCount: number;
  revenueGrowth: number;
}

interface Transaction {
  id: string;
  customer_name: string;
  amount: number;
  date: string;
  type: 'consultation' | 'order' | 'donation';
  payment_method: string;
  status: string;
}

interface MonthlyFee {
  id: string;
  member_id: string;
  member_name: string;
  amount: number;
  due_date: string;
  status: 'paid' | 'pending' | 'overdue';
  paid_at?: string;
  payment_method?: string;
}

export default function FinanceiroPage() {
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('current_month');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [financialData, setFinancialData] = useState<FinancialData>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    consultationsRevenue: 0,
    productsRevenue: 0,
    donationsRevenue: 0,
    consultationsCount: 0,
    ordersCount: 0,
    donationsCount: 0,
    revenueGrowth: 0
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyFees, setMonthlyFees] = useState<MonthlyFee[]>([]);

  useEffect(() => {
    loadFinancialData();
  }, [periodFilter]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      if (!supabaseBrowser) throw new Error('Supabase não configurado');

      const currentMonth = new Date().toISOString().slice(0, 7);

      // Carregar consultas
      const { data: consultations } = await supabaseBrowser
        .from('consultations')
        .select('amount, status, created_at, payment_status');

      // Carregar pedidos
      const { data: orders } = await supabaseBrowser
        .from('orders')
        .select('total, status, created_at, payment_status');

      const consultationsThisMonth = (consultations || []).filter(c => 
        c.created_at.startsWith(currentMonth)
      );

      const ordersThisMonth = (orders || []).filter(o => 
        o.created_at.startsWith(currentMonth)
      );

      const paidConsultations = consultationsThisMonth.filter(c => 
        c.payment_status === 'paid'
      );

      const paidOrders = ordersThisMonth.filter(o => 
        o.payment_status === 'paid'
      );

      const consultationsRevenue = paidConsultations.reduce((sum, c) => sum + (c.amount || 0), 0);
      const productsRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const totalRevenue = consultationsRevenue + productsRevenue;

      setFinancialData({
        totalRevenue,
        monthlyRevenue: totalRevenue,
        consultationsRevenue,
        productsRevenue,
        donationsRevenue: 0,
        consultationsCount: paidConsultations.length,
        ordersCount: paidOrders.length,
        donationsCount: 0,
        revenueGrowth: 12.5
      });

      // Simular mensalidades (em produção, viria do banco)
      setMonthlyFees([
        {
          id: '1',
          member_id: '1',
          member_name: 'Maria Silva Santos',
          amount: 50.00,
          due_date: '2025-01-15',
          status: 'paid',
          paid_at: '2025-01-10',
          payment_method: 'pix'
        },
        {
          id: '2',
          member_id: '2',
          member_name: 'João Carlos Oliveira',
          amount: 50.00,
          due_date: '2025-01-15',
          status: 'pending'
        },
        {
          id: '3',
          member_id: '3',
          member_name: 'Ana Paula Costa',
          amount: 50.00,
          due_date: '2024-12-15',
          status: 'overdue'
        }
      ]);

      // Simular transações
      setTransactions([
        {
          id: '1',
          customer_name: 'Maria Silva',
          amount: 150.00,
          date: new Date().toISOString(),
          type: 'consultation',
          payment_method: 'pix',
          status: 'completed'
        },
        {
          id: '2',
          customer_name: 'João Santos',
          amount: 89.90,
          date: new Date().toISOString(),
          type: 'order',
          payment_method: 'cartao',
          status: 'completed'
        }
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    const csvContent = `
Relatório Financeiro Templo Dragão Negro
Período,${periodFilter}
Receita Total,R$ ${financialData.totalRevenue.toFixed(2)}
Receita Consultas,R$ ${financialData.consultationsRevenue.toFixed(2)}
Receita Produtos,R$ ${financialData.productsRevenue.toFixed(2)}
Consultas Pagas,${financialData.consultationsCount}
Pedidos Pagos,${financialData.ordersCount}
Crescimento,${financialData.revenueGrowth}%
    `.trim();

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${periodFilter}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'bg-red-100 text-red-800';
      case 'order': return 'bg-blue-100 text-blue-800';
      case 'donation': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'consultation': return 'Consulta';
      case 'order': return 'Pedido';
      case 'donation': return 'Doação';
      default: return type;
    }
  };

  const filteredFees = monthlyFees.filter(fee =>
    fee.member_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestão Financeira</h2>
          <p className="text-gray-600">Receitas, despesas e mensalidades dos filhos</p>
        </div>
        <div className="flex items-center space-x-4">
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
          <Button onClick={handleExportReport} className="bg-green-600 hover:bg-green-700">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {financialData.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-green-600">+{financialData.revenueGrowth}% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Consultas</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {financialData.consultationsRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500">{financialData.consultationsCount} consultas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Produtos</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {financialData.productsRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500">{financialData.ordersCount} pedidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Mensalidades</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {monthlyFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">{monthlyFees.filter(f => f.status === 'paid').length} pagas</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Categoria</CardTitle>
            <CardDescription>Distribuição das receitas por tipo de serviço</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Consultas Espirituais</p>
                    <p className="text-sm text-gray-500">{financialData.consultationsCount} consultas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">R$ {financialData.consultationsRevenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    {financialData.monthlyRevenue > 0 
                      ? ((financialData.consultationsRevenue / financialData.monthlyRevenue) * 100).toFixed(1)
                      : 0}% do total
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Mensalidades</p>
                    <p className="text-sm text-gray-500">{monthlyFees.filter(f => f.status === 'paid').length} pagas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    R$ {monthlyFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {monthlyFees.length > 0 
                      ? ((monthlyFees.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0) / financialData.monthlyRevenue) * 100).toFixed(1)
                      : 0}% do total
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">Loja Ritualística</p>
                    <p className="text-sm text-gray-500">{financialData.ordersCount} pedidos</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">R$ {financialData.productsRevenue.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">
                    {financialData.monthlyRevenue > 0 
                      ? ((financialData.productsRevenue / financialData.monthlyRevenue) * 100).toFixed(1)
                      : 0}% do total
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>Últimas movimentações financeiras</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      transaction.type === 'consultation' ? 'bg-red-100' :
                      transaction.type === 'order' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {transaction.type === 'consultation' ? (
                        <Heart className="h-4 w-4 text-red-600" />
                      ) : transaction.type === 'order' ? (
                        <DollarSign className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Heart className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.customer_name}</p>
                      <p className="text-xs text-gray-500">
                        {getTransactionTypeText(transaction.type)} • {transaction.payment_method}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">R$ {transaction.amount.toFixed(2)}</p>
                    <Badge className={getTransactionTypeColor(transaction.type)}>
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            {transactions.length === 0 && (
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma transação encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mensalidades dos Filhos */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Mensalidades dos Filhos</h3>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar membros..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Stats Mensalidades */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Filhos</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthlyFees.length}</div>
              <p className="text-xs text-gray-500">Filhos da casa</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Mensalidades Pagas</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {monthlyFees.filter(f => f.status === 'paid').length}
              </div>
              <p className="text-xs text-gray-500">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {monthlyFees.filter(f => f.status === 'pending').length}
              </div>
              <p className="text-xs text-gray-500">Aguardando pagamento</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Em Atraso</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {monthlyFees.filter(f => f.status === 'overdue').length}
              </div>
              <p className="text-xs text-gray-500">Vencidas</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Mensalidades */}
        <Card>
          <CardHeader>
            <CardTitle>Mensalidades dos Filhos</CardTitle>
            <CardDescription>Controle das mensalidades mensais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredFees.map((fee) => (
                <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      fee.status === 'paid' ? 'bg-green-100' :
                      fee.status === 'pending' ? 'bg-yellow-100' : 'bg-red-100'
                    }`}>
                      <Users className={`h-5 w-5 ${
                        fee.status === 'paid' ? 'text-green-600' :
                        fee.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium">{fee.member_name}</p>
                      <p className="text-sm text-gray-500">
                        Vencimento: {new Date(fee.due_date).toLocaleDateString('pt-BR')}
                        {fee.paid_at && ` • Pago em: ${new Date(fee.paid_at).toLocaleDateString('pt-BR')}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-bold">R$ {fee.amount.toFixed(2)}</p>
                      <Badge className={
                        fee.status === 'paid' ? 'bg-green-100 text-green-800' :
                        fee.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {fee.status === 'paid' ? 'Pago' :
                         fee.status === 'pending' ? 'Pendente' : 'Atrasado'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredFees.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'Nenhum membro encontrado' : 'Nenhuma mensalidade cadastrada'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece gerando mensalidades para os filhos da casa'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transações Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle>Todas as Transações</CardTitle>
          <CardDescription>Histórico completo de movimentações financeiras</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'consultation' ? 'bg-red-100' :
                    transaction.type === 'order' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {transaction.type === 'consultation' ? (
                      <Heart className="h-5 w-5 text-red-600" />
                    ) : transaction.type === 'order' ? (
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Heart className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.customer_name}</p>
                    <p className="text-sm text-gray-500">
                      {getTransactionTypeText(transaction.type)} • {transaction.payment_method} • 
                      {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">R$ {transaction.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-500">{transaction.status}</p>
                </div>
              </div>
            ))}
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma transação encontrada</h3>
              <p className="text-gray-500">
                As transações aparecerão aqui conforme forem sendo processadas
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}