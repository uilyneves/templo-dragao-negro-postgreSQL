'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Save,
  X,
  Mail,
  Phone,
  Calendar,
  Tag,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { memberCrudService } from '@/lib/supabase-client';

interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  origin: string;
  tags: string[];
  total_consultations: number;
  total_spent: number;
  created_at: string;
}

export default function MembrosPage() {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birth_date: '',
    spiritual_level: '',
    guardian_exu: '',
    guardian_pomba_gira: '',
    notes: ''
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await memberCrudService.getAllMembers();
      setMembers(data);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMember = async () => {
    if (!memberForm.name.trim() || !memberForm.email.trim()) {
      alert('Nome e email são obrigatórios');
      return;
    }

    setActionLoading(true);
    try {
      await memberCrudService.createMember(memberForm);

      setShowCreateDialog(false);
      setMemberForm({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        birth_date: '',
        spiritual_level: '',
        guardian_exu: '',
        guardian_pomba_gira: '',
        notes: ''
      });
      
      await loadMembers();
      alert('Membro criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar membro:', error);
      alert('Erro ao criar membro: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este membro?')) return;
    
    setActionLoading(true);
    try {
      await memberCrudService.deleteMember(id);

      await loadMembers();
      alert('Membro excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar membro:', error);
      alert('Erro ao deletar membro: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'blocked': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'blocked': return 'Bloqueado';
      default: return 'Pendente';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando membros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestão de Membros</h2>
          <p className="text-gray-600">Gerencie todos os membros do templo</p>
        </div>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar membros..."
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
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
              <SelectItem value="blocked">Bloqueados</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-red-700 hover:bg-red-800">
                <Plus className="mr-2 h-4 w-4" />
                Novo Membro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Membro</DialogTitle>
                <DialogDescription>
                  Adicione um novo membro ao templo
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={memberForm.name}
                      onChange={(e) => setMemberForm({...memberForm, name: e.target.value})}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={memberForm.email}
                      onChange={(e) => setMemberForm({...memberForm, email: e.target.value})}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={memberForm.phone}
                      onChange={(e) => setMemberForm({...memberForm, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      value={memberForm.cpf}
                      onChange={(e) => setMemberForm({...memberForm, cpf: e.target.value})}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birth_date">Data de Nascimento</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={memberForm.birth_date}
                      onChange={(e) => setMemberForm({...memberForm, birth_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="spiritual_level">Nível Espiritual</Label>
                    <Select value={memberForm.spiritual_level} onValueChange={(value) => setMemberForm({...memberForm, spiritual_level: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="iniciante">Iniciante</SelectItem>
                        <SelectItem value="desenvolvimento">Em Desenvolvimento</SelectItem>
                        <SelectItem value="medium">Médium</SelectItem>
                        <SelectItem value="cambono">Cambono</SelectItem>
                        <SelectItem value="dirigente">Dirigente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="guardian_exu">Exú de Cabeça</Label>
                    <Input
                      id="guardian_exu"
                      value={memberForm.guardian_exu}
                      onChange={(e) => setMemberForm({...memberForm, guardian_exu: e.target.value})}
                      placeholder="Ex: Exú Tranca Rua"
                    />
                  </div>
                  <div>
                    <Label htmlFor="guardian_pomba_gira">Pombagira de Cabeça</Label>
                    <Input
                      id="guardian_pomba_gira"
                      value={memberForm.guardian_pomba_gira}
                      onChange={(e) => setMemberForm({...memberForm, guardian_pomba_gira: e.target.value})}
                      placeholder="Ex: Maria Padilha"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={memberForm.notes}
                    onChange={(e) => setMemberForm({...memberForm, notes: e.target.value})}
                    placeholder="Observações sobre o membro..."
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-6">
                <Button 
                  onClick={handleCreateMember} 
                  className="bg-red-700 hover:bg-red-800"
                  disabled={actionLoading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {actionLoading ? 'Salvando...' : 'Salvar Membro'}
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
            <CardTitle className="text-sm font-medium text-gray-600">Total de Membros</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-gray-500">Membros cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Membros Ativos</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter(m => m.status === 'active').length}
            </div>
            <p className="text-xs text-gray-500">Ativos no templo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Novos Este Mês</CardTitle>
            <Plus className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.filter(m => {
                const memberDate = new Date(m.created_at);
                const currentMonth = new Date().getMonth();
                return memberDate.getMonth() === currentMonth;
              }).length}
            </div>
            <p className="text-xs text-gray-500">Novos membros</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Consultas</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {members.reduce((sum, m) => sum + m.total_consultations, 0)}
            </div>
            <p className="text-xs text-gray-500">Consultas realizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Membros</CardTitle>
          <CardDescription>
            Gerencie todos os membros do templo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{member.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {member.email}
                      </div>
                      {member.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {member.phone}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(member.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Badge className={getStatusColor(member.status)}>
                      {getStatusText(member.status)}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      {member.total_consultations} consultas • R$ {member.total_spent.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteMember(member.id)}
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

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum membro encontrado
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Tente ajustar o termo de busca' : 'Comece criando um novo membro'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}