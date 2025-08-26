import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET - Buscar configurações
export async function GET(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin não configurado' },
        { status: 500 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .order('key');

    if (error) {
      console.error('Erro ao buscar configurações:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar configurações', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: data || []
    });

  } catch (error) {
    console.error('Erro na API de configurações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Salvar configurações
export async function POST(req: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Supabase admin não configurado' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Configurações inválidas' },
        { status: 400 }
      );
    }

    console.log('💾 API: Salvando configurações:', settings);

    // Salvar cada configuração
    const results = [];
    for (const [key, value] of Object.entries(settings)) {
      try {
        let processedValue: string;
        let type: string;

        if (typeof value === 'string') {
          processedValue = JSON.stringify(value);
          type = 'string';
        } else if (typeof value === 'number') {
          processedValue = value.toString();
          type = 'number';
        } else if (typeof value === 'boolean') {
          processedValue = value.toString();
          type = 'boolean';
        } else {
          processedValue = JSON.stringify(value);
          type = 'json';
        }

        console.log(`💾 Salvando ${key}: ${value} (${type}) → ${processedValue}`);

        const { data, error } = await supabaseAdmin
          .from('system_settings')
          .upsert({
            key,
            value: processedValue,
            type,
            category: 'general',
            is_public: true,
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'key',
            ignoreDuplicates: false 
          })
          .select();

        if (error) {
          console.error(`❌ Erro ao salvar ${key}:`, error);
          throw new Error(`Erro ao salvar ${key}: ${error.message}`);
        }

        console.log(`✅ ${key} salvo:`, data);
        results.push({ key, success: true, data });

      } catch (settingError) {
        console.error(`❌ Erro específico em ${key}:`, settingError);
        results.push({ 
          key, 
          success: false, 
          error: settingError instanceof Error ? settingError.message : 'Erro desconhecido' 
        });
      }
    }

    // Verificar se todas foram salvas
    const failedSettings = results.filter(r => !r.success);
    if (failedSettings.length > 0) {
      return NextResponse.json(
        { 
          error: 'Algumas configurações falharam',
          details: failedSettings,
          results
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Todas as configurações salvas com sucesso',
      results
    });

  } catch (error) {
    console.error('Erro na API de configurações:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}