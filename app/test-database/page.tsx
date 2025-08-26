'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Database, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react';
import { supabaseDiagnostics } from '@/lib/supabase-diagnostics';
import Link from 'next/link';

interface DiagnosticResult {
  connection: {
    connected: boolean;
    error?: string;
    status: string;
  };
  tables: Array<{
    table: string;
    exists: boolean;
    error?: string;
    recordCount: number;
  }>;
  rls: {
    rlsEnabled: boolean;
    error?: string;
    status: string;
  };
  summary: {
    connected: boolean;
    tablesExist: number;
    totalTables: number;
    rlsEnabled: boolean;
    needsSetup: boolean;
  };
}

export default function TestDatabasePage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const result = await supabaseDiagnostics.generateReport();
      setDiagnostics(result);
    } catch (error) {
      console.error('Erro no diagnóstico:', error);
      setDiagnostics({
        connection: { connected: false, error: 'Erro na conexão', status: 'Connection failed' },
        tables: [],
        rls: { rlsEnabled: false, error: 'Erro na verificação', status: 'Check failed' },
        summary: { connected: false, tablesExist: 0, totalTables: 15, rlsEnabled: false, needsSetup: true }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Executando diagnóstico do Supabase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
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
            Diagnóstico Supabase - Templo Dragão Negro
          </h1>
          <p className="text-gray-600">
            Verificação completa da conexão e estrutura do banco de dados
          </p>
          <Button onClick={runDiagnostics} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Executar Novo Diagnóstico
          </Button>
        </div>

        {diagnostics && (
          <div className="space-y-6">
            {/* Resumo Geral */}
            <Card className={`${diagnostics.summary.connected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {diagnostics.summary.connected ? (
                    <CheckCircle className="mr-2 h-6 w-6 text-green-600" />
                  ) : (
                    <XCircle className="mr-2 h-6 w-6 text-red-600" />
                  )}
                  Status Geral do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <p className="font-medium">Conexão</p>
                    <Badge className={diagnostics.summary.connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {diagnostics.summary.connected ? '✅ Conectado' : '❌ Desconectado'}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium">Tabelas</p>
                    <Badge className={diagnostics.summary.tablesExist === diagnostics.summary.totalTables ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {diagnostics.summary.tablesExist}/{diagnostics.summary.totalTables}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium">RLS</p>
                    <Badge className={diagnostics.summary.rlsEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {diagnostics.summary.rlsEnabled ? '✅ Ativo' : '❌ Inativo'}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-medium">Setup</p>
                    <Badge className={diagnostics.summary.needsSetup ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                      {diagnostics.summary.needsSetup ? '❌ Necessário' : '✅ Completo'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes da Conexão */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Conexão com Supabase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Status:</strong> {diagnostics.connection.status}</p>
                  <p><strong>Conectado:</strong> {diagnostics.connection.connected ? '✅ Sim' : '❌ Não'}</p>
                  {diagnostics.connection.error && (
                    <p className="text-red-600"><strong>Erro:</strong> {diagnostics.connection.error}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status das Tabelas */}
            <Card>
              <CardHeader>
                <CardTitle>Status das Tabelas</CardTitle>
                <CardDescription>
                  Verificação de todas as 15 tabelas necessárias para o sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                {diagnostics.tables.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Nenhuma tabela encontrada ou Supabase não configurado</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {diagnostics.tables.map((table) => (
                      <div key={table.table} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{table.table}</p>
                          <p className="text-sm text-gray-500">{table.recordCount} registros</p>
                        </div>
                        <Badge className={table.exists ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {table.exists ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
                
                {diagnostics.tables.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      <strong>Status:</strong> {diagnostics.summary.tablesExist} de {diagnostics.summary.totalTables} tabelas encontradas
                      {diagnostics.summary.tablesExist < diagnostics.summary.totalTables && (
                        <span className="text-red-600"> - Execute o script SQL completo!</span>
                      )}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* RLS Status */}
            <Card>
              <CardHeader>
                <CardTitle>Row Level Security (RLS)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Status:</strong> {diagnostics.rls.status}</p>
                  <p><strong>RLS Ativo:</strong> {diagnostics.rls.rlsEnabled ? '✅ Sim' : '❌ Não'}</p>
                  {diagnostics.rls.error && (
                    <p className="text-gray-600"><strong>Detalhes:</strong> {diagnostics.rls.error}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Ações Recomendadas */}
            {diagnostics.summary.needsSetup && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="text-yellow-800 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    ⚠️ Ações Necessárias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-yellow-700">
                      O banco de dados precisa ser configurado. Execute o script SQL completo.
                    </p>
                    <div className="bg-yellow-100 p-3 rounded text-sm">
                      <p><strong>Script:</strong> complete_setup_dragao_negro.sql</p>
                      <p><strong>Localização:</strong> supabase/migrations/</p>
                      <p><strong>Ação:</strong> Copie e execute no SQL Editor do Supabase</p>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
                        <Link href="/setup-admin">Criar Admin</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/diagnostico-supabase">Diagnóstico</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sistema Pronto */}
            {!diagnostics.summary.needsSetup && diagnostics.summary.connected && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">🎉 Sistema Pronto!</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-green-700">
                      Banco de dados configurado e funcionando perfeitamente!
                    </p>
                    <div className="flex space-x-2">
                      <Button asChild className="bg-green-600 hover:bg-green-700">
                        <Link href="/setup-admin">Criar Admin</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/admin">Acessar Painel</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}