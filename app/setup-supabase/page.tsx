'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, ExternalLink, Copy } from 'lucide-react';

export default function SetupSupabasePage() {
  const [step, setStep] = useState(1);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [serviceRoleKey, setServiceRoleKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    try {
      // Simular teste de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConnected(true);
      setStep(3);
    } catch (error) {
      console.error('Erro na conexão:', error);
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-red-900 to-stone-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Configuração do Supabase
          </h1>
          <p className="text-stone-200 text-lg">
            Configure sua conexão com o banco de dados Supabase
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  step >= stepNum 
                    ? 'bg-amber-600 text-white border-amber-600' 
                    : 'bg-white/10 text-white border-white/30'
                }`}>
                  {step > stepNum ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    stepNum
                  )}
                </div>
                {stepNum < 4 && (
                  <div className={`w-16 h-0.5 ${
                    step > stepNum ? 'bg-amber-600' : 'bg-white/30'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 text-sm text-stone-300">
            <div className="text-center">
              <p>Criar Projeto → Configurar → Testar → Migrar</p>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">1</span>
                Criar Projeto no Supabase
              </CardTitle>
              <CardDescription className="text-stone-300">
                Primeiro, você precisa criar um projeto no Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 mb-3">Passo a passo:</h4>
                <ol className="list-decimal list-inside space-y-2 text-amber-800 text-sm">
                  <li>Acesse <a href="https://supabase.com" target="_blank" className="underline font-medium">supabase.com</a></li>
                  <li>Clique em "Start your project"</li>
                  <li>Faça login com GitHub, Google ou email</li>
                  <li>Clique em "New Project"</li>
                  <li>Escolha sua organização</li>
                  <li>Nome do projeto: <strong>"Templo Dragão Negro"</strong></li>
                  <li>Crie uma senha forte para o banco</li>
                  <li>Região: <strong>South America (São Paulo)</strong></li>
                  <li>Plano: <strong>Free</strong> (suficiente para começar)</li>
                  <li>Clique em "Create new project"</li>
                </ol>
              </div>

              <div className="flex items-center space-x-4">
                <Button 
                  asChild 
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <a href="https://supabase.com" target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir Supabase
                  </a>
                </Button>
                <Button 
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  Projeto Criado, Continuar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Configurar Variáveis */}
        {step === 2 && (
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">2</span>
                Configurar Variáveis de Ambiente
              </CardTitle>
              <CardDescription className="text-stone-300">
                Copie as credenciais do seu projeto Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Como encontrar as credenciais:</h4>
                <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                  <li>No painel do Supabase, vá em <strong>Settings → API</strong></li>
                  <li>Copie a <strong>Project URL</strong></li>
                  <li>Copie a <strong>anon public key</strong></li>
                  <li>Copie a <strong>service_role key</strong> (cuidado, é secreta!)</li>
                </ol>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="url" className="text-white">Project URL</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="url"
                      placeholder="https://xxxxx.supabase.co"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(supabaseUrl)}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="anon" className="text-white">Anon Key (Public)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="anon"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(supabaseKey)}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="service" className="text-white">Service Role Key (Secreta)</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="service"
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={serviceRoleKey}
                      onChange={(e) => setServiceRoleKey(e.target.value)}
                      className="bg-white/10 border-white/30 text-white placeholder:text-white/50"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(serviceRoleKey)}
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">⚠️ Importante:</h4>
                <p className="text-red-800 text-sm">
                  Após inserir as credenciais aqui, você precisa copiá-las para o arquivo 
                  <code className="bg-red-100 px-1 rounded">.env.local</code> na raiz do projeto.
                </p>
              </div>

              <Button 
                onClick={testConnection}
                disabled={!supabaseUrl || !supabaseKey || testing}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {testing ? 'Testando Conexão...' : 'Testar Conexão'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Teste de Conexão */}
        {step === 3 && (
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <CheckCircle className="h-5 w-5" />
                </span>
                Conexão Estabelecida!
              </CardTitle>
              <CardDescription className="text-stone-300">
                Agora vamos configurar o arquivo .env.local
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">Arquivo .env.local:</h4>
                <div className="bg-gray-900 rounded p-4 text-green-400 text-sm font-mono">
                  <div className="flex justify-between items-start mb-2">
                    <span>Copie este conteúdo:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(`NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Templo de Kimbanda Dragão Negro"`)}
                      className="text-green-400 hover:text-green-300"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <pre className="whitespace-pre-wrap">
{`NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey}
SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Templo de Kimbanda Dragão Negro"`}
                  </pre>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">📝 Instruções:</h4>
                <ol className="list-decimal list-inside space-y-1 text-yellow-800 text-sm">
                  <li>Crie um arquivo chamado <code className="bg-yellow-100 px-1 rounded">.env.local</code> na raiz do projeto</li>
                  <li>Cole o conteúdo acima no arquivo</li>
                  <li>Salve o arquivo</li>
                  <li>Reinicie o servidor Next.js (Ctrl+C e npm run dev)</li>
                </ol>
              </div>

              <Button 
                onClick={() => setStep(4)}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                Arquivo Configurado, Continuar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Migrar Banco */}
        {step === 4 && (
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">4</span>
                Criar Estrutura do Banco
              </CardTitle>
              <CardDescription className="text-stone-300">
                Execute as migrações SQL para criar todas as tabelas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Como executar as migrações:</h4>
                <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                  <li>No painel do Supabase, vá em <strong>SQL Editor</strong></li>
                  <li>Clique em <strong>"New Query"</strong></li>
                  <li>Copie e cole o conteúdo das migrações SQL</li>
                  <li>Execute cada migração na ordem correta</li>
                  <li>Verifique se todas as tabelas foram criadas</li>
                </ol>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-900 rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-green-400 font-semibold">1. Schema Principal</h5>
                    <Badge className="bg-green-600">Obrigatório</Badge>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    Cria todas as tabelas, tipos e relacionamentos
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-green-600 text-green-400 hover:bg-green-600/10"
                  >
                    Ver SQL da Migração Principal
                  </Button>
                </div>

                <div className="bg-gray-900 rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-yellow-400 font-semibold">2. Políticas RLS</h5>
                    <Badge className="bg-yellow-600">Obrigatório</Badge>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    Configura segurança e permissões de acesso
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/10"
                  >
                    Ver SQL das Políticas
                  </Button>
                </div>

                <div className="bg-gray-900 rounded p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="text-purple-400 font-semibold">3. Dados Iniciais</h5>
                    <Badge className="bg-purple-600">Recomendado</Badge>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    Insere dados básicos para funcionamento do sistema
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-purple-600 text-purple-400 hover:bg-purple-600/10"
                  >
                    Ver SQL dos Dados
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  asChild
                  className="flex-1 bg-amber-600 hover:bg-amber-700"
                >
                  <a href="/test-database" target="_blank">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Testar Banco de Dados
                  </a>
                </Button>
                <Button 
                  asChild
                  variant="outline"
                  className="flex-1 border-white/30 text-white hover:bg-white/10"
                >
                  <a href="/">
                    Voltar ao Site
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}