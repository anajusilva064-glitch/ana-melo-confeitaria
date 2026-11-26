import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import https from 'https';
import * as XLSX from 'xlsx';
import { Order } from '@/types';

function excelSerialToDate(serial: number): string {
  // Offset base do Excel (25569 dias entre 1900-01-01 e 1970-01-01)
  const utcDays = serial - 25569;
  const utcValue = utcDays * 86400 * 1000;
  const dateInfo = new Date(utcValue);
  const year = dateInfo.getUTCFullYear();
  const month = String(dateInfo.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateInfo.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function downloadOneDriveBuffer(initialUrl: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    // Garante parâmetro download=1 e cache-busting
    let fetchUrl = initialUrl;
    if (!fetchUrl.includes('download=1')) {
      fetchUrl += (fetchUrl.includes('?') ? '&' : '?') + 'download=1';
    }
    fetchUrl += `&_t=${Date.now()}`;

    const cookieJar: Record<string, string> = {};

    function formatCookieHeader() {
      return Object.entries(cookieJar).map(([k, v]) => `${k}=${v}`).join('; ');
    }

    function requestStep(targetUrl: string, redirectsLeft = 10) {
      if (redirectsLeft <= 0) {
        return reject(new Error('Número excessivo de redirecionamentos no OneDrive.'));
      }

      const parsed = new URL(targetUrl);
      const options: https.RequestOptions = {
        hostname: parsed.hostname,
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept':
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cookie': formatCookieHeader(),
        },
      };

      const req = https.request(options, (res) => {
        // Armazena cookies de sessão do OneDrive
        if (res.headers['set-cookie']) {
          for (const c of res.headers['set-cookie']) {
            const parts = c.split(';')[0].split('=');
            if (parts.length >= 2) {
              cookieJar[parts[0].trim()] = parts.slice(1).join('=').trim();
            }
          }
        }

        // Segue redirecionamentos da Microsoft mantendo cookies
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const nextUrl = new URL(res.headers.location, targetUrl).href;
          return requestStep(nextUrl, redirectsLeft - 1);
        }

        if (res.statusCode === 200) {
          const chunks: Buffer[] = [];
          res.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
          res.on('end', () => resolve(Buffer.concat(chunks)));
        } else {
          reject(new Error(`Erro HTTP ${res.statusCode} ao baixar do OneDrive.`));
        }
      });

      req.on('error', (err) => reject(err));
      req.end();
    }

    requestStep(fetchUrl);
  });
}

function parseWorkbookOrders(buffer: Buffer): Order[] {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const extractedOrders: Order[] = [];

  wb.SheetNames.forEach((sheetName) => {
    const sheet = wb.Sheets[sheetName];
    if (!sheet) return;

    const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Nas matrizes de calendário do modelo:
    // Linhas de texto: r = 1, 4, 7, 10, 13 (linhas 2, 5, 8, 11, 14 no Excel)
    // Linhas de datas: r + 1 = 2, 5, 8, 11, 14 (linhas 3, 6, 9, 12, 15 no Excel)
    for (let r = 1; r < data.length; r += 3) {
      const textRow = data[r] || [];
      const dateRow = data[r + 1] || [];

      // Colunas de domingo a sábado (índices 1 a 7)
      for (let c = 1; c <= 7; c++) {
        const textCell = textRow[c];
        const dateCell = dateRow[c];

        if (textCell && typeof textCell === 'string' && textCell.trim() !== '') {
          const text = textCell.trim();

          let scheduledDate: string | null = null;
          if (typeof dateCell === 'number') {
            scheduledDate = excelSerialToDate(dateCell);
          }

          if (scheduledDate) {
            // Valor em Reais
            let totalAmount = 150.0;
            const priceMatch = text.match(/R\$\s*([\d\.,]+)/i);
            if (priceMatch) {
              const rawPrice = priceMatch[1].replace('.', '').replace(',', '.');
              const parsed = parseFloat(rawPrice);
              if (!isNaN(parsed)) totalAmount = parsed;
            }

            // Quantidade de Doces
            let productName = 'Pacote de Doces de Festa';
            const qtyMatch = text.match(/(\d+)\s*(?:UND|UN|UNI|UNID)/i);
            if (qtyMatch) {
              productName = `Pacote de Doces (${qtyMatch[1]} unidades)`;
            } else if (text.toUpperCase().includes('PCT A ESCOLHER')) {
              productName = 'Pacote de Doces a Escolher';
            }

            // Nome do Cliente / Evento
            let customerName = text.split(/(\d+\s*(?:UND|UN|UNI|UNID)|R\$|PCT)/i)[0].trim();
            if (!customerName) customerName = text;

            // Limpeza de palavras comuns
            customerName = customerName
              .replace(/ANIVER|ANIVE|ANIV/gi, '(Aniversário)')
              .trim();

            const orderId = `ord-partner-${scheduledDate}-${c}`;
            const orderDay = scheduledDate.split('-')[2];

            // Define status com base na data (passadas = entregues, futuras = agendadas)
            const todayStr = new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
            const isPast = scheduledDate < todayStr;
            const isToday = scheduledDate === todayStr;

            extractedOrders.push({
              id: orderId,
              orderNumber: `#EX-${orderDay}`,
              customerName,
              customerPhone: 'Planilha Parceiro (OneDrive)',
              isPreOrder: true,
              source: 'partner_excel',
              deliveryType: 'pickup',
              deliveryFee: 0,
              scheduledDate,
              scheduledTime: '15:00',
              items: [
                {
                  id: `it-${orderId}`,
                  productId: 'prod-cento-tradicional',
                  productName,
                  quantity: 1,
                  unitPrice: totalAmount,
                  totalPrice: totalAmount,
                },
              ],
              totalAmount,
              paymentMethod: 'pix',
              paymentStatus: isPast ? 'paid' : 'pending',
              orderStatus: isPast ? 'finished' : isToday ? 'ready' : 'received',
              notes: text,
              createdAt: `${scheduledDate}T10:00:00Z`,
              partnerInfo: {
                eventName: customerName,
                packageType: productName,
                rawText: text,
              },
            });
          }
        }
      }
    }
  });

  return extractedOrders;
}

export async function POST(req: Request) {
  try {
    // Força execução dinâmica a cada requisição
    await headers();

    let targetUrl = 'https://1drv.ms/x/c/1dcf1d98d91734e3/IQD6LZZ9z3GgRo6JIjmZgIO-Aa5LkiAyDBoEIi_pjRhzpfY?e=nMnlHm';

    try {
      const body = await req.json();
      if (body && body.spreadsheetUrl) {
        targetUrl = body.spreadsheetUrl;
      }
    } catch {}

    const buffer = await downloadOneDriveBuffer(targetUrl);
    const orders = parseWorkbookOrders(buffer);

    return NextResponse.json(
      {
        success: true,
        count: orders.length,
        orders,
        message: `Sincronização concluída com sucesso! ${orders.length} encomendas extraídas diretamente do link do OneDrive.`,
        syncedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Erro na sincronização automática do OneDrive:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Falha ao sincronizar com o link do OneDrive.',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  }
}

export async function GET() {
  return POST(new Request('http://localhost:3000/api/partner/sync-onedrive', { method: 'POST' }));
}
