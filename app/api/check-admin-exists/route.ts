import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        exists: false,
        error: 'Supabase admin client não configurado'
      });
    }

    // Verificar se usuário admin existe
    const { data: user, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      return NextResponse.json({
        exists: false,
        error: 'Erro ao listar usuários',
        details: error.message
      });
    }

    const adminExists = user.users.some(u => u.email === 'tata@dragaonegro.com.br');

    return NextResponse.json({
      exists: adminExists,
      totalUsers: user.users.length,
      adminEmail: adminExists ? 'tata@dragaonegro.com.br' : null
    });

  } catch (error) {
    return NextResponse.json({
      exists: false,
      error: 'Erro interno',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}