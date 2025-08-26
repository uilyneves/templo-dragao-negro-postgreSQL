'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Users,
  Clock,
  MapPin,
  Save,
  X,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface Cult {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  type: string;
  max_participants?: number;
  current_participants: number;
  status: string;
  published: boolean;
  location: string;
  requirements?: string;
  created_at: string;
}

export default function RituaisPage() {
  const [cults, setCults] = useState<Cult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [cultForm, setCultForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    type: 'regular',
    max_participants: 50,
    location: 'Templo de Kimbanda Dragão Negro',
    requirements: '',
    published: true
  });

  useEffect(() => {
    loadCults();
  }, []);

  const loadCults = async () => {
    try {
      setLoading(true);
      if (!supabaseBrowser) throw new Error('Supabase não configurado');

      const { data, error } = await supabaseBrowser
        .from('cults')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      setCults(data || []);
    } catch (error) {
      console.error('Erro ao carregar rituais:', error);
      setCults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCult = async () => {
    if (!cultForm.title.trim() || !cultForm.date || !cultForm.time) {
      alert('Título, data e horário são obrigatórios');
      return;
    }

    setActionLoading(true);
    try {
      if (!supabaseBrowser) throw new Error('Supabase não configurado');

      const { error } = await supabaseBrowser
        .from('cults')
        .insert({
          ...cultForm,
          current_participants: 0,
          status: 'scheduled'
        });

      if (error) throw error;

      setShowCreateDialog(false);
      setCultForm({
        title: '',
        description: '',
        date: '',
        time: '',
        type: 'regular',
        max_participants: 50,
        location: 'Templo de Kimbanda Dragão Negro',
        requirements: '',
        published: true
      });
      
      await loadCults();
      alert('Ritual criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar ritual:', error);
      alert('Erro ao criar ritual: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCult = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este ritual?')) return;
    
    setActionLoading(true);
    try {
      if (!supabaseBrowser) throw new Error('Supabase não configurado');

      const { error } = await supabaseBrowser
        .from('cults')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadCults();
      alert('Ritual excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar ritual:', error);
      alert('Erro ao deletar ritual: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCults = cults.filter(cult => {
    const matchesSearch = cult.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || cult.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'in_progress': return 'Em Andamento';
      case 'completed': return 'Realizado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'regular': return 'Regular';
      case 'development': return 'Desenvolvimento';
      case 'special': return 'Especial';
      case 'initiation': return 'Iniciação';
      case 'private': return 'Privado';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando rituais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestão de Rituais & Eventos</h2>
          <p className="text-gray-600">Gerencie todos os rituais e eventos do templo</p>
        </div>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar rituais..."
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
              <SelectItem value="scheduled">Agendados</SelectItem>
              <SelectItem value="completed">Realizados</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-red-700 hover:bg-red-800">
                <Plus className="mr-2 h-4 w-4" />
                Novo Ritual
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Ritual</DialogTitle>
                <DialogDescription>
                  Agende um novo ritual ou evento no templo
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={cultForm.title}
                    onChange={(e) => setCultForm({...cultForm, title: e.target.value})}
                    placeholder="Nome do ritual"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={cultForm.description}
                    onChange={(e) => setCultForm({...cultForm, description: e.target.value})}
                    placeholder="Descrição do ritual..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Data *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={cultForm.date}
                      onChange={(e) => setCultForm({...cultForm, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="time">Horário *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={cultForm.time}
                      onChange={(e) => setCultForm({...cultForm, time: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={cultForm.type} onValueChange={(value) => setCultForm({...cultForm, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="development">Desenvolvimento</SelectItem>
                        <SelectItem value="special">Especial</SelectItem>
                        <SelectItem value="initiation">Iniciação</SelectItem>
                        <SelectItem value="private">Privado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="max_participants">Máx. Participantes</Label>
                    <Input
                      id="max_participants"
                      type="number"
                      value={cultForm.max_participants}
                      onChange={(e) => setCultForm({...cultForm, max_participants: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="location">Local</Label>
                  <Input
                    id="location"
                    value={cultForm.location}
                    onChange={(e) => setCultForm({...cultForm, location: e.target.value})}
                    placeholder="Local do ritual"
                  />
                </div>
                <div>
                  <Label htmlFor="requirements">Requisitos</Label>
                  <Textarea
                    id="requirements"
                    value={cultForm.requirements}
                    onChange={(e) => setCultForm({...cultForm, requirements: e.target.value})}
                    placeholder="Requisitos para participação..."
                  />
                </div>
              </div>
              <div className="flex space-x-2 mt-6">
                <Button 
                  onClick={handleCreateCult} 
                  className="bg-red-700 hover:bg-red-800"
                  disabled={actionLoading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {actionLoading ? 'Salvando...' : 'Salvar Ritual'}
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
            <CardTitle className="text-sm font-medium text-gray-600">Total de Rituais</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cults.length}</div>
            <p className="text-xs text-gray-500">Rituais cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Agendados</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cults.filter(c => c.status === 'scheduled').length}
            </div>
            <p className="text-xs text-gray-500">Próximos rituais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cults.filter(c => {
                const cultDate = new Date(c.date);
                const currentMonth = new Date().getMonth();
                return cultDate.getMonth() === currentMonth;
              }).length}
            </div>
            <p className="text-xs text-gray-500">Rituais do mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Participantes</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cults.reduce((sum, c) => sum + c.current_participants, 0)}
            </div>
            <p className="text-xs text-gray-500">Total de participantes</p>
          </CardContent>
        </Card>
      </div>

      {/* Cults List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Rituais</CardTitle>
          <CardDescription>
            Gerencie todos os rituais e eventos do templo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCults.map((cult) => (
              <div key={cult.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{cult.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(cult.date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {cult.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {cult.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {cult.current_participants}/{cult.max_participants || '∞'}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <Badge className={getStatusColor(cult.status)}>
                      {getStatusText(cult.status)}
                    </Badge>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {getTypeText(cult.type)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDeleteCult(cult.id)}
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

          {filteredCults.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum ritual encontrado
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Tente ajustar o termo de busca' : 'Comece criando um novo ritual'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}