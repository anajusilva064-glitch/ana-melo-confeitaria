import QRCode from 'qrcode';
import pino from 'pino';
import path from 'path';
import fs from 'fs';
import os from 'os';
import makeWASocket, {
  DisconnectReason,
  initAuthCreds,
  BufferJSON,
  proto,
} from '@whiskeysockets/baileys';

// Tipos para estado interno do WhatsApp
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

// Mantém estado global na memória do processo Node.js entre hot reloads
const globalKey = Symbol.for('ana_melo_whatsapp_baileys_state_v2');
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

function getAuthFilePath(): string {
  try {
    const localPath = path.join(process.cwd(), 'whatsapp_auth.json');
    fs.accessSync(process.cwd(), fs.constants.W_OK);
    return localPath;
  } catch {
    return path.join(os.tmpdir(), 'ana_melo_wa_auth.json');
  }
}

/**
 * Lê credenciais persistidas serializadas com BufferJSON
 */
export function getWhatsappAuth(): { json: string | null; updatedAt: number } | null {
  try {
    const localPath = getAuthFilePath();
    if (fs.existsSync(localPath)) {
      const content = fs.readFileSync(localPath, 'utf-8');
      if (content && content.trim().startsWith('{')) {
        return JSON.parse(content);
      }
    }
    const tmpPath = path.join(os.tmpdir(), 'ana_melo_wa_auth.json');
    if (fs.existsSync(tmpPath)) {
      const content = fs.readFileSync(tmpPath, 'utf-8');
      if (content && content.trim().startsWith('{')) {
        return JSON.parse(content);
      }
    }
  } catch (err: any) {
    console.warn('[WhatsApp Auth] Aviso ao ler credenciais salvas:', err?.message);
  }
  return null;
}

/**
 * Salva credenciais persistidas serializadas com BufferJSON
 */
export async function salvarWhatsappAuth(authObj: { json: string; updatedAt: number }) {
  try {
    const content = JSON.stringify(authObj);
    const mainPath = getAuthFilePath();
    fs.writeFileSync(mainPath, content, 'utf-8');

    try {
      const tmpPath = path.join(os.tmpdir(), 'ana_melo_wa_auth.json');
      if (tmpPath !== mainPath) {
        fs.writeFileSync(tmpPath, content, 'utf-8');
      }
    } catch {}
  } catch (err: any) {
    console.warn('[WhatsApp Auth] Aviso ao salvar credenciais:', err?.message);
  }
}

/**
 * Limpa credenciais salvas ao desconectar explicitamente
 */
export async function limparWhatsappAuth() {
  try {
    const mainPath = getAuthFilePath();
    if (fs.existsSync(mainPath)) {
      fs.unlinkSync(mainPath);
    }
    const tmpPath = path.join(os.tmpdir(), 'ana_melo_wa_auth.json');
    if (fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath);
    }
  } catch (err: any) {
    console.warn('[WhatsApp Auth] Aviso ao limpar credenciais:', err?.message);
  }
}

/**
 * Normaliza número de telefone brasileiro para formato WhatsApp internacional
 */
export function normalizarNumeroWhatsApp(valor: string): string {
  if (!valor) return '';
  let digitos = String(valor).replace(/\D+/g, '');
  digitos = digitos.replace(/^0+/, '');
  if (!digitos || digitos.length < 10) return '';
  // Se tiver 10 ou 11 dígitos (DDD + Número no Brasil), adiciona o DDI 55
  if (digitos.length === 10 || digitos.length === 11) {
    digitos = '55' + digitos;
  }
  return digitos;
}

/**
 * Cria AuthState serializado com BufferJSON (mesma arquitetura do Cotafácil)
 */
function criarAuthStateCustomizado() {
  const rawSalvo = getWhatsappAuth();
  let parsed: any = null;

  if (rawSalvo && typeof rawSalvo === 'object' && rawSalvo.json) {
    try {
      parsed = JSON.parse(rawSalvo.json, BufferJSON.reviver);
    } catch (e: any) {
      console.warn('[WhatsApp] Aviso ao restaurar sessão salva:', e?.message);
    }
  }

  const creds = parsed && parsed.creds ? parsed.creds : initAuthCreds();
  const keys = parsed && parsed.keys ? parsed.keys : {};

  const agendarPersistencia = async () => {
    try {
      // Limitar quantidade de pre-keys antigas para manter o JSON enxuto
      if (keys['pre-key'] && Object.keys(keys['pre-key']).length > 35) {
        const todas = Object.keys(keys['pre-key']);
        const remover = todas.slice(0, todas.length - 35);
        remover.forEach((k) => delete keys['pre-key'][k]);
      }

      const serializado = JSON.stringify({ creds, keys }, BufferJSON.replacer);
      await salvarWhatsappAuth({ json: serializado, updatedAt: Date.now() });
    } catch (e: any) {
      console.warn('[WhatsApp] Aviso ao serializar auth state:', e?.message);
    }
  };

  return {
    state: {
      creds,
      keys: {
        get: async (type: string, ids: string[]) => {
          const data: any = {};
          for (const id of ids) {
            let value = keys[type] ? keys[type][id] : undefined;
            if (value && type === 'app-state-sync-key' && proto?.Message?.AppStateSyncKeyData) {
              value = proto.Message.AppStateSyncKeyData.fromObject(value);
            }
            if (value) {
              data[id] = value;
            }
          }
          return data;
        },
        set: async (data: any) => {
          for (const category in data) {
            if (!keys[category]) keys[category] = {};
            for (const id in data[category]) {
              const value = data[category][id];
              if (value) {
                keys[category][id] = value;
              } else {
                delete keys[category][id];
              }
            }
          }
          if (waState.saveTimeout) clearTimeout(waState.saveTimeout);
          waState.saveTimeout = setTimeout(async () => {
            await agendarPersistencia();
          }, 1000);
        },
      },
    },
    saveCreds: async () => {
      await agendarPersistencia();
    },
    temCredenciaisSalvas: Boolean(parsed && parsed.creds && parsed.creds.me),
  };
}

