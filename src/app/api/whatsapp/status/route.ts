import { NextResponse } from 'next/server';
import { obterStatusWhatsApp } from '@/lib/whatsapp-baileys';

export async function GET() {
  try {
    const status = await obterStatusWhatsApp();
    return NextResponse.json(status);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erro ao obter status';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
