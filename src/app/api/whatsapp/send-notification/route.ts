import { NextRequest, NextResponse } from 'next/server';

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

    // Normalização do número de telefone brasileiro
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    // Configurações do provedor de WhatsApp (Evolution API / Z-API / Webhook)
    const apiUrl = process.env.WHATSAPP_API_URL || '';
    const apiKey = process.env.WHATSAPP_API_KEY || '';
    const instanceName = process.env.WHATSAPP_INSTANCE_NAME || 'anamelo';

    // Se houver uma API de WhatsApp configurada (ex: Evolution API ou Z-API), realiza o disparo real
    if (apiUrl && apiKey) {
      try {
        const response = await fetch(`${apiUrl}/message/sendText/${instanceName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: apiKey,
          },
          body: JSON.stringify({
            number: formattedPhone,
            text: message,
          }),
        });

        const data = await response.json();
        return NextResponse.json({
          success: true,
          provider: 'evolution-api',
          phone: formattedPhone,
          orderNumber,
          data,
        });
      } catch (err: any) {
        console.error('Erro ao conectar com a API externa do WhatsApp:', err);
        return NextResponse.json({
          success: false,
          error: 'Falha na comunicação com a API do WhatsApp',
          details: err.message,
        }, { status: 502 });
      }
    }

    // Modo Padrão / Simulado (pronto para plugar)
    // Loga o disparo no servidor para auditoria
    console.log(`[WHATSAPP NOTIFICATION] Para: ${formattedPhone} | Pedido: ${orderNumber} | Status: ${status}`);
    console.log(`Mensagem:\n${message}\n---`);

    return NextResponse.json({
      success: true,
      mode: 'ready-to-plug',
      phone: formattedPhone,
      orderNumber,
      customerName,
      status,
      message,
      instructions: 'API pronta. Configure WHATSAPP_API_URL e WHATSAPP_API_KEY no .env.local para disparo automático direto.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Erro interno no processamento da notificação WhatsApp.', details: error.message },
      { status: 500 }
    );
  }
}
