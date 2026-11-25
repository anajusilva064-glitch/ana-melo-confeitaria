import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Order } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  if (!year || !month || !day) return dateString;
  return `${day}/${month}/${year}`;
}

export function formatDateTime(dateTimeString: string): string {
  if (!dateTimeString) return '';
  try {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateTimeString;
  }
}

export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function createWhatsAppLink(phone: string, message: string): string {
  const cleaned = cleanPhone(phone);
  const target = cleaned.startsWith('55') ? cleaned : `55${cleaned}`;
  return `https://wa.me/${target}?text=${encodeURIComponent(message)}`;
}

/**
 * Determina se um pedido é uma Encomenda Programada (Calendário de Encomendas).
 * Encomendas são:
 * - Pedidos agendados antecipadamente (isPreOrder = true)
 * - Pedidos sincronizados da planilha do parceiro (source = 'partner_excel' ou #EX-)
 * - Pedidos de bolos comemorativos e doces de festa (centos, pacotes de festa)
 */
export function isScheduledOrder(order: Order): boolean {
  if (order.source === 'partner_excel') return true;
  if (order.orderNumber?.startsWith('#EX-')) return true;
  if (order.isPreOrder) return true;

  // Checa itens de encomenda festiva
  const hasScheduledItems = order.items?.some((item) => {
    if (item.customDetails) return true;
    const name = item.productName?.toLowerCase() || '';
    const id = item.productId?.toLowerCase() || '';
    return (
      name.includes('cento') ||
      name.includes('meio cento') ||
      name.includes('pacote de doces') ||
      name.includes('pacote especial') ||
      name.includes('pacote a escolher') ||
      name.includes('festa') ||
      name.includes('aniversário') ||
      name.includes('decorado') ||
      name.includes('personalizado') ||
      id.includes('cento') ||
      id.includes('bolo')
    );
  });

  return Boolean(hasScheduledItems);
}

/**
 * Determina se um pedido é de Pronta Entrega (Cozinha Imediata / Delivery na hora).
 * São pedidos feitos durante o horário da loja para consumo imediato (fatias, potes, sobremesas prontas).
 */
export function isImmediateOrder(order: Order): boolean {
  return !isScheduledOrder(order);
}

