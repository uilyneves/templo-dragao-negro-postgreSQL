'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  Heart, 
  Star, 
  Users, 
  Calendar, 
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Award,
  BookOpen
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface SystemSettings {
  site_name: string;
  contact_phone: string;
  consultation_price: number;
  consultation_duration: number;
}

export default function SobrePage() {
  const [settings, setSettings] = useState<SystemSettings>({
    site_name: 'Templo de Kimbanda Dragão Negro',
    contact_phone: '(11) 99999-9999',
    consultation_price: 120.00,
    consultation_duration: 30
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
        .in('key', ['site_name', 'contact_phone', 'consultation_price', 'consultation_duration']);

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
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Sobre o {settings.site_name}
            </h1>
            <p className="text-xl md:text-2xl text-stone-200 mb-8 max-w-3xl mx-auto">
              Mais de 20 anos dedicados à tradição autêntica da Kimbanda
            </p>
          </div>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">
                Nossa História
              </h2>
              <div className="space-y-6 text-lg text-stone-600">
                <p>
                  O Templo de Kimbanda Dragão Negro foi fundado há mais de duas décadas 
                  com o propósito de manter viva a tradição autêntica da Kimbanda, 
                  oferecendo orientação espiritual através da sabedoria dos Exús e Pombagiras.
                </p>
                <p>
                  Nossa casa espiritual é um espaço sagrado onde a força ancestral 
                  africana se manifesta para auxiliar aqueles que buscam proteção, 
                  cura, abertura de caminhos e desenvolvimento espiritual.
                </p>
                <p>
                  Trabalhamos com seriedade e respeito às tradições, oferecendo 
                  consultas individuais, rituais coletivos e orientação para o 
                  desenvolvimento mediúnico de nossos filhos de santo.
                </p>
              </div>
              <div className="mt-8">
                <Button asChild size="lg" className="bg-red-700 hover:bg-red-800">
                  <Link href="/agendamento">
                    <Calendar className="mr-2 h-5 w-5" />
                    Agendar Consulta - R$ {settings.consultation_price.toFixed(2)}
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-red-800 to-stone-900 rounded-2xl flex items-center justify-center">
                <div className="text-center text-white">
                  <Shield className="h-24 w-24 mx-auto mb-4 text-amber-400" />
                  <h3 className="text-2xl font-bold mb-2">Dragão Negro</h3>
                  <p className="text-stone-300">Força • Proteção • Sabedoria</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Nossos Valores e Princípios
            </h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              Baseamos nosso trabalho em princípios sólidos que guiam nossa prática espiritual
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-xl text-red-800">Tradição Autêntica</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-stone-600">
                  Mantemos viva a tradição original da Kimbanda, respeitando 
                  os fundamentos ancestrais e a sabedoria dos antigos.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="text-xl text-amber-800">Respeito e Ética</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-stone-600">
                  Tratamos cada consulente com respeito, mantendo a ética 
                  espiritual e o sigilo necessário em todos os trabalhos.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl text-blue-800">Comunidade Acolhedora</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-stone-600">
                  Criamos um ambiente acolhedor onde todos se sentem 
                  bem-vindos, independente de sua origem ou experiência espiritual.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Nossos Serviços */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              O Que Oferecemos
            </h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              Serviços espirituais completos para sua jornada de crescimento
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-red-800">
                  <Heart className="mr-3 h-6 w-6" />
                  Consultas Espirituais
                </CardTitle>
                <CardDescription className="text-lg">
                  R$ {settings.consultation_price.toFixed(2)} • {settings.consultation_duration} minutos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-stone-600 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Orientação espiritual personalizada com Exús</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Limpeza energética e proteção espiritual</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Abertura de caminhos e desobstrução</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Trabalhos específicos conforme necessidade</span>
                  </li>
                </ul>
                <Button asChild className="w-full bg-red-700 hover:bg-red-800">
                  <Link href="/agendamento">
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar Consulta
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl text-amber-800">
                  <Star className="mr-3 h-6 w-6" />
                  Rituais de Kimbanda
                </CardTitle>
                <CardDescription className="text-lg">
                  Quartas e Sábados • 20h no templo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-stone-600 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Trabalhos coletivos com Exús e Pombagiras</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Passes de limpeza e energização</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Desenvolvimento mediúnico</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Comunidade espiritual acolhedora</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full border-amber-600 text-amber-700 hover:bg-amber-50">
                  <Link href="/trabalhos">
                    <Star className="mr-2 h-4 w-4" />
                    Conhecer Rituais
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Nossa Equipe */}
      <section className="py-20 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Nossa Equipe Espiritual
            </h2>
            <p className="text-xl text-stone-600">
              Médiuns experientes dedicados ao seu bem-estar espiritual
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Pai João</h3>
                <p className="text-stone-600 mb-4">Dirigente do Templo</p>
                <div className="space-y-2 text-sm text-stone-500">
                  <div className="flex items-center justify-center">
                    <Award className="h-4 w-4 mr-2" />
                    <span>25 anos de experiência</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Star className="h-4 w-4 mr-2" />
                    <span>Especialista em Exú Tranca Rua</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Mãe Maria</h3>
                <p className="text-stone-600 mb-4">Médium Sênior</p>
                <div className="space-y-2 text-sm text-stone-500">
                  <div className="flex items-center justify-center">
                    <Award className="h-4 w-4 mr-2" />
                    <span>18 anos de experiência</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Star className="h-4 w-4 mr-2" />
                    <span>Especialista em Maria Padilha</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Equipe de Cambonos</h3>
                <p className="text-stone-600 mb-4">Assistentes Espirituais</p>
                <div className="space-y-2 text-sm text-stone-500">
                  <div className="flex items-center justify-center">
                    <Award className="h-4 w-4 mr-2" />
                    <span>Formação tradicional</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Star className="h-4 w-4 mr-2" />
                    <span>Apoio nos rituais</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Como Chegar */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">
                Visite Nosso Templo
              </h2>
              <p className="text-lg text-stone-600 mb-8">
                Estamos localizados em São Paulo e recebemos visitantes e consulentes 
                com horário marcado. O endereço completo é fornecido após o agendamento 
                por questões de segurança e privacidade.
              </p>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5 text-red-700" />
                      Localização
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-stone-600">
                      São Paulo - SP<br />
                      (Endereço fornecido após agendamento)
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-red-700" />
                      Horários de Funcionamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Segunda a Sexta:</span>
                        <span className="font-medium">14h às 18h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sábados:</span>
                        <span className="font-medium">14h às 20h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Domingos:</span>
                        <span className="text-red-600 font-medium">Fechado</span>
                      </div>
                      <div className="border-t pt-2 mt-3">
                        <div className="flex justify-between">
                          <span>Rituais:</span>
                          <span className="font-medium">Quartas e Sábados - 20h</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Phone className="mr-2 h-5 w-5 text-red-700" />
                      Como Chegar
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-stone-600">
                        <strong>Transporte Público:</strong> Próximo ao metrô e linhas de ônibus
                      </p>
                      <p className="text-stone-600">
                        <strong>Estacionamento:</strong> Vagas disponíveis na rua
                      </p>
                      <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                        <a 
                          href={`https://wa.me/55${settings.contact_phone.replace(/\D/g, '')}?text=Olá! Gostaria de saber o endereço do Templo Dragão Negro para minha consulta.`}
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Solicitar Endereço
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-amber-50 to-red-50 border-amber-200">
                <CardHeader>
                  <CardTitle className="text-amber-900">Primeira Visita?</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-amber-800">
                      Se é sua primeira vez no templo, aqui estão algumas orientações importantes:
                    </p>
                    <ul className="space-y-2 text-sm text-amber-700">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Chegue 10 minutos antes do horário agendado</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Use roupas claras ou brancas preferencialmente</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Traga sua pergunta ou questão bem definida</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span>Mantenha mente aberta e coração receptivo</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5 text-red-700" />
                    Saiba Mais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href="/trabalhos">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Trabalhos Espirituais
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
                        <Phone className="mr-2 h-4 w-4" />
                        Entre em Contato
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}