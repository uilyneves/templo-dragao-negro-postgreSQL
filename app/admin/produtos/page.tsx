'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  DollarSign,
  Archive,
  Save,
  X,
  Eye,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  active: boolean;
  featured: boolean;
  images: string[];
  category_id?: string;
  spiritual_purpose?: string;
  created_at: string;
  product_categories?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: '',
    spiritual_purpose: '',
    images: '',
    active: true,
    featured: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      if (!supabaseBrowser) throw new Error('Supabase não configurado');

      const [productsResult, categoriesResult] = await Promise.all([
        supabaseBrowser
          .from('products')
          .select(`
            *,
            product_categories(name)
          `)
          .order('created_at', { ascending: false }),
        supabaseBrowser
          .from('product_categories')
          .select('*')
          .order('name')
      ]);

      if (productsResult.error) {
        console.error('Erro ao carregar produtos:', productsResult.error);
        setProducts([]);
      } else {
        setProducts(productsResult.data || []);
      }

      if (categoriesResult.error) {
        console.error('Erro ao carregar categorias:', categoriesResult.error);
        setCategories([]);
      } else {
        setCategories(categoriesResult.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleCreateProduct = async () => {
    if (!productForm.name.trim() || !productForm.description.trim() || productForm.price <= 0) {
      alert('Nome, descrição e preço são obrigatórios');
      return;
    }

    setActionLoading(true);
    try {
      if (!supabaseBrowser) throw new Error('Supabase não configurado');

      const slug = productForm.slug || generateSlug(productForm.name);
      const images = productForm.images ? productForm.images.split(',').map(img => img.trim()) : [];

      const { error } = await supabaseBrowser
        .from('products')
        .insert({
          ...productForm,
          slug,
          images,
          tags: []
        });

      if (error) throw error;

      setShowCreateDialog(false);
      setProductForm({
        name: '',
        slug: '',
        description: '',
        price: 0,
        stock: 0,
        category_id: '',
        spiritual_purpose: '',
        images: '',
        active: true,
        featured: false
      });
      
      await loadData();
      alert('Produto criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      alert('Erro ao criar produto: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    
    setActionLoading(true);
    try {
      if (!supabaseBrowser) throw new Error('Supabase não configurado');

      const { error } = await supabaseBrowser
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadData();
      alert('Produto excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar produto:', error);
      alert('Erro ao deletar produto: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Gestão de Produtos</h2>
          <p className="text-gray-600">Gerencie o catálogo de produtos da loja</p>
        </div>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
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
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-red-700 hover:bg-red-800">
                <Plus className="mr-2 h-4 w-4" />
                Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Produto</DialogTitle>
                <DialogDescription>
                  Adicione um novo produto ao catálogo
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={productForm.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        setProductForm({
                          ...productForm, 
                          name,
                          slug: generateSlug(name)
                        });
                      }}
                      placeholder="Nome do produto"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={productForm.slug}
                      onChange={(e) => setProductForm({...productForm, slug: e.target.value})}
                      placeholder="slug-do-produto"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    placeholder="Descrição detalhada do produto..."
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Estoque</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={productForm.stock}
                      onChange={(e) => setProductForm({...productForm, stock: parseInt(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={productForm.category_id} onValueChange={(value) => setProductForm({...productForm, category_id: value})}>
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
                </div>
                <div>
                  <Label htmlFor="spiritual_purpose">Finalidade Espiritual</Label>
                  <Input
                    id="spiritual_purpose"
                    value={productForm.spiritual_purpose}
                    onChange={(e) => setProductForm({...productForm, spiritual_purpose: e.target.value})}
                    placeholder="Para que serve espiritualmente..."
                  />
                </div>
                <div>
                  <Label htmlFor="images">URLs das Imagens (separadas por vírgula)</Label>
                  <Input
                    id="images"
                    value={productForm.images}
                    onChange={(e) => setProductForm({...productForm, images: e.target.value})}
                    placeholder="https://exemplo.com/imagem1.jpg, https://exemplo.com/imagem2.jpg"
                  />
                </div>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="active"
                      checked={productForm.active}
                      onCheckedChange={(checked) => setProductForm({...productForm, active: !!checked})}
                    />
                    <Label htmlFor="active">Produto ativo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="featured"
                      checked={productForm.featured}
                      onCheckedChange={(checked) => setProductForm({...productForm, featured: !!checked})}
                    />
                    <Label htmlFor="featured">Produto em destaque</Label>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 mt-6">
                <Button 
                  onClick={handleCreateProduct} 
                  className="bg-red-700 hover:bg-red-800"
                  disabled={actionLoading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {actionLoading ? 'Salvando...' : 'Salvar Produto'}
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
            <CardTitle className="text-sm font-medium text-gray-600">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-gray-500">Produtos cadastrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Produtos Ativos</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.active).length}
            </div>
            <p className="text-xs text-gray-500">Visíveis na loja</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Em Destaque</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter(p => p.featured).length}
            </div>
            <p className="text-xs text-gray-500">Produtos destacados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {products.reduce((sum, p) => sum + (p.price * p.stock), 0).toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">Valor do estoque</p>
          </CardContent>
        </Card>
      </div>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
          <CardDescription>
            Gerencie todos os produtos da loja ritualística
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 mr-1" />
                        R$ {product.price.toFixed(2)}
                      </div>
                      <div className="flex items-center">
                        <Archive className="h-3 w-3 mr-1" />
                        {product.stock} em estoque
                      </div>
                      {product.product_categories && (
                        <div className="flex items-center">
                          <span className="text-xs">{product.product_categories.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex space-x-1 mb-1">
                      <Badge className={product.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {product.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                      {product.featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Destaque
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Criado em {new Date(product.created_at).toLocaleDateString('pt-BR')}
                    </p>
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
                      onClick={() => handleDeleteProduct(product.id)}
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

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Tente ajustar o termo de busca' : 'Comece criando um novo produto'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}