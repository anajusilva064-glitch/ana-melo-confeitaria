import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const apiUrl = searchParams.get('apiUrl') || process.env.WHATSAPP_API_URL || '';
    const apiKey = searchParams.get('apiKey') || process.env.WHATSAPP_API_KEY || '';
    const instanceName = searchParams.get('instanceName') || process.env.WHATSAPP_INSTANCE_NAME || 'anamelo';

    if (!apiUrl || !apiKey) {
      return NextResponse.json({
        configured: false,
        connected: false,
        state: 'unconfigured',
        message: 'Servidor da API do WhatsApp não configurado.',
      });
    }

    const cleanApiUrl = apiUrl.replace(/\/+$/, '');

    try {
      const response = await fetch(`${cleanApiUrl}/instance/connectionState/${instanceName}`, {
        method: 'GET',
        headers: {
          apikey: apiKey,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        return NextResponse.json({
          configured: true,
          connected: false,
          state: 'disconnected',
          message: 'Instância desconectada ou inexistente.',
        });
      }

      const data = await response.json();
      const state = data?.instance?.state || data?.state || 'close';
      const isConnected = state === 'open' || state === 'connected';

      return NextResponse.json({
        configured: true,
        connected: isConnected,
        state,
        instanceName,
        phone: data?.instance?.owner || data?.owner || null,
        profileName: data?.instance?.profileName || null,
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Falha na conexão';
      return NextResponse.json({
        configured: true,
        connected: false,
        state: 'error',
        message: errorMsg,
      });
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erro interno';
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
