/**
 * Gerador e Validador de Payload Pix Padrão Banco Central do Brasil (EMVCo)
 */

export type PixKeyType = 'phone' | 'cpf' | 'cnpj' | 'email' | 'random';

export type PixParams = {
  pixKey: string;
  keyType?: PixKeyType;
  merchantName: string;
  merchantCity?: string;
  amount: number;
  txId?: string;
};

/**
 * Formata a chave Pix para o padrão exigido pelo DICT / Banco Central
 * - Telefone: formato internacional E.164 (+5544999739472)
 * - CPF: 11 dígitos numéricos
 * - CNPJ: 14 dígitos numéricos
 * - E-mail: minúsculo e sem espaços
 * - Aleatória (EVP): sem espaços
 */
export function formatPixKey(rawKey: string, keyType?: PixKeyType): string {
  if (!rawKey) return '';
  const trimmed = rawKey.trim();

  // Se o tipo foi informado ou inferido
  if (keyType === 'phone' || (!keyType && /^[\d\s().+-]+$/.test(trimmed) && trimmed.replace(/\D/g, '').length >= 10 && trimmed.replace(/\D/g, '').length <= 13)) {
    const digits = trimmed.replace(/\D/g, '');
    // Se já tem o 55 no início e 12 ou 13 dígitos
    if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
      return `+${digits}`;
    }
    // DDD + 8 ou 9 dígitos (10 ou 11 dígitos)
    if (digits.length === 10 || digits.length === 11) {
      return `+55${digits}`;
    }
    // Caso já comece com +
    if (trimmed.startsWith('+')) {
      return `+${digits}`;
    }
    return `+55${digits}`;
  }

  if (keyType === 'cpf') {
    return trimmed.replace(/\D/g, '').slice(0, 11);
  }

  if (keyType === 'cnpj') {
    return trimmed.replace(/\D/g, '').slice(0, 14);
  }

  if (keyType === 'email' || trimmed.includes('@')) {
    return trimmed.toLowerCase();
  }

  if (keyType === 'random') {
    return trimmed;
  }

  return trimmed;
}

/**
 * Valida se a chave Pix está de acordo com as regras do Banco Central
 */
export function validatePixKey(rawKey: string, keyType: PixKeyType = 'phone'): {
  isValid: boolean;
  message: string;
  formattedKey: string;
} {
  if (!rawKey || !rawKey.trim()) {
    return { isValid: false, message: 'Chave Pix não informada.', formattedKey: '' };
  }

  const formatted = formatPixKey(rawKey, keyType);

  switch (keyType) {
    case 'phone': {
      const digits = formatted.replace(/\D/g, '');
      if (digits.length < 12 || digits.length > 13 || !formatted.startsWith('+55')) {
        return {
          isValid: false,
          message: 'Telefone deve conter DDD + Número (ex: 44 99973-9472).',
          formattedKey: formatted,
        };
      }
      return {
        isValid: true,
        message: `Chave celular válida (${formatted}).`,
        formattedKey: formatted,
      };
    }
    case 'cpf': {
      const digits = formatted.replace(/\D/g, '');
      if (digits.length !== 11) {
        return {
          isValid: false,
          message: 'CPF deve conter exatamente 11 dígitos.',
          formattedKey: formatted,
        };
      }
      return {
        isValid: true,
        message: `Chave CPF formatada: ${formatted}`,
        formattedKey: formatted,
      };
    }
    case 'cnpj': {
      const digits = formatted.replace(/\D/g, '');
      if (digits.length !== 14) {
        return {
          isValid: false,
          message: 'CNPJ deve conter exatamente 14 dígitos.',
          formattedKey: formatted,
        };
      }
      return {
        isValid: true,
        message: `Chave CNPJ formatada: ${formatted}`,
        formattedKey: formatted,
      };
    }
    case 'email': {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formatted)) {
        return {
          isValid: false,
          message: 'Endereço de e-mail inválido.',
          formattedKey: formatted,
        };
      }
      return {
        isValid: true,
        message: `Chave e-mail válida: ${formatted}`,
        formattedKey: formatted,
      };
    }
    case 'random': {
      if (formatted.length < 20) {
        return {
          isValid: false,
          message: 'Chave aleatória inválida (EVP do Banco Central).',
          formattedKey: formatted,
        };
      }
      return {
        isValid: true,
        message: `Chave aleatória válida.`,
        formattedKey: formatted,
      };
    }
  }
}

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-zA-Z0-9 ]/g, '') // apenas letras, numeros e espacos
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function calculateCRC16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Gera o payload oficial do Pix Padrão Banco Central do Brasil (EMVCo)
 */
export function generatePixPayload({
  pixKey,
  keyType,
  merchantName,
  merchantCity = 'UMUARAMA',
  amount,
  txId = '***',
}: PixParams): string {
  // 1. Formata e sanitiza a chave Pix
  const cleanKey = formatPixKey(pixKey, keyType);

  // 2. Normaliza nome e cidade (sem caracteres especiais ou acentos)
  const cleanName = (normalizeText(merchantName) || 'ANA MELO').slice(0, 25);
  let cleanCity = (normalizeText(merchantCity) || 'UMUARAMA').slice(0, 15);
  if (cleanCity.includes('PR')) {
    cleanCity = cleanCity.replace(/PR/g, '').trim() || 'UMUARAMA';
  }

  // 3. txId: Para QR Estático sem API Cob, o Banco Central determina usar '***' para máxima compatibilidade com todos os bancos
  const cleanTxId = txId === '***' || !txId
    ? '***'
    : (txId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || '***');

  // 4. Formata o valor com 2 casas decimais
  const formattedAmount = (amount || 0).toFixed(2);

  // 26 - Merchant Account Info (GUI + Chave)
  const gui = formatField('00', 'br.gov.bcb.pix');
  const key = formatField('01', cleanKey);
  const merchantAccountInfo = formatField('26', `${gui}${key}`);

  // 62 - Additional Data (txId)
  const txIdField = formatField('05', cleanTxId);
  const additionalData = formatField('62', txIdField);

  // Monta payload sem o CRC
  const rawPayload =
    formatField('00', '01') + // Format indicator
    merchantAccountInfo +
    formatField('52', '0000') + // Merchant category code
    formatField('53', '986') + // Moeda: BRL
    (amount > 0 ? formatField('54', formattedAmount) : '') + // Valor
    formatField('58', 'BR') + // País
    formatField('59', cleanName) + // Nome do recebedor
    formatField('60', cleanCity) + // Cidade
    additionalData +
    '6304'; // CRC16 placeholder

  const crc = calculateCRC16(rawPayload);
  return `${rawPayload}${crc}`;
}
