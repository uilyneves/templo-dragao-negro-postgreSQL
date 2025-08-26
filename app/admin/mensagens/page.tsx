'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Search, 
  Filter,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Trash2,
  Users,
  Calendar
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
import { supabaseBrowser } from '@/lib/supabase-browser';

interface Message {
  id: string;
  recipient_name: string;
  recipient_email?: string;
  recipient_phone?: string;
  type: 'whatsapp' | 'email' | 'sms';
  subject?: string;
  content: string;
  status: 'pending' | 'sending' | 'sent' | 'delivered' | 'failed';
  scheduled_for?: string;
  sent_at?: string;
  error_message?: string;
  created_at: string;
}

interface MessageTemplate {
  id: string;
  name: string;
  type: 'whatsapp' | 'email' | 'sms';
  subject?: string;
  content: string;
  variables: string[];
  is_active: boolean;
}

export default function MensagensPage() {
  const [activeTab, setActiveTab] = useState('messages');
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [messageForm, setMessageForm] = useState({
    recipient_name: '',
    recipient_email: '',
    recipient_phone: '',
    type: 'whatsapp' as 'whatsapp' | 'email' | 'sms',
    subject: '',
    content: '',
    scheduled_for: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      if (!supabaseBrowser) throw new Error('Supabase não configurado');

      const [messagesResult, templatesResult] = await Promise.all([
        supabaseBrowser
          .from('messages')
          .select('*')
          .order('created_at', { ascending: false }),
        supabaseBrowser
          .from('message_templates')
          .select('*')
          .order('name')
      ]);

      setMessages(messagesResult.data || []);
      setTemplates(templatesResult.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessages([]);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageForm.recipient_name.trim() || !messageForm.content.trim()) {
      alert('Nome do destinatário e conteúdo são obrigatórios');
      return;
    }

    if (messageForm.type === 'email' && !messageForm.recipient_email) {
      alert('Email é obrigatório para mensagens de email');
      return;
    }

    if (messageForm.type === 'whatsapp' && !messageForm.recipient_phone) {
      alert('Telefone é obrigatório para mensagens do WhatsApp');
      return;
    }

    setActionLoading(true);
    try {
      if (!supabaseBrowser) throw new Error('Supabase não configurado');

      const { error } = await supabaseBrowser
        .from('messages')
        .insert({
          ...messageForm,
          scheduled_for: messageForm.scheduled_for || new Date().toISOString(),
          status: 'pending'
        });

      if (error) throw error;

      setShowSendDialog(false);
      setMessageForm({
        recipient_name: '',
        recipient_email: '',
        recipient_phone: '',
        type: 'whatsapp',
        subject: '',
        content: '',
        scheduled_for: ''
      });
      
      await loadData();
      alert('Mensagem enviada para a fila com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      alert('Erro ao enviar mensagem: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta mensagem?')) return;
    
    setActionLoading(true);
    try {
      if (!supabaseBrowser) throw new Error('Supabase não configurado');

      const { error } = await supabaseBrowser
        .from('messages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadData();
      alert('Mensagem excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      alert('Erro ao deletar mensagem: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setActionLoading(false);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    const matchesType = typeFilter === 'all' || message.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'sending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'Enviada';
      case 'delivered': return 'Entregue';
      case 'failed': return 'Falhou';
      case 'sending': return 'Enviando';
      default: return 'Pendente';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'whatsapp': return 'bg-green-100 text-green-800';
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'sms': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'whatsapp': return 'WhatsApp';
      case 'email': return 'E-mail';
      case 'sms': return 'SMS';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando mensagens...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sistema de Mensagens</h2>
            <p className="text-gray-600">Gerencie mensagens WhatsApp, email e SMS</p>
          </div>
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
        </div>

        {/* SEÇÃO MENSAGENS */}
        <TabsContent value="messages" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar mensagens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="sent">Enviadas</SelectItem>
                  <SelectItem value="delivered">Entregues</SelectItem>
                  <SelectItem value="failed">Falharam</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
              <DialogTrigger asChild>
                <Button className="bg-red-700 hover:bg-red-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Nova Mensagem
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Enviar Nova Mensagem</DialogTitle>
                  <DialogDescription>
                    Envie mensagem via WhatsApp, email ou SMS
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipient-name">Nome do Destinatário *</Label>
                      <Input
                        id="recipient-name"
                        value={messageForm.recipient_name}
                        onChange={(e) => setMessageForm({...messageForm, recipient_name: e.target.value})}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Tipo de Mensagem *</Label>
                      <Select value={messageForm.type} onValueChange={(value: 'whatsapp' | 'email' | 'sms') => setMessageForm({...messageForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipient-email">E-mail</Label>
                      <Input
                        id="recipient-email"
                        type="email"
                        value={messageForm.recipient_email}
                        onChange={(e) => setMessageForm({...messageForm, recipient_email: e.target.value})}
                        placeholder="email@exemplo.com"
                        required={messageForm.type === 'email'}
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipient-phone">Telefone/WhatsApp</Label>
                      <Input
                        id="recipient-phone"
                        value={messageForm.recipient_phone}
                        onChange={(e) => setMessageForm({...messageForm, recipient_phone: e.target.value})}
                        placeholder="(11) 99999-9999"
                        required={messageForm.type === 'whatsapp' || messageForm.type === 'sms'}
                      />
                    </div>
                  </div>

                  {messageForm.type === 'email' && (
                    <div>
                      <Label htmlFor="subject">Assunto</Label>
                      <Input
                        id="subject"
                        value={messageForm.subject}
                        onChange={(e) => setMessageForm({...messageForm, subject: e.target.value})}
                        placeholder="Assunto da mensagem"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="content">Conteúdo da Mensagem *</Label>
                    <Textarea
                      id="content"
                      value={messageForm.content}
                      onChange={(e) => setMessageForm({...messageForm, content: e.target.value})}
                      placeholder="Digite sua mensagem..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="scheduled-for">Agendar Para (Opcional)</Label>
                    <Input
                      id="scheduled-for"
                      type="datetime-local"
                      value={messageForm.scheduled_for}
                      onChange={(e) => setMessageForm({...messageForm, scheduled_for: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex space-x-2 mt-6">
                  <Button 
                    onClick={handleSendMessage} 
                    className="bg-red-700 hover:bg-red-800"
                    disabled={actionLoading}
                  >
                    <Send className="mr-2 h-4 w-4" />
                    {actionLoading ? 'Enviando...' : 'Enviar Mensagem'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                    Cancelar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Mensagens</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{messages.length}</div>
                <p className="text-xs text-gray-500">Mensagens enviadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Entregues</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {messages.filter(m => m.status === 'delivered' || m.status === 'sent').length}
                </div>
                <p className="text-xs text-gray-500">Com sucesso</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {messages.filter(m => m.status === 'pending').length}
                </div>
                <p className="text-xs text-gray-500">Na fila</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Falharam</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {messages.filter(m => m.status === 'failed').length}
                </div>
                <p className="text-xs text-gray-500">Com erro</p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Mensagens */}
          <Card>
            <CardHeader>
              <CardTitle>Fila de Mensagens</CardTitle>
              <CardDescription>
                Todas as mensagens enviadas e agendadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredMessages.map((message) => (
                  <div key={message.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        message.type === 'whatsapp' ? 'bg-green-100' :
                        message.type === 'email' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {message.type === 'whatsapp' ? (
                          <Phone className="h-5 w-5 text-green-600" />
                        ) : message.type === 'email' ? (
                          <Mail className="h-5 w-5 text-blue-600" />
                        ) : (
                          <MessageSquare className="h-5 w-5 text-purple-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{message.recipient_name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(message.created_at).toLocaleDateString('pt-BR')}
                          </div>
                          {message.recipient_email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {message.recipient_email}
                            </div>
                          )}
                          {message.recipient_phone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {message.recipient_phone}
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 truncate max-w-md">
                          {message.content}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getStatusColor(message.status)}>
                          {getStatusText(message.status)}
                        </Badge>
                        <div className="mt-1">
                          <Badge className={getTypeColor(message.type)} variant="outline">
                            {getTypeText(message.type)}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteMessage(message.id)}
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

              {filteredMessages.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhuma mensagem encontrada
                  </h3>
                  <p className="text-gray-500">
                    {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece enviando uma nova mensagem'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEÇÃO TEMPLATES */}
        <TabsContent value="templates" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Templates de Mensagem</h3>
              <p className="text-gray-600">Modelos pré-definidos para diferentes situações</p>
            </div>
            <Button className="bg-red-700 hover:bg-red-800">
              <Plus className="mr-2 h-4 w-4" />
              Novo Template
            </Button>
          </div>

          {/* Lista de Templates */}
          <div className="grid md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getTypeColor(template.type)}>
                          {getTypeText(template.type)}
                        </Badge>
                        <Badge className={template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {template.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {template.subject && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Assunto:</p>
                        <p className="text-sm text-gray-600">{template.subject}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700">Conteúdo:</p>
                      <p className="text-sm text-gray-600 line-clamp-3">{template.content}</p>
                    </div>
                    {template.variables.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Variáveis:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.variables.map((variable, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum template encontrado
              </h3>
              <p className="text-gray-500">
                Comece criando um template para automatizar suas mensagens
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}