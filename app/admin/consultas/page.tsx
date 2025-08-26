'use client';

import { useState, useEffect } from 'react';
import { 
  Heart, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Save,
  X,
  Calendar,
  Clock,
  User,
  DollarSign,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { consultationCrudService, memberCrudService } from '@/lib/supabase-client';

interface Consultation {
  id: string;
  member_id?: string;
  date: string;
  time: string;
  status: string;
  payment_status: string;
  amount: number;
  question?: string;
  exu_consulted?: string;
  members?: {
    name: string;
    email: string;
  };
  created_at: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
}

export default function ConsultasPage() {
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [consultationForm, setConsultationForm] = useState({
    member_id: '',
    date: '',
    time: '',
    question: '',
    exu_consulted: '',
    amount: 120.00
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [consultationsData, membersData] = await Promise.all([
        consultationCrudService.getAllConsultations(),
        memberCrudService.getAllMembers()
      ]);
      
      setConsultations(consultationsData);
      setMembers(membersData.map(m => ({ id: m.id, name: m.name, email: m.email })));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setConsultations([]);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConsultation = async () => {
    if (!consultationForm.member_id || !consultationForm.date || !consultationForm.time) {
      alert('Membro, data e horário são obrigatórios');
      return;
    }

    setActionLoading(true);
    try {
      await consultationCrudService.createConsultation(consultationForm);

      setShowCreateDialog(false);
      setConsultationForm({
        member_id: '',
        date: '',
        time: '',
        question: '',
        exu_consulted: '',
        amount: 120.00
      });
      
      await loadData();
      alert('Consulta criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar consulta:', error);
      alert('Erro ao criar consulta: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConsultation = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta consulta?')) return;
    
    setActionLoading(true);
    try {
      await consultationCrudService.deleteConsultation(id);

      await loadData();
      alert('Consulta excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar consulta:', error);
      alert('Erro ao deletar consulta: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredConsultations = consultations.filter(consultation => {
    const memberName = consultation.members?.name || '';
    const matchesSearch = memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         consultation.exu_consulted?.toLowerCase().includes(searchTerm.toLowerCase() || '');
    const matchesStatus = statusFilter === 'all' || consultation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmada';
      case 'completed': return 'Realizada';
      case 'cancelled': return 'Cancelada';
      case 'no_show': return 'Não Compareceu';
      default: return 'Pendente';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-orange-100 text-orange-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando consultas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestão de Consultas</h2>
          <p className="text-gray-600">Gerencie todas as consultas espirituais do templo</p>
        </div>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar consultas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="confirmed">Confirmadas</SelectItem>
              <SelectItem value="completed">Realizadas</SelectItem>
              <SelectItem value="cancelled">Canceladas</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-red-700 hover:bg-red-800">
                <Plus className="mr-2 h-4 w-4" />
                Nova Consulta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agendar Nova Consulta</DialogTitle>
                <DialogDescription>
                  Agende uma consulta espiritual para um membro
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="member">Membro *</Label>
                  <Select value={consultationForm.member_id} onValueChange={(value) => setConsultationForm({...consultationForm, member_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o membro" />
                    </SelectTrigger>
                    <SelectContent>
                      {members.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} - {member.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Data *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={consultationForm.date}
                      onChange={(e) => setConsultationForm({...consultationForm, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Horário *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={consultationForm.time}
                      onChange={(e) => setConsultationForm({...consultationForm, time: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="exu">Exú Consultado</Label>
                  <Input
                    id="exu"
                    value={consultationForm.exu_consulted}
                    onChange={(e) => setConsultationForm({...consultationForm, exu_consulted: e.target.value})}
                    placeholder="Ex: Exú Tranca Rua"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={consultationForm.amount}
                    onChange={(e) => setConsultationForm({...consultationForm, amount: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="question">Pergunta/Motivo</Label>
                  <Textarea
                    id="question"
                    value={consultationForm.question}
                    onChange={(e) => setConsultationForm({...consultationForm, question: e.target.value})}
                    placeholder="Motivo da consulta..."
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-6">
                <Button 
                  onClick={handleCreateConsultation} 
                  className="bg-red-700 hover:bg-red-800"
                  disabled={actionLoading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {actionLoading ? 'Agendando...' : 'Agendar Consulta'}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Consultas</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consultations.length}</div>
            <p className="text-xs text-gray-500">Consultas agendadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Confirmadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consultations.filter(c => c.status === 'confirmed').length}
            </div>
            <p className="text-xs text-gray-500">Prontas para realizar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consultations.filter(c => {
                const consultationDate = new Date(c.created_at);
                const currentMonth = new Date().getMonth();
                return consultationDate.getMonth() === currentMonth;
              }).length}
            </div>
            <p className="text-xs text-gray-500">Consultas do mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Receita</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {consultations
                .filter(c => c.payment_status === 'paid')
                .reduce((sum, c) => sum + c.amount, 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">Receita total</p>
          </CardContent>
        </Card>
      </div>

      {/* Consultations List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Consultas</CardTitle>
          <CardDescription>
            Gerencie todas as consultas espirituais do templo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredConsultations.map((consultation) => (
              <div key={consultation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <Heart className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {consultation.members?.name || 'Cliente Avulso'}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(consultation.date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {consultation.time}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        R$ {consultation.amount.toFixed(2)}
                      </div>
                      {consultation.exu_consulted && (
                        <div className="flex items-center">
                          <span className="text-xs">Exú: {consultation.exu_consulted}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Badge className={getStatusColor(consultation.status)}>
                      {getStatusText(consultation.status)}
                    </Badge>
                    <div className="mt-1">
                      <Badge className={getPaymentStatusColor(consultation.payment_status)} variant="outline">
                        {consultation.payment_status === 'paid' ? 'Pago' : 
                         consultation.payment_status === 'pending' ? 'Pendente' : 'Falhou'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteConsultation(consultation.id)}
                      className="text-red-600 hover:text-red-700"
                      disabled={actionLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredConsultations.length === 0 && (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma consulta encontrada
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Tente ajustar o termo de busca' : 'Comece agendando uma nova consulta'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}