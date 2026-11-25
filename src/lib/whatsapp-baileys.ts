import QRCode from 'qrcode';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';

// Tipos para estado interno do Baileys
export type WaStatus = 'DESCONECTADO' | 'CONECTANDO' | 'QR_PRONTO' | 'CONECTADO' | 'ERRO';

type WaGlobalState = {
  sock: any | null;
  status: WaStatus;
  qrRaw: string | null;
  qrCodeDataUrl: string | null;
  qrGeradoEm: number;
  numeroConectado: string | null;
  nomeConectado: string | null;
  ultimoErro: string | null;
  saveTimeout: any | null;
};

// Mantém estado global na memória do processo Node.js
const globalKey = Symbol.for('ana_melo_whatsapp_baileys_state');
const globalAny = global as any;

if (!globalAny[globalKey]) {
  globalAny[globalKey] = {
    sock: null,
    status: 'DESCONECTADO',
    qrRaw: null,
    qrCodeDataUrl: null,
    qrGeradoEm: 0,
    numeroConectado: null,
    nomeConectado: null,
    ultimoErro: null,
    saveTimeout: null,
  };
}

const waState: WaGlobalState = globalAny[globalKey];

function getSessionPath(): string {
  const dir = path.join(process.cwd(), '.whatsapp_auth');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Inicia ou retoma a conexão direta via Baileys com o WhatsApp
 */
export async function iniciarConexaoWhatsApp({
  forcarNovoQr = false,
  timeoutMs = 12000,
}: {
  forcarNovoQr?: boolean;
  timeoutMs?: number;
} = {}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const makeWASocketFn: any = (makeWASocket as any)?.default || makeWASocket;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const useMultiFileAuthStateFn: any = (useMultiFileAuthState as any)?.default || useMultiFileAuthState;

  const sessionPath = getSessionPath();

  if (forcarNovoQr) {
    try {
      if (waState.sock) {
        waState.sock.ev.removeAllListeners();
        waState.sock.end(undefined);
      }
    } catch {}
    waState.sock = null;
    waState.status = 'DESCONECTADO';
    waState.qrRaw = null;
    waState.qrCodeDataUrl = null;
    waState.numeroConectado = null;

    // Limpa credenciais locais para forçar novo emparelhamento
    try {
      if (fs.existsSync(sessionPath)) {
        fs.rmSync(sessionPath, { recursive: true, force: true });
      }
    } catch {}
  }

  // Se já estiver conectado, retorna status atual
  if (waState.sock && waState.status === 'CONECTADO') {
    return obterStatusWhatsApp();
  }

  // Se o QR Code atual foi gerado há menos de 40 segundos, reutiliza
  if (
    waState.sock &&
    waState.status === 'QR_PRONTO' &&
    waState.qrCodeDataUrl &&
    Date.now() - waState.qrGeradoEm < 40000
  ) {
    return obterStatusWhatsApp();
  }

  const { state, saveCreds } = await useMultiFileAuthStateFn(sessionPath);

  try {
    if (waState.sock) {
      waState.sock.ev.removeAllListeners();
      waState.sock.end(undefined);
    }
  } catch {}

  waState.status = 'CONECTANDO';
  waState.ultimoErro = null;

  const logger = pino({ level: 'silent' });
  const sock = makeWASocketFn({
    auth: state,
    logger,
    printQRInTerminal: false,
    browser: ['Ana Melo Confeitaria', 'Chrome', '124.0.0'],
    syncFullHistory: false,
    markOnlineOnConnect: false,
    connectTimeoutMs: 20000,
    defaultQueryTimeoutMs: 20000,
  });

  waState.sock = sock;

  const aguardarEvento = new Promise<void>((resolve) => {
    const timer = setTimeout(() => resolve(), timeoutMs);

    sock.ev.on('creds.update', async () => {
      await saveCreds();
    });

    sock.ev.on('connection.update', async (update: any) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        waState.qrRaw = qr;
        waState.qrGeradoEm = Date.now();
        waState.status = 'QR_PRONTO';
        try {
          waState.qrCodeDataUrl = await QRCode.toDataURL(qr, {
            width: 320,
            margin: 2,
            color: { dark: '#2E1609', light: '#FFFFFF' },
          });
        } catch (err: any) {
          console.error('Erro ao converter QR em imagem:', err?.message);
        }
        clearTimeout(timer);
        resolve();
      }

      if (connection === 'open') {
        waState.status = 'CONECTADO';
        waState.qrRaw = null;
        waState.qrCodeDataUrl = null;
        const meId = sock.user?.id ? String(sock.user.id).split(':')[0].split('@')[0] : '';
        waState.numeroConectado = meId || 'WhatsApp Conectado';
        waState.nomeConectado = sock.user?.name || 'Ana Melo Confeitaria';
        await saveCreds();
        clearTimeout(timer);
        resolve();
      }

      if (connection === 'close') {
        const statusCode = lastDisconnect?.error?.output?.statusCode || 0;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut;

        waState.sock = null;
        if (isLoggedOut) {
          waState.status = 'DESCONECTADO';
          waState.numeroConectado = null;
          waState.qrCodeDataUrl = null;
          try {
            if (fs.existsSync(sessionPath)) {
              fs.rmSync(sessionPath, { recursive: true, force: true });
            }
          } catch {}
        } else {
          // Queda momentânea, tenta reconectar silenciosamente
          waState.status = 'CONECTANDO';
          setTimeout(() => {
            if (waState.status !== 'CONECTADO') {
              iniciarConexaoWhatsApp({ forcarNovoQr: false, timeoutMs: 5000 }).catch(() => {});
            }
          }, 2000);
        }
        clearTimeout(timer);
        resolve();
      }
    });
  });

  await aguardarEvento;
  return obterStatusWhatsApp();
}

