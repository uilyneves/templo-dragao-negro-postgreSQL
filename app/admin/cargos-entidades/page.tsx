'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Users,
  Key,
  Save,
  X,
  Crown,
  UserCheck,
  Sparkles,
  Star,
  Zap,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { entityTypesService, entitiesService } from '@/lib/entities-service';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  level: number;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
}

interface EntityType {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  hierarchy_level: number;
  is_active: boolean;
}

interface Entity {
  id: string;
  name: string;
  entity_type_id?: string;
  description?: string;
  day_of_week?: string;
  colors: string[];
  offerings: string[];
  characteristics: string[];
  is_active: boolean;
  entity_types?: {
    name: string;
    color: string;
  };
}

export default function CargosEntidadesPage() {
  const [activeTab, setActiveTab] = useState('cargos');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Estados para Cargos
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchRoles, setSearchRoles] = useState('');
  const [showCreateRoleDialog, setShowCreateRoleDialog] = useState(false);
  const [roleForm, setRoleForm] = useState({
    name: '',
    display_name: '',
    description: '',
    level: 10
  });

  // Estados para Entidades
  const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [searchEntities, setSearchEntities] = useState('');
  const [showCreateEntityDialog, setShowCreateEntityDialog] = useState(false);
  const [showCreateTypeDialog, setShowCreateTypeDialog] = useState(false);
  const [entityForm, setEntityForm] = useState({
    name: '',
    entity_type_id: '',
    description: '',
    day_of_week: '',
    colors: '',
    offerings: '',
    characteristics: ''
  });
  const [typeForm, setTypeForm] = useState({
    name: '',
    description: '',
    color: '#dc2626',
    icon: 'Zap',
    hierarchy_level: 1
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadRoles(), loadEntities()]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      if (!supabaseBrowser) return;

      const { data, error } = await supabaseBrowser
        .from('roles')
        .select('*')
        .order('level', { ascending: false });

      if (error) {
        console.error('Erro ao carregar cargos:', error);
        setRoles([]);
      } else {
        setRoles(data || []);
      }
    } catch (error) {
      console.error('Erro no loadRoles:', error);
      setRoles([]);
    }
  };

  const loadEntities = async () => {
    try {
      const [typesData, entitiesData] = await Promise.all([
        entityTypesService.getAll(),
        entitiesService.getAll()
      ]);
      
      setEntityTypes(typesData);
      setEntities(entitiesData);
    } catch (error) {
      console.error('Erro ao carregar entidades:', error);
      setEntityTypes([]);
      setEntities([]);
    }
  };

  const handleCreateRole = async () => {
    if (!roleForm.name.trim() || !roleForm.display_name.trim()) {
      alert('Nome e nome de exibição são obrigatórios');
      return;
    }

    setActionLoading(true);
    try {
      if (!supabaseBrowser) throw new Error('Supabase não configurado');

      const { error } = await supabaseBrowser
        .from('roles')
        .insert({
          ...roleForm,
          is_system: false,
          is_active: true
        });

      if (error) throw error;

      setShowCreateRoleDialog(false);
      setRoleForm({
        name: '',
        display_name: '',
        description: '',
        level: 10
      });
      
      await loadRoles();
      alert('Cargo criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar cargo:', error);
      alert('Erro ao criar cargo: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateEntityType = async () => {
    if (!typeForm.name.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    setActionLoading(true);
    try {
      await entityTypesService.create({
        ...typeForm,
        is_active: true
      });

      setShowCreateTypeDialog(false);
      setTypeForm({
        name: '',
        description: '',
        color: '#dc2626',
        icon: 'Zap',
        hierarchy_level: 1
      });
      
      await loadEntities();
      alert('Tipo de entidade criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar tipo:', error);
      alert('Erro ao criar tipo: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateEntity = async () => {
    if (!entityForm.name.trim() || !entityForm.entity_type_id) {
      alert('Nome e tipo são obrigatórios');
      return;
    }

    setActionLoading(true);
    try {
      await entitiesService.create({
        ...entityForm,
        colors: entityForm.colors ? entityForm.colors.split(',').map(c => c.trim()) : [],
        offerings: entityForm.offerings ? entityForm.offerings.split(',').map(o => o.trim()) : [],
        characteristics: entityForm.characteristics ? entityForm.characteristics.split(',').map(c => c.trim()) : [],
        attributes: {},
        is_active: true
      });

      setShowCreateEntityDialog(false);
      setEntityForm({
        name: '',
        entity_type_id: '',
        description: '',
        day_of_week: '',
        colors: '',
        offerings: '',
        characteristics: ''
      });
      
      await loadEntities();
      alert('Entidade criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar entidade:', error);
      alert('Erro ao criar entidade: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRole = async (id: string, isSystem: boolean) => {
    if (isSystem) {
      alert('Não é possível excluir cargos do sistema');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este cargo?')) return;
    
    setActionLoading(true);
    try {
      if (!supabaseBrowser) throw new Error('Supabase não configurado');

      const { error } = await supabaseBrowser
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadRoles();
      alert('Cargo excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar cargo:', error);
      alert('Erro ao deletar cargo: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEntity = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta entidade?')) return;
    
    setActionLoading(true);
    try {
      await entitiesService.delete(id);
      await loadEntities();
      alert('Entidade excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar entidade:', error);
      alert('Erro ao deletar entidade: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredRoles = roles.filter(role => 
    role.display_name.toLowerCase().includes(searchRoles.toLowerCase()) ||
    role.name.toLowerCase().includes(searchRoles.toLowerCase())
  );

  const filteredEntities = entities.filter(entity => 
    entity.name.toLowerCase().includes(searchEntities.toLowerCase())
  );

  const getLevelColor = (level: number) => {
    if (level >= 80) return 'bg-red-100 text-red-800';
    if (level >= 60) return 'bg-orange-100 text-orange-800';
    if (level >= 40) return 'bg-yellow-100 text-yellow-800';
    if (level >= 20) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Cargos & Entidades Espirituais</h2>
            <p className="text-gray-600">Gerencie hierarquia da casa e entidades espirituais</p>
          </div>
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="cargos">Cargos</TabsTrigger>
            <TabsTrigger value="entidades">Entidades</TabsTrigger>
          </TabsList>
        </div>

        {/* SEÇÃO CARGOS */}
        <TabsContent value="cargos" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar cargos..."
                  value={searchRoles}
                  onChange={(e) => setSearchRoles(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <Dialog open={showCreateRoleDialog} onOpenChange={setShowCreateRoleDialog}>
              <DialogTrigger asChild>
                <Button className="bg-red-700 hover:bg-red-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Cargo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Cargo</DialogTitle>
                  <DialogDescription>
                    Adicione um novo cargo à hierarquia da casa
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome do Sistema *</Label>
                      <Input
                        id="name"
                        value={roleForm.name}
                        onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                        placeholder="ex: medium_desenvolvido"
                      />
                    </div>
                    <div>
                      <Label htmlFor="display_name">Nome de Exibição *</Label>
                      <Input
                        id="display_name"
                        value={roleForm.display_name}
                        onChange={(e) => setRoleForm({...roleForm, display_name: e.target.value})}
                        placeholder="ex: Médium Desenvolvido"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={roleForm.description}
                      onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                      placeholder="Descrição das responsabilidades..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="level">Nível de Acesso (1-100)</Label>
                    <Input
                      id="level"
                      type="number"
                      min="1"
                      max="99"
                      value={roleForm.level}
                      onChange={(e) => setRoleForm({...roleForm, level: parseInt(e.target.value)})}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Níveis mais altos têm mais privilégios (Super Admin = 100)
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2 mt-6">
                  <Button 
                    onClick={handleCreateRole} 
                    className="bg-red-700 hover:bg-red-800"
                    disabled={actionLoading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {actionLoading ? 'Salvando...' : 'Salvar Cargo'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateRoleDialog(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards - Cargos */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Cargos</CardTitle>
                <Shield className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{roles.length}</div>
                <p className="text-xs text-gray-500">Cargos configurados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Cargos do Sistema</CardTitle>
                <Crown className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {roles.filter(r => r.is_system).length}
                </div>
                <p className="text-xs text-gray-500">Não editáveis</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Cargos Ativos</CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {roles.filter(r => r.is_active).length}
                </div>
                <p className="text-xs text-gray-500">Em uso</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Níveis de Acesso</CardTitle>
                <Key className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">6</div>
                <p className="text-xs text-gray-500">Níveis hierárquicos</p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Cargos */}
          <Card>
            <CardHeader>
              <CardTitle>Hierarquia da Casa</CardTitle>
              <CardDescription>
                Estrutura hierárquica do Templo de Kimbanda Dragão Negro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRoles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        {role.is_system ? (
                          <Crown className="h-5 w-5 text-red-600" />
                        ) : (
                          <Shield className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{role.display_name}</h3>
                        <p className="text-sm text-gray-600">{role.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Nível: {role.level}</span>
                          {role.is_system && (
                            <Badge variant="outline" className="text-xs">
                              Sistema
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getLevelColor(role.level)}>
                          Nível {role.level}
                        </Badge>
                        <div className="mt-1">
                          <Badge className={role.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {role.is_active ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        {!role.is_system && (
                          <>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteRole(role.id, role.is_system)}
                              className="text-red-600 hover:text-red-700"
                              disabled={actionLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredRoles.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum cargo encontrado
                  </h3>
                  <p className="text-gray-500">
                    {searchRoles ? 'Tente ajustar o termo de busca' : 'Comece criando um novo cargo'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEÇÃO ENTIDADES */}
        <TabsContent value="entidades" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar entidades..."
                  value={searchEntities}
                  onChange={(e) => setSearchEntities(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Dialog open={showCreateTypeDialog} onOpenChange={setShowCreateTypeDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Tipo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Tipo de Entidade</DialogTitle>
                    <DialogDescription>
                      Adicione um novo tipo (Exús, Pombagiras, etc.)
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="type-name">Nome *</Label>
                      <Input
                        id="type-name"
                        value={typeForm.name}
                        onChange={(e) => setTypeForm({...typeForm, name: e.target.value})}
                        placeholder="ex: Exús"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type-description">Descrição</Label>
                      <Textarea
                        id="type-description"
                        value={typeForm.description}
                        onChange={(e) => setTypeForm({...typeForm, description: e.target.value})}
                        placeholder="Descrição do tipo de entidade..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type-color">Cor</Label>
                        <Input
                          id="type-color"
                          type="color"
                          value={typeForm.color}
                          onChange={(e) => setTypeForm({...typeForm, color: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="type-icon">Ícone</Label>
                        <Select value={typeForm.icon} onValueChange={(value) => setTypeForm({...typeForm, icon: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Zap">Raio (Exús)</SelectItem>
                            <SelectItem value="Heart">Coração (Pombagiras)</SelectItem>
                            <SelectItem value="Star">Estrela (Orixás)</SelectItem>
                            <SelectItem value="Crown">Coroa (Chefes)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-6">
                    <Button 
                      onClick={handleCreateEntityType} 
                      className="bg-red-700 hover:bg-red-800"
                      disabled={actionLoading}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {actionLoading ? 'Salvando...' : 'Salvar Tipo'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateTypeDialog(false)}>
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showCreateEntityDialog} onOpenChange={setShowCreateEntityDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-red-700 hover:bg-red-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Entidade
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Cadastrar Entidade Espiritual</DialogTitle>
                    <DialogDescription>
                      Adicione uma nova entidade ao templo
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="entity-name">Nome *</Label>
                        <Input
                          id="entity-name"
                          value={entityForm.name}
                          onChange={(e) => setEntityForm({...entityForm, name: e.target.value})}
                          placeholder="ex: Exú Tranca Rua"
                        />
                      </div>
                      <div>
                        <Label htmlFor="entity-type">Tipo *</Label>
                        <Select value={entityForm.entity_type_id} onValueChange={(value) => setEntityForm({...entityForm, entity_type_id: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {entityTypes.map(type => (
                              <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="entity-description">Descrição</Label>
                      <Textarea
                        id="entity-description"
                        value={entityForm.description}
                        onChange={(e) => setEntityForm({...entityForm, description: e.target.value})}
                        placeholder="Descrição da entidade..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="day-of-week">Dia da Semana</Label>
                        <Select value={entityForm.day_of_week} onValueChange={(value) => setEntityForm({...entityForm, day_of_week: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Segunda-feira">Segunda-feira</SelectItem>
                            <SelectItem value="Terça-feira">Terça-feira</SelectItem>
                            <SelectItem value="Quarta-feira">Quarta-feira</SelectItem>
                            <SelectItem value="Quinta-feira">Quinta-feira</SelectItem>
                            <SelectItem value="Sexta-feira">Sexta-feira</SelectItem>
                            <SelectItem value="Sábado">Sábado</SelectItem>
                            <SelectItem value="Domingo">Domingo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="colors">Cores (separadas por vírgula)</Label>
                        <Input
                          id="colors"
                          value={entityForm.colors}
                          onChange={(e) => setEntityForm({...entityForm, colors: e.target.value})}
                          placeholder="Vermelho, Preto"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="offerings">Oferendas (separadas por vírgula)</Label>
                      <Input
                        id="offerings"
                        value={entityForm.offerings}
                        onChange={(e) => setEntityForm({...entityForm, offerings: e.target.value})}
                        placeholder="Cachaça, Charuto, Vela vermelha"
                      />
                    </div>
                    <div>
                      <Label htmlFor="characteristics">Características (separadas por vírgula)</Label>
                      <Input
                        id="characteristics"
                        value={entityForm.characteristics}
                        onChange={(e) => setEntityForm({...entityForm, characteristics: e.target.value})}
                        placeholder="Proteção, Abertura de caminhos, Força"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-6">
                    <Button 
                      onClick={handleCreateEntity} 
                      className="bg-red-700 hover:bg-red-800"
                      disabled={actionLoading}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {actionLoading ? 'Salvando...' : 'Salvar Entidade'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateEntityDialog(false)}>
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards - Entidades */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Entidades</CardTitle>
                <Sparkles className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{entities.length}</div>
                <p className="text-xs text-gray-500">Entidades cadastradas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Tipos de Entidades</CardTitle>
                <Star className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{entityTypes.length}</div>
                <p className="text-xs text-gray-500">Tipos configurados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Entidades Ativas</CardTitle>
                <Zap className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {entities.filter(e => e.is_active).length}
                </div>
                <p className="text-xs text-gray-500">Disponíveis</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Exús Cadastrados</CardTitle>
                <Heart className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {entities.filter(e => e.entity_types?.name === 'Exús').length}
                </div>
                <p className="text-xs text-gray-500">Linha masculina</p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Entidades */}
          <Card>
            <CardHeader>
              <CardTitle>Entidades Espirituais</CardTitle>
              <CardDescription>
                Cadastro de Exús, Pombagiras e outras entidades do templo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEntities.map((entity) => (
                  <div key={entity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: entity.entity_types?.color + '20' }}
                      >
                        <Sparkles className="h-5 w-5" style={{ color: entity.entity_types?.color }} />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{entity.name}</h3>
                        <p className="text-sm text-gray-600">{entity.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{entity.entity_types?.name}</span>
                          {entity.day_of_week && <span>{entity.day_of_week}</span>}
                          <span>{entity.characteristics.length} características</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className="bg-purple-100 text-purple-800">
                          {entity.entity_types?.name}
                        </Badge>
                        <div className="mt-1">
                          <Badge className={entity.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {entity.is_active ? 'Ativo' : 'Inativo'}
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
                          onClick={() => handleDeleteEntity(entity.id)}
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

              {filteredEntities.length === 0 && (
                <div className="text-center py-12">
                  <Sparkles className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma entidade encontrada
                  </h3>
                  <p className="text-gray-500">
                    {searchEntities ? 'Tente ajustar o termo de busca' : 'Comece cadastrando uma nova entidade'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}