import { NextResponse } from 'next/server';
import { desconectarWhatsApp } from '@/lib/whatsapp-baileys';

export async function POST() {
  try {
    const res = await desconectarWhatsApp();
    return NextResponse.json(res);
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Erro ao desconectar';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
