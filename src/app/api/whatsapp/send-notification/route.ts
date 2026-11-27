import { NextRequest, NextResponse } from 'next/server';
import { enviarMensagemWhatsAppDireta } from '@/lib/whatsapp-baileys';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      phone,
      message,
      orderNumber,
      status,
      customerName,
      customerPhone,
      customerMessage,
    } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Telefone e mensagem são obrigatórios.' },
        { status: 400 }
      );
    }

    // 1. Envia a notificação para o telefone principal (ex: WhatsApp do Ateliê / Loja)
    const res = await enviarMensagemWhatsAppDireta(phone, message);

    if (!res.success) {
      console.warn(`[WhatsApp Notification Falha] Pedido: ${orderNumber} - ${res.error}`);
    } else {
      console.log(`[WhatsApp Notification Enviado com Sucesso!] Para: ${phone} | Pedido: ${orderNumber} | Status: ${status}`);
    }

    // 2. Se houver telefone e mensagem específica para o cliente, dispara também
    let customerSent = false;
    if (customerPhone && customerMessage && customerPhone !== phone) {
      try {
        const resCust = await enviarMensagemWhatsAppDireta(customerPhone, customerMessage);
        customerSent = resCust.success;
      } catch (errCust) {
        console.warn(`[WhatsApp Cliente Aviso] Não foi possível enviar para cliente ${customerPhone}:`, errCust);
      }
    }

    return NextResponse.json({
      success: res.success || customerSent,
      messageId: res.messageId,
      phone,
      orderNumber,
      customerName,
      status,
      customerNotified: customerSent,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erro no processamento da notificação';
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
