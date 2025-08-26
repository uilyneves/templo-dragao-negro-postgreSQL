'use client';

import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Calendar, 
  User, 
  Eye,
  Tag,
  ArrowRight,
  Clock
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

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  status: string;
  published_at?: string;
  tags: string[];
  category?: string;
  view_count: number;
  created_at: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      if (!supabaseBrowser) {
        // Posts de exemplo se Supabase não estiver configurado
        setPosts([
          {
            id: '1',
            title: 'A Importância dos Passes na Kimbanda',
            slug: 'importancia-passes-kimbanda',
            excerpt: 'Entenda como os passes espirituais podem transformar sua vida e proteger sua energia.',
            content: 'Os passes são uma das práticas mais importantes na Kimbanda...',
            status: 'published',
            published_at: new Date().toISOString(),
            tags: ['passes', 'kimbanda', 'espiritualidade'],
            category: 'Ensinamentos',
            view_count: 245,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            title: 'Exú Tranca Rua: O Guardião dos Caminhos',
            slug: 'exu-tranca-rua-guardiao-caminhos',
            excerpt: 'Conheça a história e características do poderoso Exú Tranca Rua.',
            content: 'Exú Tranca Rua é uma das entidades mais conhecidas...',
            status: 'published',
            published_at: new Date().toISOString(),
            tags: ['exu', 'tranca-rua', 'entidades'],
            category: 'Entidades',
            view_count: 189,
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            title: 'Como Preparar uma Oferenda para Maria Padilha',
            slug: 'oferenda-maria-padilha',
            excerpt: 'Aprenda o passo a passo para fazer uma oferenda adequada para a Rainha das Pombagiras.',
            content: 'Maria Padilha é conhecida como a Rainha das Pombagiras...',
            status: 'published',
            published_at: new Date().toISOString(),
            tags: ['maria-padilha', 'oferenda', 'pombagira'],
            category: 'Práticas',
            view_count: 312,
            created_at: new Date().toISOString()
          }
        ]);
        setCategories(['Ensinamentos', 'Entidades', 'Práticas', 'Desenvolvimento']);
        setLoading(false);
        return;
      }

      const { data, error } = await supabaseBrowser
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar posts:', error);
        setPosts([]);
      } else {
        setPosts(data || []);
        
        // Extrair categorias únicas
        const uniqueCategories = [...new Set(data?.map(post => post.category).filter(Boolean))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-900 via-red-900 to-stone-800 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Blog Espiritual
            </h1>
            <p className="text-xl md:text-2xl text-stone-200 mb-8 max-w-3xl mx-auto">
              Ensinamentos, práticas e sabedoria da tradição de Kimbanda
            </p>
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
                placeholder="Buscar artigos..."
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
                  {categories.map((category, index) => (
                    <SelectItem key={index} value={category || ''}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Posts do Blog */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-stone-600">Carregando artigos...</p>
              </div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                {searchTerm ? 'Nenhum artigo encontrado' : 'Blog em construção'}
              </h3>
              <p className="text-stone-600 mb-6">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca ou filtros' 
                  : 'Em breve teremos artigos sobre Kimbanda, ensinamentos e práticas espirituais'
                }
              </p>
              <Button asChild className="bg-red-700 hover:bg-red-800">
                <Link href="/contato">
                  Entre em Contato
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-xl transition-shadow duration-300">
                  <div className="aspect-video bg-gradient-to-br from-red-800 to-stone-900 rounded-t-lg flex items-center justify-center">
                    {post.featured_image ? (
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    ) : (
                      <BookOpen className="h-12 w-12 text-amber-400" />
                    )}
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      {post.category && (
                        <Badge className="bg-red-100 text-red-800">
                          {post.category}
                        </Badge>
                      )}
                      <div className="flex items-center text-sm text-stone-500">
                        <Eye className="h-3 w-3 mr-1" />
                        {post.view_count}
                      </div>
                    </div>
                    <CardTitle className="text-xl text-stone-900 line-clamp-2">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-stone-600">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-stone-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(post.published_at || post.created_at)}
                      </div>
                      <Button variant="outline" size="sm">
                        Ler Mais
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-4">
                        {post.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {post.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{post.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-red-800 to-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Quer Saber Mais Sobre Kimbanda?
          </h2>
          <p className="text-xl text-stone-200 mb-8 max-w-3xl mx-auto">
            Agende uma consulta para receber orientação espiritual personalizada 
            e conhecer mais sobre nossa tradição.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 text-lg px-8 py-4">
              <Link href="/agendamento">
                <Calendar className="mr-2 h-5 w-5" />
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