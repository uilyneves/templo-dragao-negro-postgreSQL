'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Heart, 
  Star, 
  Sparkles, 
  Calendar, 
  Clock,
  CheckCircle,
  ArrowRight,
  Phone,
  BookOpen,
  Zap,
  Crown,
  Users
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface SystemSettings {
  consultation_price: number;
  contact_phone: string;
}

export default function TrabalhosPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    consultation_price: 120.00,
    contact_phone: '(11) 99999-9999'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      if (!supabaseBrowser) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabaseBrowser
        .from('system_settings')
        .select('key, value, type')
        .in('key', ['consultation_price', 'contact_phone']);

      if (!error && data) {
        const settingsMap: any = {};
        data.forEach(setting => {
          try {
            if (setting.type === 'string') {
              settingsMap[setting.key] = JSON.parse(setting.value);
            } else if (setting.type === 'number') {
              settingsMap[setting.key] = parseFloat(setting.value);
            }
          } catch (e) {
            settingsMap[setting.key] = setting.value;
          }
        });

        setSettings(prev => ({ ...prev, ...settingsMap }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
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
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Trabalhos Espirituais
            </h1>
            <p className="text-xl md:text-2xl text-stone-200 mb-8 max-w-3xl mx-auto">
              Trabalhos tradicionais de Kimbanda para proteção, cura e prosperidade
            </p>
          </div>
        </div>
      </section>

      {/* Tipos de Trabalhos */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Nossos Trabalhos Espirituais
            </h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              Trabalhos tradicionais realizados com a força dos Exús e Pombagiras
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Proteção Espiritual */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-red-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-xl text-red-800">Proteção Espiritual</CardTitle>
                <CardDescription className="text-lg">
                  Trabalhos de defesa e proteção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-stone-600 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Quebra de demandas e feitiços</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Proteção contra inveja e olho grande</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Limpeza de ambientes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Proteção familiar</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Abertura de Caminhos */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-amber-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl text-amber-800">Abertura de Caminhos</CardTitle>
                <CardDescription className="text-lg">
                  Desobstrução e prosperidade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-stone-600 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Abertura de caminhos profissionais</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Prosperidade financeira</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Sucesso em empreendimentos</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Remoção de obstáculos</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Trabalhos de Amor */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-pink-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-pink-600" />
                </div>
                <CardTitle className="text-xl text-pink-800">Trabalhos de Amor</CardTitle>
                <CardDescription className="text-lg">
                  Relacionamentos e união
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-stone-600 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Amarração amorosa</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Retorno de pessoa amada</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Harmonização de relacionamentos</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Conquista amorosa</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Cura e Saúde */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-green-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl text-green-800">Cura e Saúde</CardTitle>
                <CardDescription className="text-lg">
                  Trabalhos de cura espiritual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-stone-600 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Passes de cura e energização</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Limpeza de doenças espirituais</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Fortalecimento da aura</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Equilíbrio energético</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Desenvolvimento Mediúnico */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-indigo-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-indigo-600" />
                </div>
                <CardTitle className="text-xl text-indigo-800">Desenvolvimento Mediúnico</CardTitle>
                <CardDescription className="text-lg">
                  Crescimento espiritual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-stone-600 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Desenvolvimento da mediunidade</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Conexão com guias espirituais</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Fortalecimento espiritual</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Orientação para médiuns</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Trabalhos Especiais */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-purple-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-xl text-purple-800">Trabalhos Especiais</CardTitle>
                <CardDescription className="text-lg">
                  Rituais personalizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-stone-600 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Trabalhos para casos específicos</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Rituais de iniciação</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Trabalhos de longo prazo</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Orientação personalizada</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Como Funciona
            </h2>
            <p className="text-xl text-stone-600">
              Processo simples e transparente para seu trabalho espiritual
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Consulta Inicial</h3>
              <p className="text-stone-600">
                Agende uma consulta para avaliarmos sua situação e definirmos o melhor trabalho
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-amber-600">2</span>
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Planejamento</h3>
              <p className="text-stone-600">
                Definimos junto com você o tipo de trabalho, materiais necessários e cronograma
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Execução</h3>
              <p className="text-stone-600">
                Realizamos o trabalho com toda dedicação e respeito às tradições da Kimbanda
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">4</span>
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Acompanhamento</h3>
              <p className="text-stone-600">
                Oferecemos orientação e acompanhamento para potencializar os resultados
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Entidades que Trabalhamos */}
      <section className="py-20 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Entidades Espirituais
            </h2>
            <p className="text-xl text-stone-600">
              Trabalhamos com as principais entidades da Kimbanda
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center bg-red-50 border-red-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-bold text-red-800 mb-2">Exú Tranca Rua</h3>
                <p className="text-sm text-red-600">Guardião dos caminhos</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-pink-50 border-pink-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                <h3 className="font-bold text-pink-800 mb-2">Maria Padilha</h3>
                <p className="text-sm text-pink-600">Rainha das Pombagiras</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-gray-50 border-gray-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-gray-600" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">Exú Caveira</h3>
                <p className="text-sm text-gray-600">Protetor das almas</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-green-800 mb-2">Caboclo Sete Flechas</h3>
                <p className="text-sm text-green-600">Guerreiro das matas</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-br from-red-800 to-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para Seu Trabalho Espiritual?
          </h2>
          <p className="text-xl text-stone-200 mb-8 max-w-3xl mx-auto">
            Agende uma consulta para avaliarmos sua situação e definirmos 
            o melhor trabalho para suas necessidades espirituais.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 text-lg px-8 py-4">
              <Link href="/agendamento">
                <Calendar className="mr-2 h-5 w-5" />
                Agendar Consulta - R$ {settings.consultation_price.toFixed(2)}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8 py-4">
              <a 
                href={`https://wa.me/55${settings.contact_phone.replace(/\D/g, '')}?text=Olá! Gostaria de saber mais sobre os trabalhos espirituais do Templo Dragão Negro.`}
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Phone className="mr-2 h-5 w-5" />
                Falar no WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}