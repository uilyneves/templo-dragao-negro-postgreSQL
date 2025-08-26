'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Star,
  Plus,
  Minus,
  Eye,
  Heart,
  Package,
  DollarSign,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { supabaseBrowser } from '@/lib/supabase-browser';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string;
  price: number;
  stock: number;
  images: string[];
  featured_image?: string;
  active: boolean;
  featured: boolean;
  spiritual_purpose?: string;
  product_categories?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function LojaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      if (!supabaseBrowser) {
        // Produtos de exemplo se Supabase não estiver configurado
        setProducts([
          {
            id: '1',
            name: 'Kit Velas 7 Dias - Cores Diversas',
            slug: 'kit-velas-7-dias',
            description: 'Kit completo com 7 velas coloridas para diferentes propósitos espirituais. Cada cor possui uma finalidade específica: branca (paz), vermelha (amor), verde (prosperidade), azul (proteção), amarela (sabedoria), roxa (espiritualidade), preta (quebra de demandas).',
            short_description: 'Kit com 7 velas coloridas para rituais',
            price: 85.00,
            stock: 12,
            images: ['https://images.pexels.com/photos/1040893/pexels-photo-1040893.jpeg?auto=compress&cs=tinysrgb&w=400'],
            active: true,
            featured: true,
            spiritual_purpose: 'Trabalhos espirituais diversos com cada cor representando uma energia específica',
            product_categories: { name: 'Velas' }
          },
          {
            id: '2',
            name: 'Incenso de Arruda - Pacote 20un',
            slug: 'incenso-arruda-20un',
            description: 'Incenso natural de arruda para limpeza espiritual e proteção. A arruda é uma das plantas mais poderosas para afastar energias negativas e proteger ambientes.',
            short_description: 'Incenso natural para limpeza espiritual',
            price: 25.00,
            stock: 25,
            images: ['https://images.pexels.com/photos/4040635/pexels-photo-4040635.jpeg?auto=compress&cs=tinysrgb&w=400'],
            active: true,
            featured: false,
            spiritual_purpose: 'Limpeza de ambientes e proteção contra energias negativas',
            product_categories: { name: 'Incensos' }
          },
          {
            id: '3',
            name: 'Imagem Exú Tranca Rua - 20cm',
            slug: 'imagem-exu-tranca-rua-20cm',
            description: 'Imagem em gesso de Exú Tranca Rua, o guardião dos caminhos. Peça artesanal pintada à mão com acabamento de qualidade.',
            short_description: 'Imagem artesanal de Exú Tranca Rua',
            price: 120.00,
            stock: 8,
            images: ['https://images.pexels.com/photos/8978562/pexels-photo-8978562.jpeg?auto=compress&cs=tinysrgb&w=400'],
            active: true,
            featured: true,
            spiritual_purpose: 'Abertura de caminhos, proteção e força espiritual',
            product_categories: { name: 'Imagens' }
          }
        ]);
        setCategories([
          { id: '1', name: 'Velas', slug: 'velas' },
          { id: '2', name: 'Incensos', slug: 'incensos' },
          { id: '3', name: 'Imagens', slug: 'imagens' },
          { id: '4', name: 'Elementos', slug: 'elementos' }
        ]);
        setLoading(false);
        return;
      }

      const [productsResult, categoriesResult] = await Promise.all([
        supabaseBrowser
          .from('products')
          .select(`
            *,
            product_categories(name)
          `)
          .eq('active', true)
          .order('featured', { ascending: false })
          .order('name'),
        supabaseBrowser
          .from('product_categories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order')
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

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      return prevCart.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(0, item.quantity - 1) }
          : item
      ).filter(item => item.quantity > 0);
    });
  };

  const getCartItemQuantity = (productId: string) => {
    const item = cart.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.product_categories?.name === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-900 via-red-900 to-stone-800 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Loja Ritualística
            </h1>
            <p className="text-xl md:text-2xl text-stone-200 mb-8 max-w-3xl mx-auto">
              Produtos consagrados e elementos espirituais para seus rituais
            </p>
            {cart.length > 0 && (
              <div className="bg-amber-600 text-white px-6 py-3 rounded-lg inline-flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                {cart.reduce((sum, item) => sum + item.quantity, 0)} itens • R$ {getCartTotal().toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Filtros e Busca */}
      <section className="py-8 bg-stone-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-4">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome A-Z</SelectItem>
                  <SelectItem value="price_asc">Menor Preço</SelectItem>
                  <SelectItem value="price_desc">Maior Preço</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Produtos */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-stone-600">Carregando produtos...</p>
              </div>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                {searchTerm ? 'Nenhum produto encontrado' : 'Loja em construção'}
              </h3>
              <p className="text-stone-600 mb-6">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca ou filtros' 
                  : 'Em breve teremos produtos ritualísticos consagrados disponíveis'
                }
              </p>
              <Button asChild className="bg-red-700 hover:bg-red-800">
                <Link href="/contato">
                  Entre em Contato
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-xl transition-shadow duration-300">
                  <div className="aspect-square bg-stone-100 rounded-t-lg overflow-hidden">
                    {product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-stone-300" />
                      </div>
                    )}
                    {product.featured && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-amber-600 text-white">
                          <Star className="h-3 w-3 mr-1" />
                          Destaque
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      {product.product_categories && (
                        <Badge variant="outline">
                          {product.product_categories.name}
                        </Badge>
                      )}
                      <div className="flex items-center text-sm text-stone-500">
                        <Package className="h-3 w-3 mr-1" />
                        {product.stock} em estoque
                      </div>
                    </div>
                    <CardTitle className="text-lg text-stone-900 line-clamp-2">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-stone-600 line-clamp-2">
                      {product.short_description || product.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-red-700">
                            R$ {product.price.toFixed(2)}
                          </p>
                          {product.spiritual_purpose && (
                            <p className="text-xs text-stone-500 mt-1">
                              {product.spiritual_purpose}
                            </p>
                          )}
                        </div>
                      </div>

                      {getCartItemQuantity(product.id) > 0 ? (
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeFromCart(product.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium text-green-800">
                            {getCartItemQuantity(product.id)} no carrinho
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addToCart(product)}
                            className="h-8 w-8 p-0"
                            disabled={getCartItemQuantity(product.id) >= product.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => addToCart(product)}
                          className="w-full bg-red-700 hover:bg-red-800"
                          disabled={product.stock === 0}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {product.stock === 0 ? 'Sem Estoque' : 'Adicionar ao Carrinho'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Carrinho Fixo */}
          {cart.length > 0 && (
            <div className="fixed bottom-6 right-6 z-50">
              <Card className="bg-red-700 text-white border-red-600 shadow-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <ShoppingCart className="h-6 w-6" />
                    <div>
                      <p className="font-bold">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)} itens
                      </p>
                      <p className="text-red-100">R$ {getCartTotal().toFixed(2)}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="border-white text-white hover:bg-white/10"
                    >
                      Finalizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>

      {/* Categorias em Destaque */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Categorias de Produtos
            </h2>
            <p className="text-xl text-stone-600">
              Explore nossa seleção de produtos ritualísticos consagrados
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="text-center hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="font-bold text-stone-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-stone-600">
                    {products.filter(p => p.product_categories?.name === category.name).length} produtos
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-red-800 to-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Produtos Consagrados no Templo
          </h2>
          <p className="text-xl text-stone-200 mb-8 max-w-3xl mx-auto">
            Todos os nossos produtos são consagrados com a energia dos Exús 
            e Pombagiras para potencializar seus trabalhos espirituais.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 text-lg px-8 py-4">
              <Link href="/agendamento">
                <Heart className="mr-2 h-5 w-5" />
                Agendar Consulta
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
              <Link href="/contato">
                Entre em Contato
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}