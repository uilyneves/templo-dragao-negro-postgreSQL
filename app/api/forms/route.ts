import { NextRequest, NextResponse } from 'next/server';
import { memberService } from '@/lib/supabase-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data, consents = {} } = body;

    // Validação básica
    if (!type || !data || !data.email) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: type, data.email' },
        { status: 400 }
      );
    }

    // Anti-spam básico
    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    // Verificar se não é spam
    if (userAgent.includes('bot') || userAgent.includes('crawler')) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      );
    }

    // Criar ou atualizar membro
    const member = await memberService.upsertMember({
      name: data.name || '',
      email: data.email,
      phone: data.phone || '',
      origin: type,
      consents: {
        marketing: consents.marketing || false,
        data_processing: consents.data_processing || true,
        whatsapp: consents.whatsapp || false,
        ...consents
      }
    });

    return NextResponse.json({
      success: true,
      member_id: member.id,
      message: 'Dados processados com sucesso'
    });

  } catch (error) {
    console.error('Form submission error:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}