/**
 * Consulta no WhatsApp o JID real da conta brasileira (com ou sem o 9º dígito)
 */
async function resolverJidParaNumero(sock: any, numeroLimpo: string): Promise<string> {
  let jid = `${numeroLimpo}@s.whatsapp.net`;
  try {
    const [result] = await sock.onWhatsApp(numeroLimpo);
    if (result && result.exists && result.jid) {
      jid = result.jid;
    }
  } catch (e: any) {
    console.warn('[WhatsApp] Consulta onWhatsApp falhou, usando jid padrao:', e?.message);
  }
  return jid;
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
    await limparWhatsappAuth();
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

  const { state, saveCreds } = criarAuthStateCustomizado();

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
          console.error('[WhatsApp] Erro ao converter QR em imagem:', err?.message);
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
        console.log(`[WhatsApp] Socket fechado (código ${statusCode}). Preservando credenciais salvas.`);

        // Preserva credenciais e tenta reconectar em background
        waState.sock = null;
        waState.status = 'CONECTANDO';
        clearTimeout(timer);
        resolve();

        setTimeout(() => {
          if (waState.status !== 'CONECTADO') {
            iniciarConexaoWhatsApp({ forcarNovoQr: false, timeoutMs: 5000 }).catch(() => {});
          }
        }, 1500);
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
  const authSalva = getWhatsappAuth();
  const possuiSessaoSalva = Boolean(authSalva && authSalva.json);

  let numeroSalvo = waState.numeroConectado;
  if (!numeroSalvo && possuiSessaoSalva && authSalva?.json) {
    try {
      const m = authSalva.json.match(/"me"\s*:\s*\{\s*"id"\s*:\s*"([^":@]+)/);
      if (m && m[1]) numeroSalvo = m[1];
    } catch {}
  }

  // Se existe sessão salva mas o socket não está ativo, reconecta automaticamente em background
  if (possuiSessaoSalva && waState.status !== 'CONECTADO' && waState.status !== 'CONECTANDO') {
    iniciarConexaoWhatsApp({ forcarNovoQr: false, timeoutMs: 5000 }).catch(() => {});
  }

  const isConectado = waState.status === 'CONECTADO' || (possuiSessaoSalva && waState.status !== 'QR_PRONTO');
  const qr = isConectado ? null : waState.qrCodeDataUrl;

  return {
    success: true,
    status: isConectado ? 'CONECTADO' : waState.status,
    connected: isConectado,
    conectado: isConectado,
    possuiSessaoSalva,
    qrCode: qr,
    qrCodeDataUrl: qr,
    numeroConectado: numeroSalvo || (possuiSessaoSalva ? 'WhatsApp Pareado' : null),
    nomeConectado: waState.nomeConectado || 'Ana Melo Confeitaria',
    ultimoErro: waState.ultimoErro || null,
  };
}

/**
 * Desconecta o WhatsApp e apaga a sessão
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

  await limparWhatsappAuth();

  return obterStatusWhatsApp();
}

/**
 * Garante que o socket está ativo antes de disparar uma mensagem (incluindo tolerância a handshake 515)
 */
async function garantirSocketPronto(): Promise<any> {
  if (waState.sock && waState.status === 'CONECTADO') {
    return waState.sock;
  }

  const authSalva = getWhatsappAuth();
  if (!authSalva || !authSalva.json) {
    throw new Error('Nenhum WhatsApp conectado. Por favor, leia o QR Code na aba de configurações para conectar seu número.');
  }

  await iniciarConexaoWhatsApp({ forcarNovoQr: false, timeoutMs: 8000 });

  if (waState.sock && waState.status === 'CONECTADO') {
    return waState.sock;
  }

  // Aguardar até 3 segundos caso esteja finalizando o handshake rotineiro 515 após leitura do QR Code
  for (let i = 0; i < 6; i++) {
    await new Promise((r) => setTimeout(r, 500));
    if (waState.sock && waState.status === 'CONECTADO') {
      return waState.sock;
    }
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

    const cleanPhone = normalizarNumeroWhatsApp(telefone);
    if (!cleanPhone) {
      return { success: false, error: 'Número de telefone inválido. Informe com DDD (ex: 44999739472).' };
    }

    const jid = await resolverJidParaNumero(sock, cleanPhone);
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
