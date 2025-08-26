'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Database, RefreshCw, ArrowLeft, Settings } from 'lucide-react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { settingsService } from '@/lib/settings-service';
import Link from 'next/link';

interface SettingTest {
  key: string;
  expected_type: string;
  current_value: any;
  processed_value: any;
  status: 'ok' | 'error' | 'missing';
  error?: string;
}

export default function TestSettingsPage() {
  const [tests, setTests] = useState<SettingTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [rawData, setRawData] = useState<any[]>([]);

  const runTests = async () => {
    setLoading(true);
    try {
      console.log('🧪 Iniciando testes de configurações...');

      // 1. Testar conexão direta com banco
      if (!supabaseBrowser) {
        throw new Error('Supabase não configurado');
      }

      const { data: rawSettings, error } = await supabaseBrowser
        .from('system_settings')
        .select('*')
        .order('key');

      if (error) {
        throw new Error(`Erro ao buscar configurações: ${error.message}`);
      }

      console.log('📊 Dados brutos do banco:', rawSettings);
      setRawData(rawSettings || []);

      // 2. Testar processamento de cada configuração
      const expectedSettings = [
        { key: 'site_name', type: 'string' },
        { key: 'contact_email', type: 'string' },
        { key: 'contact_phone', type: 'string' },
        { key: 'whatsapp_number', type: 'string' },
        { key: 'consultation_price', type: 'number' },
        { key: 'consultation_duration', type: 'number' },
        { key: 'allow_registrations', type: 'boolean' },
        { key: 'pagseguro_sandbox', type: 'boolean' }
      ];

      const testResults: SettingTest[] = [];

      for (const expected of expectedSettings) {
        const setting = rawSettings?.find(s => s.key === expected.key);
        
        if (!setting) {
          testResults.push({
            key: expected.key,
            expected_type: expected.type,
            current_value: null,
            processed_value: null,
            status: 'missing',
            error: 'Configuração não encontrada no banco'
          });
          continue;
        }

        try {
          let processedValue: any;
          
          if (expected.type === 'string') {
            processedValue = JSON.parse(setting.value || '""');
          } else if (expected.type === 'number') {
            processedValue = parseFloat(setting.value || '0');
          } else if (expected.type === 'boolean') {
            processedValue = (setting.value || 'false') === 'true';
          }

          testResults.push({
            key: expected.key,
            expected_type: expected.type,
            current_value: setting.value,
            processed_value: processedValue,
            status: 'ok'
          });

        } catch (processError) {
          testResults.push({
            key: expected.key,
            expected_type: expected.type,
            current_value: setting.value,
            processed_value: null,
            status: 'error',
            error: `Erro no processamento: ${processError instanceof Error ? processError.message : 'Erro desconhecido'}`
          });
        }
      }

      setTests(testResults);

      // 3. Testar serviço de configurações
      try {
        const publicSettings = await settingsService.getPublicSettings();
        console.log('🌐 Configurações públicas processadas:', publicSettings);
      } catch (serviceError) {
        console.error('❌ Erro no settingsService:', serviceError);
      }

    } catch (error) {
      console.error('❌ Erro nos testes:', error);
      alert('Erro nos testes: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const testSaveSetting = async () => {
    try {
      console.log('🧪 Testando salvamento de configuração...');
      
      const testValue = 150.00;
      const result = await settingsService.updateSetting('consultation_price', testValue, 'number');
      
      if (result.success) {
        alert(`✅ Teste de salvamento OK! Preço alterado para R$ ${testValue}`);
        await runTests(); // Recarregar para verificar
      } else {
        alert(`❌ Erro no teste: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Erro no teste de salvamento:', error);
      alert('Erro no teste: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button asChild variant="ghost">
              <Link href="/admin" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Admin
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Teste de Configurações do Sistema
          </h1>
          <p className="text-gray-600">
            Diagnóstico completo do sistema de configurações
          </p>
          <div className="flex space-x-4 mt-4">
            <Button onClick={runTests} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {loading ? 'Testando...' : 'Executar Testes'}
            </Button>
            <Button onClick={testSaveSetting} variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Testar Salvamento
            </Button>
          </div>
        </div>

        {/* Dados Brutos do Banco */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Dados Brutos do Banco
            </CardTitle>
            <CardDescription>
              Configurações como estão armazenadas no Supabase
            </CardDescription>
          </CardHeader>
          <CardContent>
            {rawData.length === 0 ? (
              <p className="text-gray-500">Nenhuma configuração encontrada no banco</p>
            ) : (
              <div className="space-y-2">
                {rawData.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{setting.key}</span>
                      <span className="text-sm text-gray-500 ml-2">({setting.type})</span>
                    </div>
                    <div className="text-right">
                      <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                        {setting.value}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resultados dos Testes */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
            <CardDescription>
              Status de cada configuração esperada
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tests.length === 0 ? (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Execute os testes para ver os resultados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tests.map((test) => (
                  <div key={test.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center">
                        {test.status === 'ok' ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{test.key}</h3>
                        <p className="text-sm text-gray-500">
                          Tipo esperado: {test.expected_type}
                        </p>
                        {test.error && (
                          <p className="text-sm text-red-600">{test.error}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={
                        test.status === 'ok' ? 'bg-green-100 text-green-800' :
                        test.status === 'missing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {test.status === 'ok' ? 'OK' :
                         test.status === 'missing' ? 'Ausente' : 'Erro'}
                      </Badge>
                      {test.status === 'ok' && (
                        <div className="text-xs text-gray-500 mt-1">
                          <div>Bruto: {test.current_value}</div>
                          <div>Processado: {JSON.stringify(test.processed_value)}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}