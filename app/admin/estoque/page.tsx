'use client';

import { useState, useEffect } from 'react';
import { 
  Archive, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Save,
  X,
  Eye,
  Calendar,
  User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { stockCategoryService, stockItemService, stockMovementService } from '@/lib/supabase-client';
import { Database } from '@/lib/supabase.types';

type StockItem = Database['public']['Tables']['stock_items']['Row'] & {
  stock_categories?: { name: string } | null;
  status: 'ok' | 'low' | 'critical';
};
type StockMovement = Database['public']['Tables']['stock_movements']['Row'] & {
  stock_items?: { name: string } | null;
};
type StockCategory = Database['public']['Tables']['stock_categories']['Row'] & {
  items_count: number;
};

export default function EstoquePage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [categories, setCategories] = useState<StockCategory[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [showCreateItemDialog, setShowCreateItemDialog] = useState(false);
  const [showMovementDialog, setShowMovementDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);

  const [itemForm, setItemForm] = useState<Omit<Database['public']['Tables']['stock_items']['Insert'], 'id' | 'created_at' | 'updated_at' | 'last_movement' | 'current_stock' | 'is_active'>>({
    name: '',
    stock_category_id: undefined,
    min_stock: 10,
    unit: 'unidade',
    cost_price: 0,
    supplier: ''
  });
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);

  const [movementForm, setMovementForm] = useState<Omit<Database['public']['Tables']['stock_movements']['Insert'], 'id' | 'created_at'>>({
    stock_item_id: undefined,
    type: 'entrada',
    quantity: 0,
    reason: '',
    cost: 0,
    supplier: ''
  });

  const [categoryForm, setCategoryForm] = useState<Omit<Database['public']['Tables']['stock_categories']['Insert'], 'id' | 'created_at' | 'updated_at' | 'is_active'>>({
    name: '',
    description: ''
  });
  const [editingCategory, setEditingCategory] = useState<StockCategory | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [itemsData, categoriesData, movementsData] = await Promise.all([
        stockItemService.getAllItems(),
        stockCategoryService.getAllCategories(),
        stockMovementService.getAllMovements()
      ]);

      const processedItems: StockItem[] = (itemsData || []).map(item => ({
        ...item,
        status: item.current_stock <= item.min_stock / 2 ? 'critical' : item.current_stock <= item.min_stock ? 'low' : 'ok'
      }));
      setStockItems(processedItems);

      const categoriesWithCount: StockCategory[] = (categoriesData || []).map(cat => ({
        ...cat,
        items_count: processedItems.filter(item => item.stock_category_id === cat.id).length
      }));
      setCategories(categoriesWithCount);

      setMovements(movementsData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok': return 'bg-green-100 text-green-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ok': return 'Normal';
      case 'low': return 'Baixo';
      case 'critical': return 'Crítico';
      default: return 'Desconhecido';
    }
  };

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.stock_category_id === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const lowStockItems = stockItems.filter(item => item.status === 'low' || item.status === 'critical');
  const totalValue = stockItems.reduce((sum, item) => sum + (item.current_stock * item.cost_price), 0);

  // Item CRUD Handlers
  const handleOpenCreateItemDialog = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      stock_category_id: undefined,
      min_stock: 10,
      unit: 'unidade',
      cost_price: 0,
      supplier: ''
    });
    setShowCreateItemDialog(true);
  };

  const handleOpenEditItemDialog = (item: StockItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      stock_category_id: item.stock_category_id || undefined,
      min_stock: item.min_stock,
      unit: item.unit,
      cost_price: item.cost_price,
      supplier: item.supplier || ''
    });
    setShowCreateItemDialog(true);
  };

  const handleSaveItem = async () => {
    if (!itemForm.name.trim() || !itemForm.stock_category_id || itemForm.min_stock < 0 || itemForm.cost_price < 0) {
      alert('Nome, categoria, estoque mínimo e preço de custo são obrigatórios e devem ser válidos.');
      return;
    }

    setActionLoading(true);
    try {
      if (editingItem) {
        await stockItemService.updateItem(editingItem.id, itemForm);
        alert('Item atualizado com sucesso!');
      } else {
        await stockItemService.createItem(itemForm);
        alert('Item criado com sucesso!');
      }
      setShowCreateItemDialog(false);
      await loadData();
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      alert('Erro ao salvar item: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este item? Todas as movimentações relacionadas serão mantidas, mas o item será removido.')) return;
    setActionLoading(true);
    try {
      await stockItemService.deleteItem(id);
      alert('Item excluído com sucesso!');
      await loadData();
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      alert('Erro ao deletar item: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  // Movement CRUD Handlers
  const handleOpenMovementDialog = () => {
    setMovementForm({
      stock_item_id: undefined,
      type: 'entrada',
      quantity: 0,
      reason: '',
      cost: 0,
      supplier: ''
    });
    setShowMovementDialog(true);
  };

  const handleSaveMovement = async () => {
    if (!movementForm.stock_item_id || movementForm.quantity <= 0 || !movementForm.reason.trim()) {
      alert('Item, quantidade e motivo são obrigatórios e a quantidade deve ser maior que zero.');
      return;
    }
    if (movementForm.type === 'entrada' && movementForm.cost! < 0) {
      alert('O custo de entrada não pode ser negativo.');
      return;
    }

    setActionLoading(true);
    try {
      await stockMovementService.createMovement(movementForm);
      alert('Movimentação registrada com sucesso!');
      setShowMovementDialog(false);
      await loadData();
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      alert('Erro ao registrar movimentação: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  // Category CRUD Handlers
  const handleOpenCreateCategoryDialog = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      description: ''
    });
    setShowCategoryDialog(true);
  };

  const handleOpenEditCategoryDialog = (category: StockCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description || ''
    });
    setShowCategoryDialog(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert('Nome da categoria é obrigatório.');
      return;
    }

    setActionLoading(true);
    try {
      if (editingCategory) {
        await stockCategoryService.updateCategory(editingCategory.id, categoryForm);
        alert('Categoria atualizada com sucesso!');
      } else {
        await stockCategoryService.createCategory(categoryForm);
        alert('Categoria criada com sucesso!');
      }
      setShowCategoryDialog(false);
      await loadData();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Todos os itens associados a ela terão sua categoria removida.')) return;
    setActionLoading(true);
    try {
      await stockCategoryService.deleteCategory(id);
      alert('Categoria excluída com sucesso!');
      await loadData();
    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      alert('Erro ao deletar categoria: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando estoque...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Gestão de Estoque</h2>
            <p className="text-gray-600">Controle completo de materiais ritualísticos</p>
          </div>
          <TabsList className="grid w-fit grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="items">Itens</TabsTrigger>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
          </TabsList>
        </div>

        {/* DASHBOARD DO ESTOQUE */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Alertas de Estoque Baixo */}
          {lowStockItems.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  Alertas de Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Estoque: {item.current_stock} {item.unit}</span>
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusText(item.status)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Métricas Gerais */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Itens</CardTitle>
                <Package className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stockItems.length}</div>
                <p className="text-xs text-gray-500">Itens cadastrados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Estoque Baixo</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lowStockItems.length}</div>
                <p className="text-xs text-gray-500">Itens em falta</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Valor Total</CardTitle>
                <Archive className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</div>
                <p className="text-xs text-gray-500">Valor do estoque</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Categorias</CardTitle>
                <Package className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length}</div>
                <p className="text-xs text-gray-500">Categorias ativas</p>
              </CardContent>
            </Card>
          </div>

          {/* Movimentações Recentes */}
          <Card>
            <CardHeader>
              <CardTitle>Movimentações Recentes</CardTitle>
              <CardDescription>Últimas entradas e saídas do estoque</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {movements.slice(0, 5).map(movement => (
                  <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        movement.type === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {movement.type === 'entrada' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {movement.stock_items?.name || 'Item Desconhecido'}
                        </p>
                        <p className="text-sm text-gray-500">{movement.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${movement.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(movement.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {movements.length === 0 && (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma movimentação recente</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ITENS DO ESTOQUE */}
        <TabsContent value="items" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar itens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ok">Normal</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="critical">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showCreateItemDialog} onOpenChange={setShowCreateItemDialog}>
              <DialogTrigger asChild>
                <Button className="bg-red-700 hover:bg-red-800" onClick={handleOpenCreateItemDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Novo Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingItem ? 'Editar Item' : 'Cadastrar Item'}</DialogTitle>
                  <DialogDescription>
                    {editingItem ? 'Edite as informações do item no estoque' : 'Adicione um novo item ao estoque'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="item-name">Nome *</Label>
                    <Input
                      id="item-name"
                      value={itemForm.name}
                      onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                      placeholder="Nome do item"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Categoria *</Label>
                      <Select value={itemForm.stock_category_id} onValueChange={(value) => setItemForm({...itemForm, stock_category_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="unit">Unidade</Label>
                      <Select value={itemForm.unit} onValueChange={(value) => setItemForm({...itemForm, unit: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unidade">Unidade</SelectItem>
                          <SelectItem value="pacote">Pacote</SelectItem>
                          <SelectItem value="garrafa">Garrafa</SelectItem>
                          <SelectItem value="litro">Litro</SelectItem>
                          <SelectItem value="kg">Quilograma</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="min-stock">Estoque Mínimo</Label>
                      <Input
                        id="min-stock"
                        type="number"
                        value={itemForm.min_stock}
                        onChange={(e) => setItemForm({...itemForm, min_stock: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cost-price">Preço de Custo (R$)</Label>
                      <Input
                        id="cost-price"
                        type="number"
                        step="0.01"
                        value={itemForm.cost_price}
                        onChange={(e) => setItemForm({...itemForm, cost_price: parseFloat(e.target.value)})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="supplier">Fornecedor</Label>
                    <Input
                      id="supplier"
                      value={itemForm.supplier}
                      onChange={(e) => setItemForm({...itemForm, supplier: e.target.value})}
                      placeholder="Nome do fornecedor"
                    />
                  </div>
                </div>
                <div className="flex space-x-2 mt-6">
                  <Button 
                    onClick={handleSaveItem}
                    className="bg-red-700 hover:bg-red-800"
                    disabled={actionLoading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {actionLoading ? 'Salvando...' : 'Salvar Item'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateItemDialog(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de Itens */}
          <Card>
            <CardHeader>
              <CardTitle>Itens do Estoque</CardTitle>
              <CardDescription>
                Todos os materiais ritualísticos em estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{item.stock_categories?.name || 'Sem Categoria'}</span>
                          <span>Estoque: {item.current_stock} {item.unit}</span>
                          <span>Mín: {item.min_stock}</span>
                          <span>R$ {item.cost_price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getStatusColor(item.status)}>
                          {getStatusText(item.status)}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.supplier}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenEditItemDialog(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteItem(item.id)}
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

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum item encontrado
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Tente ajustar os filtros' : 'Comece cadastrando um novo item'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MOVIMENTAÇÕES */}
        <TabsContent value="movements" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Movimentações de Estoque</h3>
              <p className="text-gray-600">Histórico de entradas e saídas</p>
            </div>
            <Dialog open={showMovementDialog} onOpenChange={setShowMovementDialog}>
              <DialogTrigger asChild>
                <Button className="bg-red-700 hover:bg-red-800" onClick={handleOpenMovementDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Movimentação
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registrar Movimentação</DialogTitle>
                  <DialogDescription>
                    Registre entrada ou saída de estoque
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="movement-item">Item *</Label>
                      <Select value={movementForm.stock_item_id} onValueChange={(value) => setMovementForm({...movementForm, stock_item_id: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o item" />
                        </SelectTrigger>
                        <SelectContent>
                          {stockItems.map(item => (
                            <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="movement-type">Tipo *</Label>
                      <Select value={movementForm.type} onValueChange={(value: 'entrada' | 'saida') => setMovementForm({...movementForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entrada">Entrada</SelectItem>
                          <SelectItem value="saida">Saída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantidade *</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={movementForm.quantity}
                        onChange={(e) => setMovementForm({...movementForm, quantity: parseInt(e.target.value)})}
                      />
                    </div>
                    {movementForm.type === 'entrada' && (
                      <div>
                        <Label htmlFor="cost">Custo Total (R$)</Label>
                        <Input
                          id="cost"
                          type="number"
                          step="0.01"
                          value={movementForm.cost}
                          onChange={(e) => setMovementForm({...movementForm, cost: parseFloat(e.target.value)})}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="reason">Motivo *</Label>
                    <Input
                      id="reason"
                      value={movementForm.reason}
                      onChange={(e) => setMovementForm({...movementForm, reason: e.target.value})}
                      placeholder="Motivo da movimentação"
                    />
                  </div>
                  {movementForm.type === 'entrada' && (
                    <div>
                      <Label htmlFor="supplier">Fornecedor</Label>
                      <Input
                        id="supplier"
                        value={movementForm.supplier}
                        onChange={(e) => setMovementForm({...movementForm, supplier: e.target.value})}
                        placeholder="Nome do fornecedor"
                      />
                    </div>
                  )}
                </div>
                <div className="flex space-x-2 mt-6">
                  <Button 
                    onClick={handleSaveMovement}
                    className="bg-red-700 hover:bg-red-800"
                    disabled={actionLoading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {actionLoading ? 'Registrando...' : 'Registrar'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowMovementDialog(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de Movimentações */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
              <CardDescription>
                Todas as entradas e saídas registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        movement.type === 'entrada' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {movement.type === 'entrada' ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {movement.stock_items?.name || 'Item Desconhecido'}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(movement.created_at).toLocaleDateString('pt-BR')}
                          </div>
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {movement.responsible || 'N/A'}
                          </div>
                          <span>{movement.reason}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${movement.type === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                        {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                      </p>
                      {movement.cost && (
                        <p className="text-sm text-gray-500">R$ {movement.cost.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {movements.length === 0 && (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma movimentação encontrada
                  </h3>
                  <p className="text-gray-500">
                    Comece registrando uma nova movimentação de estoque
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CATEGORIAS */}
        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Categorias de Materiais</h3>
              <p className="text-gray-600">Organize os materiais por categoria</p>
            </div>
            <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
              <DialogTrigger asChild>
                <Button className="bg-red-700 hover:bg-red-800" onClick={handleOpenCreateCategoryDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Criar Categoria'}</DialogTitle>
                  <DialogDescription>
                    {editingCategory ? 'Edite as informações da categoria' : 'Adicione uma nova categoria de materiais'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="category-name">Nome *</Label>
                    <Input
                      id="category-name"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                      placeholder="Nome da categoria"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category-description">Descrição</Label>
                    <Textarea
                      id="category-description"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                      placeholder="Descrição da categoria..."
                    />
                  </div>
                </div>
                <div className="flex space-x-2 mt-6">
                  <Button 
                    onClick={handleSaveCategory}
                    className="bg-red-700 hover:bg-red-800"
                    disabled={actionLoading}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {actionLoading ? 'Salvando...' : 'Salvar Categoria'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCategoryDialog(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm" onClick={() => handleOpenEditCategoryDialog(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={actionLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-blue-600">{category.items_count}</span>
                    <span className="text-sm text-gray-500">itens cadastrados</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-12">
              <Archive className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma categoria encontrada
              </h3>
              <p className="text-gray-500">
                Comece criando uma categoria para organizar os materiais
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}