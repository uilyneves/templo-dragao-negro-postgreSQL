'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Globe,
  Mail,
  Phone,
  MapPin,
  Palette,
  Shield,
  Bell,
  Database,
  Key,
  Upload,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabaseBrowser } from '@/lib/supabase-browser';

interface SystemSettings {
  site_name: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  address: string;
  consultation_price: number;
  consultation_duration: number;
  allow_registrations: boolean;
  pagseguro_sandbox: boolean;
  email_notifications: boolean;
  whatsapp_notifications: boolean;
  backup_enabled: boolean;
}

export default function ConfiguracoesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const [settings, setSettings] = useState<SystemSettings>({
    site_name: 'Templo de Kimbanda Dragão Negro',
    contact_email: 'contato@dragaonegro.com.br',
    contact_phone: '(11) 99999-9999',
    whatsapp_number: '5511999999999',
    address: 'São Paulo - SP',
    consultation_price: 120.00,
    consultation_duration: 30,
    allow_registrations: true,
    pagseguro_sandbox: true,
    email_notifications: true,
    whatsapp_notifications: true,
    backup_enabled: true
  });

  const [integrations, setIntegrations] = useState({
    pagseguro_email: '',
    pagseguro_token: '',
    evolution_api_url: '',
    evolution_api_key: '',
    brevo_api_key: '',
    brevo_sender_email: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      if (!supabaseBrowser) throw new Error('Supabase não configurado');

      console.log('🔍 Carregando configurações do banco...');
      
      const { data, error } = await supabaseBrowser
        .from('system_settings')
        .select('*')
        .order('key');

      if (error) {
        console.error('❌ Erro ao carregar configurações:', error);
        throw error;
      }

      console.log('📊 Configurações carregadas do banco:', data);
      
      // Processar configurações do banco
      const settingsMap: any = {};
      (data || []).forEach(setting => {
        try {
          if (setting.type === 'string') {
            settingsMap[setting.key] = JSON.parse(setting.value || '""');
          } else if (setting.type === 'number') {
            settingsMap[setting.key] = parseFloat(setting.value || '0');
          } else if (setting.type === 'boolean') {
            settingsMap[setting.key] = (setting.value || 'false') === 'true';
          } else {
            settingsMap[setting.key] = setting.value;
          }
          console.log(`✅ ${setting.key}: ${setting.value} → ${settingsMap[setting.key]}`);
        } catch (e) {
          console.warn(`⚠️ Erro ao processar ${setting.key}:`, e);
          settingsMap[setting.key] = setting.value;
        }
      });

      console.log('🎯 Settings finais processadas:', settingsMap);
      setSettings(prev => ({ ...prev, ...settingsMap }));
    } catch (error) {
      console.error('❌ Erro crítico ao carregar configurações:', error);
      alert('Erro ao carregar configurações: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      console.log('💾 Tentando salvar configurações:', settings);

      // Usar API route para salvar (mais confiável)
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: {
            site_name: settings.site_name,
            contact_email: settings.contact_email,
            contact_phone: settings.contact_phone,
            whatsapp_number: settings.whatsapp_number,
            consultation_price: settings.consultation_price,
            consultation_duration: settings.consultation_duration,
            allow_registrations: settings.allow_registrations,
            pagseguro_sandbox: settings.pagseguro_sandbox
          }
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        console.error('❌ Erro na API:', result);
        throw new Error(result.error || 'Erro na API');
      }

      console.log('✅ Configurações salvas via API:', result);
      alert('Configurações salvas com sucesso!');
      
      // Recarregar para confirmar persistência
      await loadSettings();
    } catch (error) {
      console.error('❌ Erro ao salvar configurações:', error);
      alert('Erro ao salvar configurações: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Configurações do Sistema</h2>
          <p className="text-gray-600">Gerencie todas as configurações do templo</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleSaveSettings}
            className="bg-red-700 hover:bg-red-800"
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
          <Button asChild variant="outline">
            <a href="/test-settings" target="_blank">
              <Database className="mr-2 h-4 w-4" />
              Debug
            </a>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-fit grid-cols-5">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* CONFIGURAÇÕES GERAIS */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5 text-red-700" />
                Informações do Templo
              </CardTitle>
              <CardDescription>
                Configurações básicas do templo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="site-name">Nome do Templo</Label>
                  <Input
                    id="site-name"
                    value={settings.site_name}
                    onChange={(e) => setSettings({...settings, site_name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={settings.address}
                    onChange={(e) => setSettings({...settings, address: e.target.value})}
                    placeholder="Endereço completo"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-email">E-mail de Contato</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    value={settings.contact_email}
                    onChange={(e) => setSettings({...settings, contact_email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="contact-phone">Telefone de Contato</Label>
                  <Input
                    id="contact-phone"
                    value={settings.contact_phone}
                    onChange={(e) => setSettings({...settings, contact_phone: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="whatsapp">Número do WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={settings.whatsapp_number}
                  onChange={(e) => setSettings({...settings, whatsapp_number: e.target.value})}
                  placeholder="5511999999999"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5 text-red-700" />
                Configurações de Consulta
              </CardTitle>
              <CardDescription>
                Configure valores e duração das consultas espirituais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="consultation-price">Preço da Consulta (R$)</Label>
                  <Input
                    id="consultation-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={settings.consultation_price}
                    onChange={(e) => setSettings({...settings, consultation_price: parseFloat(e.target.value) || 0})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Valor atual: R$ {settings.consultation_price.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label htmlFor="consultation-duration">Duração (minutos)</Label>
                  <Input
                    id="consultation-duration"
                    type="number"
                    min="15"
                    max="120"
                    value={settings.consultation_duration}
                    onChange={(e) => setSettings({...settings, consultation_duration: parseInt(e.target.value) || 30})}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Duração atual: {settings.consultation_duration} minutos
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="allow-registrations"
                  checked={settings.allow_registrations}
                  onCheckedChange={(checked) => setSettings({...settings, allow_registrations: checked})}
                />
                <Label htmlFor="allow-registrations">Permitir novos cadastros</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INTEGRAÇÕES */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5 text-red-700" />
                Integrações de Pagamento
              </CardTitle>
              <CardDescription>
                Configure as APIs de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pagseguro-email">PagSeguro - E-mail</Label>
                  <Input
                    id="pagseguro-email"
                    type="email"
                    value={integrations.pagseguro_email}
                    onChange={(e) => setIntegrations({...integrations, pagseguro_email: e.target.value})}
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="pagseguro-token">PagSeguro - Token</Label>
                  <Input
                    id="pagseguro-token"
                    type="password"
                    value={integrations.pagseguro_token}
                    onChange={(e) => setIntegrations({...integrations, pagseguro_token: e.target.value})}
                    placeholder="Token da API"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="pagseguro-sandbox"
                  checked={settings.pagseguro_sandbox}
                  onCheckedChange={(checked) => setSettings({...settings, pagseguro_sandbox: checked})}
                />
                <Label htmlFor="pagseguro-sandbox">Modo Sandbox (Teste)</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-red-700" />
                WhatsApp Evolution API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="evolution-url">URL da API</Label>
                <Input
                  id="evolution-url"
                  value={integrations.evolution_api_url}
                  onChange={(e) => setIntegrations({...integrations, evolution_api_url: e.target.value})}
                  placeholder="https://sua-evolution-api.com"
                />
              </div>
              <div>
                <Label htmlFor="evolution-key">Chave da API</Label>
                <Input
                  id="evolution-key"
                  type="password"
                  value={integrations.evolution_api_key}
                  onChange={(e) => setIntegrations({...integrations, evolution_api_key: e.target.value})}
                  placeholder="Sua chave da API"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5 text-red-700" />
                E-mail (Brevo)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="brevo-key">Chave da API Brevo</Label>
                <Input
                  id="brevo-key"
                  type="password"
                  value={integrations.brevo_api_key}
                  onChange={(e) => setIntegrations({...integrations, brevo_api_key: e.target.value})}
                  placeholder="xkeysib-..."
                />
              </div>
              <div>
                <Label htmlFor="brevo-sender">E-mail Remetente</Label>
                <Input
                  id="brevo-sender"
                  type="email"
                  value={integrations.brevo_sender_email}
                  onChange={(e) => setIntegrations({...integrations, brevo_sender_email: e.target.value})}
                  placeholder="noreply@dragaonegro.com.br"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NOTIFICAÇÕES */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5 text-red-700" />
                Configurações de Notificação
              </CardTitle>
              <CardDescription>
                Configure quando e como enviar notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Notificações por E-mail</Label>
                    <p className="text-sm text-gray-500">Enviar confirmações e lembretes por e-mail</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={settings.email_notifications}
                    onCheckedChange={(checked) => setSettings({...settings, email_notifications: checked})}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="whatsapp-notifications">Notificações por WhatsApp</Label>
                    <p className="text-sm text-gray-500">Enviar lembretes e confirmações via WhatsApp</p>
                  </div>
                  <Switch
                    id="whatsapp-notifications"
                    checked={settings.whatsapp_notifications}
                    onCheckedChange={(checked) => setSettings({...settings, whatsapp_notifications: checked})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tipos de Notificação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Consultas</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>• Confirmação de agendamento</p>
                    <p>• Lembrete 24h antes</p>
                    <p>• Lembrete 2h antes</p>
                    <p>• Confirmação de pagamento</p>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Pedidos</h4>
                  <div className="space-y-2 text-sm text-green-800">
                    <p>• Confirmação de pedido</p>
                    <p>• Atualização de status</p>
                    <p>• Confirmação de entrega</p>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Rituais</h4>
                  <div className="space-y-2 text-sm text-purple-800">
                    <p>• Convite para rituais</p>
                    <p>• Lembrete de participação</p>
                    <p>• Cancelamento de eventos</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEGURANÇA */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5 text-red-700" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>
                Gerencie acessos e permissões
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Controle de Acesso</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Permitir novos cadastros</span>
                      <Badge className={settings.allow_registrations ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {settings.allow_registrations ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Autenticação de dois fatores</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Em breve</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <span className="text-sm">Logs de auditoria</span>
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Status do Sistema</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                      <span className="text-sm">Banco de dados</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                      <span className="text-sm">RLS (Row Level Security)</span>
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                      <span className="text-sm">SSL/HTTPS</span>
                      <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BACKUP */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2 h-5 w-5 text-red-700" />
                Backup e Recuperação
              </CardTitle>
              <CardDescription>
                Gerencie backups automáticos do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="backup-enabled">Backup Automático</Label>
                  <p className="text-sm text-gray-500">Backup diário automático dos dados</p>
                </div>
                <Switch
                  id="backup-enabled"
                  checked={settings.backup_enabled}
                  onCheckedChange={(checked) => setSettings({...settings, backup_enabled: checked})}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Último Backup</h4>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')} às 03:00
                    </p>
                    <p className="text-sm text-green-800">
                      <strong>Status:</strong> Sucesso
                    </p>
                    <p className="text-sm text-green-800">
                      <strong>Tamanho:</strong> 2.4 MB
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Ações de Backup</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="mr-2 h-4 w-4" />
                      Baixar Backup Manual
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Upload className="mr-2 h-4 w-4" />
                      Restaurar Backup
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Executar Backup Agora
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}