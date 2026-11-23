/**
 * Gerador de Payload e QR Code Pix Padrão Banco Central (EMVCo)
 */

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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

export type PixParams = {
  pixKey: string;
  merchantName: string;
  merchantCity?: string;
  amount: number;
  txId?: string;
};

export function generatePixPayload({
  pixKey,
  merchantName,
  merchantCity = 'UMUARAMA',
  amount,
  txId = '***',
}: PixParams): string {
  // Limpa chave
  const cleanKey = pixKey.trim();
  const cleanName = normalizeText(merchantName).slice(0, 25);
  const cleanCity = normalizeText(merchantCity).slice(0, 15);
  const cleanTxId = (txId || '***').replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || '***';
  const formattedAmount = amount.toFixed(2);

  // 26 - Merchant Account Info
  const gui = formatField('00', 'br.gov.bcb.pix');
  const key = formatField('01', cleanKey);
  const merchantAccountInfo = formatField('26', `${gui}${key}`);

  // 62 - Additional Data (txId)
  const txIdField = formatField('05', cleanTxId);
  const additionalData = formatField('62', txIdField);

  // Monta payload sem o CRC
  const rawPayload =
    formatField('00', '01') + // Format
    merchantAccountInfo +
    formatField('52', '0000') + // Category code
    formatField('53', '986') + // BRL
    formatField('54', formattedAmount) + // Amount
    formatField('58', 'BR') + // Country
    formatField('59', cleanName) + // Merchant name
    formatField('60', cleanCity) + // Merchant city
    additionalData +
    '6304'; // CRC16 placeholder

  const crc = calculateCRC16(rawPayload);
  return `${rawPayload}${crc}`;
}
