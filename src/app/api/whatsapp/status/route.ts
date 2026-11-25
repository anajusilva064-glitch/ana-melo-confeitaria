import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { obterStatusWhatsApp } from '@/lib/whatsapp-baileys';

export async function GET() {
  try {
    // Força execução dinâmica a cada requisição
    await headers();
    const status = await obterStatusWhatsApp();
    return NextResponse.json(status, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erro ao obter status';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
