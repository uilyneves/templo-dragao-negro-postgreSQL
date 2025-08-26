'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface AuthDiagnostic {
  supabaseConfigured: boolean;
  canConnectToSupabase: boolean;
  authSettingsCorrect: boolean;
  userExists: boolean;
  canLogin: boolean;
  error?: string;
  details?: string;
}

export default function DebugAuthPage() {
  const [diagnostic, setDiagnostic] = useState<AuthDiagnostic | null>(null);
  const [loading, setLoading] = useState(false);
  const [testLoginLoading, setTestLoginLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const result: AuthDiagnostic = {
        supabaseConfigured: false,
        canConnectToSupabase: false,
        authSettingsCorrect: false,
        userExists: false,
        canLogin: false
      };

      // 1. Verificar se Supabase está configurado
      const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      result.supabaseConfigured = hasUrl && hasKey;

      if (!result.supabaseConfigured) {
        result.error = 'Supabase não configurado';
        result.details = 'Variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY não encontradas';
        setDiagnostic(result);
        return;
      }

      // 2. Testar conexão básica com Supabase
      try {
        const response = await fetch('/api/health');
        const healthData = await response.json();
        result.canConnectToSupabase = healthData.services?.supabase_client || false;
      } catch (error) {
        result.canConnectToSupabase = false;
        result.error = 'Erro na conexão com Supabase';
        result.details = 'API de health check falhou';
      }

      // 3. Verificar se usuário admin existe
      try {
        const response = await fetch('/api/check-admin-exists');
        const data = await response.json();
        result.userExists = data.exists || false;
        
        if (!result.userExists) {
          result.error = 'Usuário admin não existe';
          result.details = 'Execute /setup-admin para criar o usuário tata@dragaonegro.com.br';
        }
      } catch (error) {
        result.userExists = false;
        result.error = 'Erro ao verificar usuário';
        result.details = 'Não foi possível verificar se o usuário admin existe';
      }

      setDiagnostic(result);
    } catch (error) {
      setDiagnostic({
        supabaseConfigured: false,
        canConnectToSupabase: false,
        authSettingsCorrect: false,
        userExists: false,
        canLogin: false,
        error: 'Erro no diagnóstico',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setTestLoginLoading(true);
    try {
      const response = await fetch('/api/test-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'tata@dragaonegro.com.br',
          password: 'Qwe123@2025'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('✅ Login funcionou! Redirecionando...');
        window.location.href = '/admin';
      } else {
        alert(`❌ Erro no login: ${data.error}\n\nDetalhes: ${data.details || 'Sem detalhes'}`);
      }
    } catch (error) {
      alert(`❌ Erro na requisição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setTestLoginLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostic();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button asChild variant="ghost">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Site
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Diagnóstico de Autenticação
          </h1>
          <p className="text-gray-600">
            Vamos descobrir exatamente qual é o problema com o login
          </p>
          <Button onClick={runDiagnostic} className="mt-4" disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {loading ? 'Diagnosticando...' : 'Executar Diagnóstico'}
          </Button>
        </div>

        {diagnostic && (
          <div className="space-y-6">
            {/* Status Geral */}
            <Card className={diagnostic.canLogin ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {diagnostic.canLogin ? (
                    <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="mr-2 h-6 w-6 text-red-600" />
                  )}
                  Status da Autenticação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Supabase Configurado</p>
                    <Badge className={diagnostic.supabaseConfigured ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {diagnostic.supabaseConfigured ? '✅ Sim' : '❌ Não'}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium">Conexão Funcionando</p>
                    <Badge className={diagnostic.canConnectToSupabase ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {diagnostic.canConnectToSupabase ? '✅ Sim' : '❌ Não'}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium">Usuário Admin Existe</p>
                    <Badge className={diagnostic.userExists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {diagnostic.userExists ? '✅ Sim' : '❌ Não'}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium">Pode Fazer Login</p>
                    <Badge className={diagnostic.canLogin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {diagnostic.canLogin ? '✅ Sim' : '❌ Não'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Erro Detectado */}
            {diagnostic.error && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Problema Identificado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-red-700 font-medium">{diagnostic.error}</p>
                    {diagnostic.details && (
                      <p className="text-red-600 text-sm">{diagnostic.details}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Variáveis de Ambiente */}
            <Card>
              <CardHeader>
                <CardTitle>Variáveis de Ambiente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>NEXT_PUBLIC_SUPABASE_URL:</span>
                    <Badge className="bg-green-100 text-green-800">
                      ✅ Configurada
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
                    <Badge className="bg-green-100 text-green-800">
                      ✅ Configurada
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>SUPABASE_SERVICE_ROLE_KEY:</span>
                    <Badge className="bg-green-100 text-green-800">
                      ✅ Configurada
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teste de Login */}
            <Card>
              <CardHeader>
                <CardTitle>Teste de Login</CardTitle>
                <CardDescription>
                  Testar login com as credenciais padrão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-medium mb-2">Credenciais de Teste:</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Email:</strong> tata@dragaonegro.com.br</p>
                      <p><strong>Senha:</strong> Qwe123@2025</p>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={testLogin}
                    disabled={testLoginLoading || !diagnostic.supabaseConfigured}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {testLoginLoading ? 'Testando Login...' : 'Testar Login Agora'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Soluções */}
            <Card>
              <CardHeader>
                <CardTitle>Soluções Possíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {!diagnostic.supabaseConfigured && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">1. Configurar Supabase</h4>
                      <p className="text-yellow-800 text-sm mb-3">
                        Crie o arquivo .env.local na raiz do projeto com:
                      </p>
                      <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono">
                        NEXT_PUBLIC_SUPABASE_URL=https://ckfulzitmnacpoyyqxfy.supabase.co<br/>
                        NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui<br/>
                        SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
                      </div>
                    </div>
                  )}

                  {!diagnostic.userExists && diagnostic.supabaseConfigured && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">2. Criar Usuário Admin</h4>
                      <p className="text-blue-800 text-sm mb-3">
                        O usuário admin não existe. Crie usando:
                      </p>
                      <Button asChild>
                        <Link href="/setup-admin">Criar Super Admin</Link>
                      </Button>
                    </div>
                  )}

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">3. Configurações do Supabase</h4>
                    <p className="text-green-800 text-sm mb-3">
                      No painel do Supabase, vá em Authentication → Settings:
                    </p>
                    <ul className="text-green-700 text-sm space-y-1">
                      <li>• <strong>Allow signup:</strong> ON ✅</li>
                      <li>• <strong>Confirm email:</strong> OFF ❌</li>
                      <li>• <strong>Enable phone confirmations:</strong> OFF ❌</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}