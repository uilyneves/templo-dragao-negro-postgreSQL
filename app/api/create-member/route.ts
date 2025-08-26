import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    // Validação
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Criar usuário membro
    const result = await authService.createMemberUser(email, password, name);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Membro criado com sucesso',
        user: result.user
      });
    } else {
      return NextResponse.json(
        { error: 'Erro ao criar membro', details: result.error },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Erro na API create-member:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}