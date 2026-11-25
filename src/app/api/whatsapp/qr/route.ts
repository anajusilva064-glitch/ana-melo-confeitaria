import { NextRequest, NextResponse } from 'next/server';
import { iniciarConexaoWhatsApp } from '@/lib/whatsapp-baileys';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const forcarNovoQr = Boolean(body?.forcarNovoQr);

    const status = await iniciarConexaoWhatsApp({
      forcarNovoQr,
      timeoutMs: 14000,
    });

    return NextResponse.json(status);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro ao gerar QR Code';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
