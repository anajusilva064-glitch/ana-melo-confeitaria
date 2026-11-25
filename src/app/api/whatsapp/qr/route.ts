import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiUrl = body.apiUrl || process.env.WHATSAPP_API_URL || '';
    const apiKey = body.apiKey || process.env.WHATSAPP_API_KEY || '';
    const instanceName = body.instanceName || process.env.WHATSAPP_INSTANCE_NAME || 'anamelo';

    if (!apiUrl || !apiKey) {
      // Se ainda não informou o servidor da Cotafacil, gera um QR de demonstração do sistema
      const demoQrText = `cotafacil-whatsapp://pair?instance=${instanceName}&ts=${Date.now()}`;
      const demoQrBase64 = await QRCode.toDataURL(demoQrText, {
        width: 320,
        margin: 2,
        color: { dark: '#2E1609', light: '#FFFFFF' },
      });

      return NextResponse.json({
        success: true,
        configured: false,
        qrcode: demoQrBase64,
        state: 'waiting_server',
        message: 'Informe a URL e Chave do servidor Cotafacil para sincronizar a conexão real.',
      });
    }

    const cleanApiUrl = apiUrl.replace(/\/+$/, '');

    // 1. Tenta criar a instância (se ainda não existir)
    try {
      await fetch(`${cleanApiUrl}/instance/create`, {
        method: 'POST',
        headers: {
          apikey: apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceName,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        }),
      });
    } catch {
      // Se já existir, ignora erro
    }

    // 2. Busca o QR Code de conexão
    const connectRes = await fetch(`${cleanApiUrl}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        apikey: apiKey,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const connectData = await connectRes.json().catch(() => ({}));

    let qrCodeBase64 = connectData?.base64 || connectData?.qrcode?.base64 || null;

    // Se a API retornou o código de texto em vez de base64
    const qrCodeText = connectData?.code || connectData?.pairingCode || connectData?.qrcode?.code;
    if (!qrCodeBase64 && qrCodeText) {
      qrCodeBase64 = await QRCode.toDataURL(qrCodeText, {
        width: 320,
        margin: 2,
        color: { dark: '#2E1609', light: '#FFFFFF' },
      });
    }

    if (!qrCodeBase64) {
      return NextResponse.json({
        success: false,
        error: connectData?.message || 'Não foi possível gerar o QR Code no servidor.',
        details: connectData,
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      configured: true,
      qrcode: qrCodeBase64,
      instanceName,
      state: 'connecting',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao processar QR Code';
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
