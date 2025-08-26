'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { 
  Calendar, 
  Heart, 
  BookOpen, 
  User, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  LogOut,
  ArrowLeft,
  Star,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Consultation {
  id: string;
  date: string;
  time: string;
  status: string;
  question?: string;
  amount: number;
}

export default function MemberDashboard() {
  const [user, setUser] = useState<any>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    loadMemberData();
  }, []);

  const checkAuth = async () => {
    try {
      if (!supabaseBrowser) {
        router.push('/membros/login');
        return;
      }

      const { data: { user } } = await supabaseBrowser.auth.getUser();
      
      if (!user) {
        router.push('/membros/login');
        return;
      }

      // Verificar se é membro
      const { data: profile } = await supabaseBrowser
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        // Buscar role separadamente se necessário
        let roleName = null;
        if (profile.role_id) {
          const { data: role } = await supabaseBrowser
            .from('roles')
            .select('name')
            .eq('id', profile.role_id)
            .single();
          roleName = role?.name;
        }
        
        if (roleName !== 'member') {
          router.push('/membros/login');
          return;
        }
      } else {
        router.push('/membros/login');
        return;
      }

      setUser({ ...user, profile });
    } catch (error) {
      console.error('Erro na autenticação:', error);
      router.push('/membros/login');
    } finally {
      setLoading(false);
    }
  };

  const loadMemberData = async () => {
    try {
      if (!supabaseBrowser) return;

      const { data: { user } } = await supabaseBrowser.auth.getUser();
      if (!user) return;

      // Buscar membro primeiro
      const { data: member } = await supabaseBrowser
        .from('members')
        .select('id')
        .eq('email', user.email)
        .single();

      if (member) {
        // Carregar consultas do membro
        const { data: consultationsData } = await supabaseBrowser
          .from('consultations')
          .select('*')
          .eq('member_id', member.id)
          .order('created_at', { ascending: false });

        setConsultations(consultationsData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleLogout = async () => {
    if (!supabaseBrowser) return;
    await supabaseBrowser.auth.signOut();
    router.push('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Realizada';
      case 'cancelled': return 'Cancelada';
      default: return 'Pendente';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost">
                <Link href="/" className="flex items-center text-stone-600 hover:text-stone-900">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Site
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-stone-900">Área do Membro</h1>
                <p className="text-stone-600">Bem-vindo, {user.profile?.name || 'Membro'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {user.profile?.name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-stone-700">
                  {user.profile?.name || 'Membro'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-stone-500 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-amber-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    Bem-vindo ao Templo Dragão Negro
                  </h2>
                  <p className="text-amber-100">
                    Acompanhe suas consultas, trabalhos espirituais e participe da nossa comunidade.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-stone-600">Total de Consultas</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{consultations.length}</div>
              <p className="text-xs text-stone-500">Consultas realizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-stone-600">Consultas Confirmadas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {consultations.filter(c => c.status === 'confirmed').length}
              </div>
              <p className="text-xs text-stone-500">Agendadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-stone-600">Consultas Realizadas</CardTitle>
              <Star className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {consultations.filter(c => c.status === 'completed').length}
              </div>
              <p className="text-xs text-stone-500">Concluídas</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Minhas Consultas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="mr-2 h-5 w-5 text-red-700" />
                Minhas Consultas
              </CardTitle>
              <CardDescription>
                Histórico e status das suas consultas espirituais
              </CardDescription>
            </CardHeader>
            <CardContent>
              {consultations.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-500 mb-4">Nenhuma consulta realizada ainda</p>
                  <Button asChild className="bg-red-700 hover:bg-red-800">
                    <Link href="/agendamento">Agendar Primeira Consulta</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultations.slice(0, 5).map((consultation) => (
                    <div key={consultation.id} className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-stone-500" />
                        <div>
                          <p className="font-medium">
                            {new Date(consultation.date).toLocaleDateString('pt-BR')} às {consultation.time}
                          </p>
                          <p className="text-sm text-stone-500">
                            R$ {consultation.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(consultation.status)}>
                        {getStatusText(consultation.status)}
                      </Badge>
                    </div>
                  ))}
                  {consultations.length > 5 && (
                    <p className="text-center text-sm text-stone-500">
                      E mais {consultations.length - 5} consultas...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesse rapidamente os principais serviços
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full bg-red-700 hover:bg-red-800 justify-start">
                <Link href="/agendamento">
                  <Calendar className="mr-2 h-4 w-4" />
                  Agendar Nova Consulta
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/trabalhos">
                  <Star className="mr-2 h-4 w-4" />
                  Ver Trabalhos Espirituais
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/loja">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Loja Ritualística
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/blog">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Blog Espiritual
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full justify-start">
                <Link href="/contato">
                  <User className="mr-2 h-4 w-4" />
                  Falar Conosco
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-8">
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900">Informações Importantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-amber-800">
                <div>
                  <h4 className="font-semibold mb-2">Horários de Atendimento:</h4>
                  <p>Segunda a Sexta: 9h às 18h</p>
                  <p>Sábado: 9h às 15h</p>
                  <p>Domingo: Fechado</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Rituais:</h4>
                  <p>Quartas-feiras: 20h</p>
                  <p>Sábados: 20h</p>
                  <p>Confirme presença antecipadamente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}