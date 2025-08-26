import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Supabase admin não configurado',
        details: 'SUPABASE_SERVICE_ROLE_KEY não encontrada'
      });
    }

    // Tentar fazer login
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Erro no login',
        details: error.message,
        code: error.status
      });
    }

    if (!data.user) {
      return NextResponse.json({
        success: false,
        error: 'Usuário não encontrado',
        details: 'Login retornou vazio'
      });
    }

    // Verificar se é admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        roles(name)
      `)
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      return NextResponse.json({
        success: false,
        error: 'Perfil não encontrado',
        details: profileError.message
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        profile: profile
      },
      message: 'Login realizado com sucesso'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}