/**
 * Obtém o status da conexão do WhatsApp
 */
export async function obterStatusWhatsApp() {
  const sessionPath = getSessionPath();
  const possuiCredenciaisLocais = fs.existsSync(path.join(sessionPath, 'creds.json'));

  // Se existem credenciais salvas mas o socket não está ativo, tenta reconectar em background
  if (possuiCredenciaisLocais && waState.status !== 'CONECTADO' && waState.status !== 'CONECTANDO') {
    iniciarConexaoWhatsApp({ forcarNovoQr: false, timeoutMs: 5000 }).catch(() => {});
  }

  const isConectado = waState.status === 'CONECTADO';

  return {
    success: true,
    status: isConectado ? 'CONECTADO' : waState.status,
    connected: isConectado,
    possuiSessaoSalva: possuiCredenciaisLocais,
    qrCode: isConectado ? null : waState.qrCodeDataUrl,
    numeroConectado: waState.numeroConectado || (possuiCredenciaisLocais ? 'WhatsApp Pareado' : null),
    nomeConectado: waState.nomeConectado || 'Ana Melo Confeitaria',
    ultimoErro: waState.ultimoErro || null,
  };
}

/**
 * Desconecta o WhatsApp e apaga a sessão local
 */
export async function desconectarWhatsApp() {
  try {
    if (waState.sock) {
      await waState.sock.logout().catch(() => {});
      waState.sock.ev.removeAllListeners();
      waState.sock.end(undefined);
    }
  } catch {}

  waState.sock = null;
  waState.status = 'DESCONECTADO';
  waState.qrRaw = null;
  waState.qrCodeDataUrl = null;
  waState.numeroConectado = null;

  try {
    const sessionPath = getSessionPath();
    if (fs.existsSync(sessionPath)) {
      fs.rmSync(sessionPath, { recursive: true, force: true });
    }
  } catch {}

  return obterStatusWhatsApp();
}

/**
 * Garante que o socket está ativo antes de disparar uma mensagem
 */
async function garantirSocketPronto(): Promise<any> {
  if (waState.sock && waState.status === 'CONECTADO') {
    return waState.sock;
  }

  const sessionPath = getSessionPath();
  const temCreds = fs.existsSync(path.join(sessionPath, 'creds.json'));
  if (!temCreds) {
    throw new Error('Nenhum WhatsApp conectado. Por favor, leia o QR Code na aba de configurações para conectar seu número.');
  }

  await iniciarConexaoWhatsApp({ forcarNovoQr: false, timeoutMs: 8000 });

  if (waState.sock && waState.status === 'CONECTADO') {
    return waState.sock;
  }

  throw new Error('Não foi possível restabelecer conexão com o WhatsApp. Verifique se o aparelho está com internet.');
}

/**
 * Envia mensagem direta para o WhatsApp do cliente
 */
export async function enviarMensagemWhatsAppDireta(
  telefone: string,
  mensagem: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const sock = await garantirSocketPronto();

    // Limpa telefone e garante prefixo 55
    const cleanPhone = telefone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      return { success: false, error: 'Número de telefone inválido.' };
    }

    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const jid = `${formattedPhone}@s.whatsapp.net`;

    const res = await sock.sendMessage(jid, { text: mensagem });

    return {
      success: true,
      messageId: res?.key?.id || 'ok',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Falha ao enviar';
    console.error('[WhatsApp Direct] Erro no envio:', errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}
