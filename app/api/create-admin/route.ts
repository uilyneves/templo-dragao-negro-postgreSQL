import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Verificar se as variáveis estão configuradas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Criar cliente admin apenas se ambas as variáveis existirem
const admin = supabaseUrl && serviceRoleKey 
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

interface CreateAdminRequest {
  email: string;
  password: string;
  name?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Verificar variáveis de ambiente primeiro
    if (!supabaseUrl) {
      return NextResponse.json(
        { 
          error: 'NEXT_PUBLIC_SUPABASE_URL não configurada',
          details: 'Configure a URL do Supabase no arquivo .env.local'
        },
        { status: 500 }
      );
    }

    if (!serviceRoleKey) {
      return NextResponse.json(
        { 
          error: 'SUPABASE_SERVICE_ROLE_KEY não configurada',
          details: 'CRÍTICO: Vá no painel do Supabase → Settings → API → Copie a "service_role" key → Adicione no .env.local como SUPABASE_SERVICE_ROLE_KEY=sua_key_aqui → Reinicie o servidor'
        },
        { status: 500 }
      );
    }

    // Verificar se admin client está configurado
    if (!admin) {
      return NextResponse.json(
        { 
          error: 'Cliente admin não configurado',
          details: 'Erro na criação do cliente Supabase admin'
        },
        { status: 500 }
      );
    }

    const { email, password, name }: CreateAdminRequest = await req.json();
    
    // Validação dos dados
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar role de super_admin
    const { data: superAdminRole, error: roleError } = await admin
      .from('roles')
      .select('id')
      .eq('name', 'super_admin')
      .single();

    if (roleError || !superAdminRole) {
      console.error('Erro ao buscar role super_admin:', roleError);
      return NextResponse.json(
        { 
          error: 'Role super_admin não encontrada no banco',
          details: `Execute primeiro o script SQL de setup. Erro: ${roleError?.message || 'Role não existe'}`
        },
        { status: 400 }
      );
    }

    // Criar usuário no Supabase Auth
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (error) {
      console.error('Erro ao criar usuário:', error);
      if (error.message.includes('User not allowed')) {
        return NextResponse.json(
          { 
            error: 'Criação de usuários não permitida',
            details: 'Vá no painel do Supabase → Authentication → Settings → User Management e habilite "Allow new users to sign up"'
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { 
          error: 'Erro ao criar usuário no Supabase Auth',
          details: error.message 
        },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Falha ao criar usuário' },
        { status: 500 }
      );
    }

    // Criar perfil
    const { error: profileError } = await admin
      .from('profiles')
      .insert({
        id: data.user.id,
        email,
        name: name || 'Super Administrador',
        role_id: superAdminRole.id,
        is_active: true
      });

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      // Se falhar ao criar perfil, tentar deletar o usuário criado
      try {
        await admin.auth.admin.deleteUser(data.user.id);
      } catch (deleteError) {
        console.error('Erro ao deletar usuário após falha:', deleteError);
      }
      
      return NextResponse.json(
        { 
          error: 'Erro ao criar perfil do usuário',
          details: profileError.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        ok: true, 
        message: 'Super Admin criado com sucesso',
        user_id: data.user.id,
        role_id: superAdminRole.id
      }, 
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Erro ao criar super admin:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}