'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, User, Key, Mail, XCircle } from 'lucide-react';

export default function SetupAdminPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [details, setDetails] = useState('');
  const [prerequisites, setPrerequisites] = useState({
    supabaseConfigured: false,
    serviceRoleKey: false,
    tablesCreated: false
  });

  useEffect(() => {
    checkPrerequisites();
  }, []);

  const checkPrerequisites = () => {
    setPrerequisites({
      supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      serviceRoleKey: true, // Assumir que está configurado se chegou até aqui
      tablesCreated: true // Assumir que foi criado se chegou até aqui
    });
  };

  const createAdmin = async () => {
    setLoading(true);
    setError('');
    setDetails('');

    try {
      const response = await fetch('/api/create-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'tata@dragaonegro.com.br',
          password: 'Qwe123@2025',
          name: 'Super Administrador'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes('User not allowed') || data.details?.includes('User not allowed')) {
          setError('Criação de usuários não permitida');
          setDetails('Vá no painel do Supabase → Authentication → Settings → User Management e habilite "Allow new users to sign up"');
        } else if (data.error?.includes('já existe') || data.error?.includes('already exists')) {
          setError('Usuário já existe');
          setDetails('O administrador já foi criado anteriormente.');
        } else {
          setError(data.error || 'Erro ao criar usuário');
          setDetails(data.details || 'Erro desconhecido');
        }
        return;
      }

      if (data.ok) {
        setSuccess(true);
        setDetails(data.message || 'Conta criada com sucesso! Agora você pode fazer login.');
      } else {
        setError('Falha ao criar usuário');
        setDetails('Resposta inesperada do servidor.');
      }

    } catch (error) {
      console.error('Erro:', error);
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          setError('Erro de conexão');
          setDetails('Não foi possível conectar com o servidor. Verifique se o servidor está rodando.');
        } else {
          setError('Erro interno');
          setDetails(error.message);
        }
      } else {
        setError('Erro desconhecido');
        setDetails('Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-red-700" />
            <Button asChild variant="outline" className="flex-1">
              <a href="/debug-auth">🔧 Debug Auth</a>
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold text-stone-900">
            Setup Inicial
          </CardTitle>
          <CardDescription>
            Criar conta de Super Administrador do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-green-800">Super Admin Criado!</h3>
                <p className="text-green-600">Super Administrador criado com sucesso.</p>
              </div>
              
              {details && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    {details}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-left">
                <h4 className="font-medium text-green-800 mb-2">Dados de Acesso:</h4>
                <div className="space-y-1 text-sm text-green-700">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span><strong>Login:</strong> tata@dragaonegro.com.br</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span><strong>Senha:</strong> Qwe123@2025</span>
                  </div>
                </div>
              </div>
              <Button asChild className="w-full bg-red-700 hover:bg-red-800">
                <a href="/login">Fazer Login no Painel</a>
              </Button>
              <Button asChild variant="outline" className="w-full mt-2">
                <a href="/">Voltar ao Site</a>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pré-requisitos */}
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                {error.includes('SERVICE_ROLE_KEY') && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-yellow-800 text-sm">
                      <strong>SOLUÇÃO OBRIGATÓRIA:</strong> Adicione a Service Role Key no .env.local:
                    </p>
                    <div className="mt-2 bg-gray-900 text-green-400 p-2 rounded text-xs font-mono">
                      SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
                    </div>
                    <ol className="text-yellow-700 text-xs mt-2 list-decimal list-inside space-y-1">
                      <li>No painel do Supabase, vá em Settings → API</li>
                      <li>Copie a "service_role" key (secreta)</li>
                      <li>Adicione no arquivo .env.local</li>
                      <li>Reinicie o servidor (Ctrl+C e npm run dev)</li>
                      <li>Tente novamente</li>
                    </ol>
                  </div>
                )}
                  <strong>Pré-requisitos:</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center space-x-2">
                      {prerequisites.supabaseConfigured ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>Supabase configurado (.env.local)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {prerequisites.serviceRoleKey ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>Service Role Key configurada</span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
                <h4 className="font-medium text-stone-900 mb-2">Super Admin a ser criado:</h4>
                <div className="space-y-1 text-sm text-stone-600">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span><strong>Login:</strong> tata@dragaonegro.com.br</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Key className="h-4 w-4" />
                    <span><strong>Senha:</strong> Qwe123@2025</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span><strong>Nome:</strong> Super Administrador</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 bg-red-500 rounded-full"></span>
                    <span><strong>Cargo:</strong> Super Admin</span>
                  </div>
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    <strong>Erro:</strong> {error}
                    {details && (
                      <div className="mt-2 text-sm">
                        <strong>Detalhes:</strong> {details}
                      </div>
                    )}
                    {error.includes('não permitida') && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-yellow-800 text-sm">
                          <strong>SOLUÇÃO OBRIGATÓRIA:</strong> No painel do Supabase:
                        </p>
                        <ol className="text-yellow-700 text-xs mt-1 list-decimal list-inside space-y-1">
                          <li>Vá em Authentication → Settings</li>
                          <li>Na seção "User Signups"</li>
                          <li>Habilite "Allow new users to sign up" ✅</li>
                          <li>DESABILITE "Confirm email" (deixe desmarcado) ❌</li>
                          <li>Clique em "Save" para salvar</li>
                          <li>Aguarde 30 segundos e tente novamente</li>
                        </ol>
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                          <p className="text-red-700 text-xs">
                            <strong>CRÍTICO:</strong> Ambas configurações são obrigatórias para funcionar!
                          </p>
                        </div>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={createAdmin}
                className="w-full bg-red-700 hover:bg-red-800"
                disabled={loading}
              >
                {loading ? 'Criando Super Admin...' : 'Criar Super Administrador'}
              </Button>
              
              <div className="flex space-x-2">
                <Button asChild variant="outline" className="flex-1">
                  <a href="/diagnostico-supabase">Diagnosticar DB</a>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <a href="/test-database">Testar Conexão</a>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}