import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function POST(req: NextRequest) {
  try {
    // Verificar se o cliente Supabase está configurado
    if (!supabase) {
      console.error('Supabase client not configured');
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { notificationCode, notificationType } = body;

    // Validar webhook do PagSeguro
    if (notificationType !== 'transaction') {
      return NextResponse.json({ message: 'Notification type not handled' });
    }


    // Buscar dados da transação no PagSeguro
    const transactionData = await fetchPagSeguroTransaction(notificationCode);
    
    if (!transactionData) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const { reference, status, paymentMethod } = transactionData;

    // Atualizar status do pagamento no banco
    if (reference.startsWith('CON_')) {
      // Consulta
      const consultationId = reference.replace('CON_', '');
      const { error: updateError } = await supabase
        .from('consultations')
        .update({
          payment_status: mapPagSeguroStatus(status),
          payment_id: notificationCode,
          status: status === 'paid' ? 'confirmed' : 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', consultationId);

      if (updateError) {
        console.error('Erro ao atualizar consulta:', updateError);
      }

      // Se pagamento confirmado, enviar confirmação
      if (status === 'paid') {
        await sendConsultationConfirmation(consultationId);
      }
    } else if (reference.startsWith('ORD_')) {
      // Pedido da loja
      const orderId = reference.replace('ORD_', '');
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: mapPagSeguroStatus(status),
          payment_id: notificationCode,
          status: status === 'paid' ? 'processing' : 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (updateError) {
        console.error('Erro ao atualizar pedido:', updateError);
      }

      if (status === 'paid') {
        await processOrder(orderId);
      }
    }

    // Webhook out para automações externas
    await sendWebhookOut('payment_status_changed', {
      reference,
      status: mapPagSeguroStatus(status),
      payment_method: paymentMethod,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('PagSeguro webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function fetchPagSeguroTransaction(notificationCode: string) {
  // Simular consulta ao PagSeguro
  // Na implementação real, fazer requisição para API do PagSeguro
  return {
    reference: `CON_${Math.random().toString(36).substr(2, 9)}`,
    status: 'paid',
    paymentMethod: 'pix'
  };
}

function mapPagSeguroStatus(status: string): 'pending' | 'paid' | 'failed' {
  const statusMap: Record<string, 'pending' | 'paid' | 'failed'> = {
    'paid': 'paid',
    'available': 'paid',
    'cancelled': 'failed',
    'refunded': 'failed'
  };

  return statusMap[status] || 'pending';
}

async function sendConsultationConfirmation(consultationId: string) {
  if (!supabase) return;

  // Buscar dados da consulta
  const { data: consultation } = await supabase
    .from('consultations')
    .select(`
      *,
      members(name, email, phone)
    `)
    .eq('id', consultationId)
    .single();

  if (!consultation || !consultation.members) return;

  // Agendar mensagem de confirmação
  await supabase
    .from('messages')
    .insert({
      recipient_id: consultation.member_id,
      recipient_email: consultation.members.email,
      recipient_phone: consultation.members.phone,
      recipient_name: consultation.members.name,
      type: 'whatsapp',
      content: `Olá ${consultation.members.name}! Sua consulta foi confirmada para ${consultation.date} às ${consultation.time}. Local: Templo de Kimbanda Dragão Negro. Até breve! 🙏`,
      status: 'pending'
    });
}

async function processOrder(orderId: string) {
  // Processar pedido da loja - reduzir estoque, etc.
  console.log('Processing order:', orderId);
}

async function sendWebhookOut(event: string, data: any) {
  // Enviar webhook para automações externas (Make/Zapier)
  const webhookUrls = process.env.WEBHOOK_URLS?.split(',') || [];
  
  for (const url of webhookUrls) {
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Secret': process.env.WEBHOOK_SECRET || ''
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
          source: 'dragao-negro-api'
        })
      });
    } catch (error) {
      console.error('Webhook out error:', error);
    }
  }
}