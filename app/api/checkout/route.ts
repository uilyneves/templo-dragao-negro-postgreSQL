import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function POST(req: NextRequest) {
  try {
    // Verificar se o cliente Supabase está configurado
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { type, items, user_data, payment_method } = body;

    // Validação
    if (!type || !items || !user_data || !payment_method) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }


    let total = 0;
    let orderData: any = {};

    if (type === 'consultation') {
      total = 120.00; // Valor fixo da consulta
      orderData = {
        consultation_date: items.date,
        consultation_time: items.time,
        question: items.question
      };

      // Criar agendamento de consulta
      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .insert({
          member_id: null, // Será vinculado via email posteriormente
          date: items.date,
          time: items.time,
          question: items.question,
          status: 'pending',
          payment_status: 'pending',
          amount: total
        })
        .select()
        .single();

      if (consultationError) {
        return NextResponse.json(
          { error: 'Erro ao criar consulta', details: consultationError.message },
          { status: 400 }
        );
      }

      orderData.consultation_id = consultation?.id;
    } else if (type === 'products') {
      // Calcular total dos produtos
      for (const item of items) {
        total += item.price * item.quantity;
      }
      orderData = { items };

      // Criar pedido
      const orderNumber = `ORD${Date.now()}`;
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_email: user_data.email,
          customer_name: user_data.name,
          total,
          status: 'pending',
          payment_status: 'pending',
          payment_method: payment_method
        })
        .select()
        .single();

      if (orderError) {
        return NextResponse.json(
          { error: 'Erro ao criar pedido', details: orderError.message },
          { status: 400 }
        );
      }

      orderData.order_id = order?.id;
    }

    // Simular integração com PagSeguro
    const pagseguroResponse = await simulatePagSeguroCheckout({
      total,
      payment_method,
      user_data,
      order_data: orderData
    });

    if (!pagseguroResponse.success) {
      return NextResponse.json(
        { error: 'Erro no processamento do pagamento' },
        { status: 400 }
      );
    }

    // Registrar no CRM automaticamente
    try {
      await fetch(`${req.nextUrl.origin}/api/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type === 'consultation' ? 'consulta' : 'loja',
          data: user_data,
          consents: {
            marketing: true,
            data_processing: true,
            whatsapp: true
          }
        })
      });
    } catch (error) {
      // Não falhar o checkout se o CRM falhar
      console.error('Erro ao registrar no CRM:', error);
    }

    return NextResponse.json({
      success: true,
      payment_url: pagseguroResponse.payment_url,
      payment_id: pagseguroResponse.payment_id,
      qr_code: pagseguroResponse.qr_code,
      message: 'Checkout iniciado com sucesso'
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    );
  }
}

async function simulatePagSeguroCheckout(data: any) {
  // Simulação do PagSeguro - implementar com SDK real em produção
  const payment_id = `PS${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    success: true,
    payment_id,
    payment_url: `https://pagseguro.uol.com.br/checkout/${payment_id}`,
    qr_code: data.payment_method === 'pix' ? generatePixQRCode(data) : null
  };
}

function generatePixQRCode(data: any) {
  // Simular QR Code do PIX
  return `00020126580014br.gov.bcb.pix0136${Date.now()}@dragaonegro.com.br5204000053039865802BR5925Templo Dragao Negro6009SAO PAULO62070503***6304`;
}