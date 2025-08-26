'use client';

import { useState, useEffect } from 'react';
import { settingsService, SiteSettings } from '@/lib/settings-service';
import { 
  Calendar, 
  Heart, 
  Star, 
  BookOpen, 
  Shield, 
  Phone, 
  MapPin, 
  Clock,
  CheckCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'Templo de Kimbanda Dragão Negro',
    contact_email: 'contato@dragaonegro.com.br',
    contact_phone: '(11) 99999-9999',
    whatsapp_number: '5511999999999',
    consultation_price: 120.00,
    consultation_duration: 30,
    address: 'São Paulo - SP'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const siteSettings = await settingsService.getPublicSettings();
      setSettings(siteSettings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleQuickContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setLoading(true);
    try {
      // Registrar interesse no CRM
      await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'interesse',
          data: { email },
          consents: { marketing: true, data_processing: true }
        })
      });
      
      alert('Obrigado! Entraremos em contato em breve.');
      setEmail('');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao enviar. Tente pelo WhatsApp.');
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
              {settings.site_name.split(' ').slice(0, 3).join(' ')}<br />
              <span className="text-amber-400">Dragão Negro</span>
            </h1>
            <p className="text-xl md:text-2xl text-stone-200 mb-8 max-w-3xl mx-auto">
              Consultas espirituais com Exús, trabalhos de Kimbanda e tradições ancestrais 
              para proteção, cura e orientação espiritual.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
              <Button asChild size="lg" className="bg-red-700 hover:bg-red-800 text-lg px-8 py-4">
                <Link href="/agendamento">
                  <Calendar className="mr-2 h-5 w-5" />
                  Agendar Consulta - R$ {settings.consultation_price.toFixed(2)}
                </Link>
              </Button>
              <form onSubmit={handleQuickContact} className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Seu e-mail para contato"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/30 text-white placeholder:text-white/70"
                />
                <Button 
                  type="submit" 
                  variant="outline" 
                  className="border-white/30 text-white hover:bg-white/10"
                  disabled={loading}
                >
                  {loading ? 'Enviando...' : 'Enviar'}
                </Button>
              </form>
            </div>
            <div className="flex items-center justify-center space-x-6 text-stone-300">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span>Consultas presenciais</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span>Tradição autêntica</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span>Mais de 20 anos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços Section */}
      <section className="py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Nossos Serviços Espirituais
            </h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              Conecte-se com a sabedoria ancestral dos Exús e Pombagiras através de 
              consultas autênticas e trabalhos espirituais tradicionais.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Consulta com Exú */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-red-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-red-800">Consulta com Exú</CardTitle>
                <CardDescription className="text-lg">
                  <span className="font-bold text-red-600">R$ {settings.consultation_price.toFixed(2)}</span> • {settings.consultation_duration} minutos de duração
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-stone-600 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Orientação espiritual personalizada</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Limpeza energética e proteção</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Abertura de caminhos</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Trabalhos específicos conforme necessidade</span>
                  </li>
                </ul>
                <Button asChild className="w-full bg-red-700 hover:bg-red-800">
                  <Link href="/agendamento">
                    <Calendar className="mr-2 h-4 w-4" />
                    Agendar Agora
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Rituais de Kimbanda */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-amber-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="text-2xl text-amber-800">Rituais de Kimbanda</CardTitle>
                <CardDescription className="text-lg">
                  <span className="font-bold text-amber-600">Quartas e Sábados</span> • 20h no templo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-stone-600 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Trabalhos coletivos com Exús</span>
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
                  <Link href="/rituais">
                    <Star className="mr-2 h-4 w-4" />
                    Saber Mais
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Loja Ritualística */}
            <Card className="hover:shadow-xl transition-shadow duration-300 border-purple-200">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-2xl text-purple-800">Loja Ritualística</CardTitle>
                <CardDescription className="text-lg">
                  <span className="font-bold text-purple-600">Produtos Consagrados</span> no templo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-stone-600 mb-6">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Velas ritualísticas de 7 dias</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Incensos naturais e defumadores</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Imagens de Exús e Pombagiras</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Elementos ritualísticos diversos</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full border-purple-600 text-purple-700 hover:bg-purple-50">
                  <Link href="/loja">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Ver Produtos
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sobre o Templo */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">
                Tradição Autêntica de Kimbanda
              </h2>
              <p className="text-lg text-stone-600 mb-6">
                Há mais de 20 anos dedicados à prática tradicional da Kimbanda, 
                oferecemos consultas espirituais autênticas com Exús e Pombagiras, 
                mantendo viva a sabedoria ancestral africana.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center">
                  <Sparkles className="h-6 w-6 text-amber-500 mr-3" />
                  <span className="text-stone-700">Consultas presenciais no templo</span>
                </div>
                <div className="flex items-center">
                  <Sparkles className="h-6 w-6 text-amber-500 mr-3" />
                  <span className="text-stone-700">Trabalhos espirituais personalizados</span>
                </div>
                <div className="flex items-center">
                  <Sparkles className="h-6 w-6 text-amber-500 mr-3" />
                  <span className="text-stone-700">Rituais tradicionais de Kimbanda</span>
                </div>
              </div>
              <Button asChild size="lg" className="bg-stone-900 hover:bg-stone-800">
                <Link href="/sobre">
                  Conhecer Nossa História
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
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

      {/* Informações de Contato */}
      <section className="py-20 bg-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Visite Nosso Templo
            </h2>
            <p className="text-xl text-stone-600">
              Estamos prontos para recebê-lo com respeito e dedicação
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-stone-900 mb-2">Localização</h3>
                <p className="text-stone-600">
                  {settings.address}<br />
                  (Endereço fornecido após agendamento)
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold text-stone-900 mb-2">Horários</h3>
                <p className="text-stone-600">
                  Segunda a Sexta: 14h às 18h<br />
                  Sábados: 14h às 20h
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-bold text-stone-900 mb-2">Contato</h3>
                <div className="space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <a 
                      href={`https://wa.me/${settings.whatsapp_number}?text=Olá! Gostaria de agendar uma consulta no Templo Dragão Negro.`}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      {settings.contact_phone}
                    </a>
                  </Button>
                  <p className="text-sm text-stone-500">{settings.contact_email}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}