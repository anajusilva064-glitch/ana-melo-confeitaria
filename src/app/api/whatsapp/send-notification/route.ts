import { NextRequest, NextResponse } from 'next/server';
import { enviarMensagemWhatsAppDireta } from '@/lib/whatsapp-baileys';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, message, orderNumber, status, customerName } = body;

    if (!phone || !message) {
      return NextResponse.json(
        { error: 'Telefone e mensagem são obrigatórios.' },
        { status: 400 }
      );
    }

    const res = await enviarMensagemWhatsAppDireta(phone, message);

    if (!res.success) {
      console.warn(`[WhatsApp Notification Falha] Pedido: ${orderNumber} - ${res.error}`);
      return NextResponse.json(
        {
          success: false,
          error: res.error,
          orderNumber,
          customerName,
        },
        { status: 400 }
      );
    }

    console.log(`[WhatsApp Notification Enviado com Sucesso!] Para: ${phone} | Pedido: ${orderNumber} | Status: ${status}`);

    return NextResponse.json({
      success: true,
      messageId: res.messageId,
      phone,
      orderNumber,
      customerName,
      status,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erro no processamento da notificação';
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
