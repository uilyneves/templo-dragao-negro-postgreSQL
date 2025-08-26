'use client';

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Heart,
  CheckCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PublicHeader from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { settingsService } from '@/lib/settings-service';

interface AvailableSlot {
  date: string;
  time: string;
  available: boolean;
}

export default function AgendamentoPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [consultationPrice, setConsultationPrice] = useState(120.00);
  const [consultationDuration, setConsultationDuration] = useState(30);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    question: '',
    exu_preference: '',
    payment_method: 'pix'
  });

  useEffect(() => {
    loadAvailableSlots();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await settingsService.getPublicSettings();
      setConsultationPrice(settings.consultation_price);
      setConsultationDuration(settings.consultation_duration);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      if (!supabaseBrowser) {
        // Gerar slots de exemplo se Supabase não estiver configurado
        const slots: AvailableSlot[] = [];
        for (let i = 1; i <= 14; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          
          // Pular domingos e segundas
          if (date.getDay() === 0 || date.getDay() === 1) continue;
          
          const dateStr = date.toISOString().split('T')[0];
          ['14:00', '15:00', '16:00', '17:00'].forEach(time => {
            slots.push({
              date: dateStr,
              time,
              available: Math.random() > 0.3 // 70% de chance de estar disponível
            });
          });
        }
        setAvailableSlots(slots);
        return;
      }

      const { data, error } = await supabaseBrowser
        .from('availability')
        .select('date, time, is_available')
        .eq('is_available', true)
        .gte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) {
        console.error('Erro ao carregar horários:', error);
        setAvailableSlots([]);
      } else {
        setAvailableSlots(data?.map(slot => ({
          date: slot.date,
          time: slot.time,
          available: slot.is_available
        })) || []);
      }
    } catch (error) {
      console.error('Erro ao carregar horários:', error);
      setAvailableSlots([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.date || !formData.time) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      // Simular agendamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStep(3); // Ir para confirmação
      
      // Registrar no CRM se possível
      try {
        await fetch('/api/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'consulta',
            data: formData,
            consents: { marketing: true, data_processing: true }
          })
        });
      } catch (error) {
        console.error('Erro ao registrar no CRM:', error);
      }
    } catch (error) {
      console.error('Erro no agendamento:', error);
      alert('Erro ao agendar. Tente pelo WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      weekday: 'long',
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
              <Calendar className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Agendar Consulta
            </h1>
            <p className="text-xl md:text-2xl text-stone-200 mb-8 max-w-3xl mx-auto">
              Consulta espiritual com Exú • R$ {consultationPrice.toFixed(2)} • {consultationDuration} minutos
            </p>
          </div>
        </div>
      </section>

      {/* Formulário de Agendamento */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-red-700" />
                  Seus Dados
                </CardTitle>
                <CardDescription>
                  Preencha seus dados para agendarmos sua consulta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="question">Motivo da Consulta</Label>
                    <Textarea
                      id="question"
                      value={formData.question}
                      onChange={(e) => setFormData({...formData, question: e.target.value})}
                      placeholder="Descreva brevemente o motivo da sua consulta..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="exu">Exú de Preferência (Opcional)</Label>
                    <Select value={formData.exu_preference} onValueChange={(value) => setFormData({...formData, exu_preference: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Deixar o médium escolher" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Deixar o médium escolher</SelectItem>
                        <SelectItem value="Exú Tranca Rua">Exú Tranca Rua</SelectItem>
                        <SelectItem value="Exú Caveira">Exú Caveira</SelectItem>
                        <SelectItem value="Maria Padilha">Maria Padilha</SelectItem>
                        <SelectItem value="Pombagira Rainha">Pombagira Rainha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full bg-red-700 hover:bg-red-800">
                    Continuar para Horários
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-red-700" />
                  Escolher Data e Horário
                </CardTitle>
                <CardDescription>
                  Selecione o melhor horário para sua consulta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {availableSlots.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                      <p className="text-stone-600 mb-4">
                        Não há horários disponíveis no momento ou o sistema não está configurado.
                      </p>
                      <Button asChild variant="outline">
                        <a 
                          href="https://wa.me/5511999999999?text=Olá! Gostaria de agendar uma consulta no Templo Dragão Negro." 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Agendar via WhatsApp
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {[...new Set(availableSlots.map(slot => slot.date))].slice(0, 14).map(date => (
                        <div key={date} className="space-y-2">
                          <h4 className="font-medium text-stone-900">
                            {formatDate(date)}
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {availableSlots
                              .filter(slot => slot.date === date && slot.available)
                              .map(slot => (
                                <Button
                                  key={`${slot.date}-${slot.time}`}
                                  variant={formData.date === slot.date && formData.time === slot.time ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setFormData({...formData, date: slot.date, time: slot.time})}
                                  className={formData.date === slot.date && formData.time === slot.time ? "bg-red-700 hover:bg-red-800" : ""}
                                >
                                  {slot.time}
                                </Button>
                              ))
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.date && formData.time && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <div>
                          <p className="font-medium text-green-800">
                            Horário Selecionado
                          </p>
                          <p className="text-green-600">
                            {formatDate(formData.date)} às {formData.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Voltar
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={!formData.date || !formData.time || loading}
                      className="flex-1 bg-red-700 hover:bg-red-800"
                    >
                      {loading ? 'Agendando...' : 'Confirmar Agendamento'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-800">
                  Consulta Agendada com Sucesso!
                </CardTitle>
                <CardDescription className="text-green-600">
                  Sua consulta foi registrada e entraremos em contato para confirmação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white border border-green-200 rounded-lg p-4">
                  <h4 className="font-bold text-green-800 mb-3">Detalhes da Consulta:</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nome:</strong> {formData.name}</p>
                    <p><strong>Data:</strong> {formatDate(formData.date)}</p>
                    <p><strong>Horário:</strong> {formData.time}</p>
                    <p><strong>Valor:</strong> R$ {consultationPrice.toFixed(2)}</p>
                    <p><strong>Duração:</strong> {consultationDuration} minutos</p>
                    {formData.exu_preference && (
                      <p><strong>Exú:</strong> {formData.exu_preference}</p>
                    )}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-bold text-amber-800 mb-2">Próximos Passos:</h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Entraremos em contato em até 2 horas</li>
                    <li>• Confirmaremos o horário via WhatsApp</li>
                    <li>• Enviaremos o endereço do templo</li>
                    <li>• Orientações sobre o que levar</li>
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <Button asChild variant="outline" className="flex-1">
                    <a 
                      href="https://wa.me/5511999999999?text=Olá! Acabei de agendar uma consulta pelo site." 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Falar no WhatsApp
                    </a>
                  </Button>
                  <Button asChild className="flex-1 bg-red-700 hover:bg-red-800">
                    <a href="/">
                      Voltar ao Site
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}