import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const apiUrl = body.apiUrl || process.env.WHATSAPP_API_URL || '';
    const apiKey = body.apiKey || process.env.WHATSAPP_API_KEY || '';
    const instanceName = body.instanceName || process.env.WHATSAPP_INSTANCE_NAME || 'anamelo';

    if (!apiUrl || !apiKey) {
      return NextResponse.json({ success: true, message: 'Desconectado localmente.' });
    }

    const cleanApiUrl = apiUrl.replace(/\/+$/, '');

    try {
      await fetch(`${cleanApiUrl}/instance/logout/${instanceName}`, {
        method: 'DELETE',
        headers: {
          apikey: apiKey,
          'Content-Type': 'application/json',
        },
      });
    } catch {
      // Ignora erro de logout
    }

    return NextResponse.json({ success: true, message: 'WhatsApp desconectado com sucesso.' });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erro ao desconectar';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
