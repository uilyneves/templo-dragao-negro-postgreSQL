'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Calendar,
  Users,
  Heart,
  DollarSign,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface DashboardData {
  totalMembers: number;
  totalConsultations: number;
  completedConsultations: number;
  pendingConsultations: number;
  totalRevenue: number;
  monthlyRevenue: number;
  loading: boolean;
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalMembers: 0,
    totalConsultations: 0,
    completedConsultations: 0,
    pendingConsultations: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    loading: true
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      if (!supabaseBrowser) {
        console.error('Supabase não configurado');
        setDashboardData(prev => ({ ...prev, loading: false }));
        return;
      }

      // Carregar dados reais do banco
      const [membersResult, consultationsResult] = await Promise.all([
        supabaseBrowser.from('members').select('*', { count: 'exact', head: true }),
        supabaseBrowser.from('consultations').select('*')
      ]);

      const totalMembers = membersResult.count || 0;
      const consultations = consultationsResult.data || [];
      
      const completedConsultations = consultations.filter(c => c.status === 'completed').length;
      const pendingConsultations = consultations.filter(c => c.status === 'pending').length;
      
      // Calcular receita real
      const totalRevenue = consultations
        .filter(c => c.payment_status === 'paid')
        .reduce((sum, c) => sum + (c.amount || 0), 0);

      // Receita do mês atual
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyRevenue = consultations
        .filter(c => c.payment_status === 'paid' && c.created_at?.startsWith(currentMonth))
        .reduce((sum, c) => sum + (c.amount || 0), 0);

      setDashboardData({
        totalMembers,
        totalConsultations: consultations.length,
        completedConsultations,
        pendingConsultations,
        totalRevenue,
        monthlyRevenue,
        loading: false
      });

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h2>
        <p className="text-gray-600">Visão geral do Templo de Kimbanda Dragão Negro</p>
      </div>

      {/* Alertas */}
      {dashboardData.pendingConsultations > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Consultas Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">
              Você tem {dashboardData.pendingConsultations} consultas pendentes de confirmação.
            </p>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalMembers}</div>
            <p className="text-xs text-gray-500">Membros cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Consultas Realizadas</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.completedConsultations}</div>
            <p className="text-xs text-gray-500">de {dashboardData.totalConsultations} agendadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {dashboardData.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Receita acumulada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {dashboardData.monthlyRevenue.toFixed(2)}</div>
            <p className="text-xs text-gray-500">Receita mensal</p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Atividades */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>Últimas movimentações do templo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.totalConsultations === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma consulta registrada ainda</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm">Consultas realizadas</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">
                      {dashboardData.completedConsultations}
                    </Badge>
                  </div>
                  
                  {dashboardData.pendingConsultations > 0 && (
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <span className="text-sm">Consultas pendentes</span>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        {dashboardData.pendingConsultations}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>Verificações de funcionamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Banco de dados</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Online</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Sistema de agendamento</span>
                </div>
                <Badge className="bg-green-100 text-green-800">Ativo</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">Relatórios</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Disponível</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesso direto às principais funcionalidades</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium">Gerenciar Membros</h4>
                <p className="text-xs text-gray-500">Cadastro e edição</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Heart className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <h4 className="font-medium">Nova Consulta</h4>
                <p className="text-xs text-gray-500">Agendar consulta</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium">Rituais</h4>
                <p className="text-xs text-gray-500">Eventos do templo</p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium">Relatórios</h4>
                <p className="text-xs text-gray-500">Analytics</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}