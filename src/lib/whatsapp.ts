import { Order, OrderStatus } from '@/types';
import { formatCurrency } from '@/lib/utils';

export function getWhatsAppNotificationMessage(order: Order, newStatus: OrderStatus, storeName: string, storeAddress: string, storeInstagram: string): string {
  let msg = `Olá, *${order.customerName}*! Tudo bem?\n\n`;

  switch (newStatus) {
    case 'received':
      msg += `Confirmamos o recebimento da sua encomenda *${order.orderNumber}* no valor de ${formatCurrency(order.totalAmount)}.\n`;
      msg += `Data agendada para retirada: *${order.scheduledDate.split('-').reverse().join('/')}* às *${order.scheduledTime}*.\n`;
      msg += `Local: ${storeAddress}.\n`;
      msg += `Em breve nossa produção iniciará os preparativos!`;
      break;

    case 'preparing':
      msg += `Sua encomenda *${order.orderNumber}* já está sendo preparada no ateliê da *${storeName}* com todo carinho!\n`;
      msg += `Previsão de finalização conforme agendado para o dia *${order.scheduledDate.split('-').reverse().join('/')}*.`;
      break;

    case 'ready':
      msg += `Sua encomenda *${order.orderNumber}* está *PRONTA* e embalada te esperando para retirada no ateliê!\n\n`;
      msg += `📍 *Endereço de Retirada:* ${storeAddress}\n`;
      msg += `Horário agendado: ${order.scheduledTime}.\n`;
      msg += `Se precisar de algum ajuste de horário, por favor nos avise por aqui.`;
      break;

    case 'finished':
      msg += `Agradecemos imensamente a preferência pela *${storeName}*!\n`;
      msg += `Esperamos que sua celebração seja inesquecível e deliciosa. Se puder, tire uma foto e nos marque no Instagram: ${storeInstagram} ❤️`;
      break;

    case 'cancelled':
      msg += `Informamos que o pedido *${order.orderNumber}* foi cancelado. Se tiver qualquer dúvida, estamos à disposição.`;
      break;
  }

  return msg;
}

export async function sendAutomaticWhatsAppNotification(
  order: Order,
  newStatus: OrderStatus,
  storeName: string,
  storeAddress: string,
  storeInstagram: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const message = getWhatsAppNotificationMessage(order, newStatus, storeName, storeAddress, storeInstagram);

    const res = await fetch('/api/whatsapp/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: order.customerPhone,
        message,
        orderNumber: order.orderNumber,
        status: newStatus,
        customerName: order.customerName,
      }),
    });

    const data = await res.json();
    return { success: res.ok, error: data.error };
  } catch (err: any) {
    console.error('Falha ao disparar automação de WhatsApp:', err);
    return { success: false, error: err.message };
  }
}
