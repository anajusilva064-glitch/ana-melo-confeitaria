'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, formatDateTime, createWhatsAppLink } from '@/lib/utils';
import {
  Clock,
  Printer,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  MapPin,
  Calendar,
  X,
  Bell,
  Sparkles,
} from 'lucide-react';

const columns: { id: OrderStatus; title: string; color: string; badgeColor: string }[] = [
  { id: 'received', title: 'Novos Pedidos', color: 'border-[#D5BFA8] bg-[#FAF7F3]', badgeColor: 'bg-[#C69255] text-white' },
  { id: 'preparing', title: 'Em Produção', color: 'border-[#D5BFA8] bg-[#FAF7F3]', badgeColor: 'bg-[#7A5A43] text-white' },
  { id: 'ready', title: 'Pronto para Retirada', color: 'border-[#D5BFA8] bg-[#FAF7F3]', badgeColor: 'bg-[#3D1F0D] text-white' },
  { id: 'finished', title: 'Concluídos', color: 'border-[#D5BFA8] bg-[#FAF7F3]', badgeColor: 'bg-[#4A2810] text-white' },
];

export default function AdminPedidosKanbanPage() {
  const { orders, updateOrderStatus, settings } = useStore();
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [filterDate, setFilterDate] = useState<'all' | 'today'>('all');

  const [today, setToday] = useState('2026-11-17');
  React.useEffect(() => {
    setToday(new Date().toISOString().split('T')[0]);
  }, []);

  const filteredOrders = orders.filter((o) => {
    if (filterDate === 'today') {
      return o.scheduledDate === today || o.createdAt.startsWith(today);
    }
    return true;
  });

  const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
    received: 'preparing',
    preparing: 'ready',
    ready: 'finished',
    finished: null,
    cancelled: null,
  };

  const prevStatusMap: Record<OrderStatus, OrderStatus | null> = {
    received: null,
    preparing: 'received',
    ready: 'preparing',
    finished: 'ready',
    cancelled: null,
  };

  const handleNotifyCustomer = (order: Order) => {
    let msg = `Olá, *${order.customerName}*! Tudo bem?\n\n`;
    if (order.orderStatus === 'preparing') {
      msg += `Passando para avisar que sua encomenda *${order.orderNumber}* já está sendo preparada no ateliê da *${settings.storeName}*.`;
    } else if (order.orderStatus === 'ready') {
      msg += `Seu pedido *${order.orderNumber}* está pronto te esperando para retirada no ateliê!\nLocal: ${settings.address}`;
    } else if (order.orderStatus === 'finished') {
      msg += `Agradecemos a confiança com a *${settings.storeName}*! Esperamos que aprecie cada detalhe. Se puder, nos marque no Instagram: ${settings.instagram}`;
    } else {
      msg += `Confirmamos o recebimento do seu pedido *${order.orderNumber}* no valor de ${formatCurrency(order.totalAmount)}. Em breve iniciaremos a produção.`;
    }

    const link = createWhatsAppLink(order.customerPhone, msg);
    window.open(link, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Kanban de Pedidos & Cozinha
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Arraste os pedidos mentalmente ou avance os status com 1 clique para manter o ateliê organizado.
          </p>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-stone-200">
          <button
            onClick={() => setFilterDate('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterDate === 'all' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Todos os Pedidos ({orders.length})
          </button>
          <button
            onClick={() => setFilterDate('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filterDate === 'today' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Apenas Hoje
          </button>
        </div>
      </div>

      {/* Kanban Board (4 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colOrders = filteredOrders.filter((o) => o.orderStatus === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl border-2 p-3 space-y-3 min-h-[480px] flex flex-col ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1">
                <h3 className="font-serif text-xs sm:text-sm font-bold text-stone-900">
                  {col.title}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.badgeColor}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Order Cards */}
              <div className="space-y-3 flex-1">
                {colOrders.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-stone-400 italic">
                    Nenhum pedido aqui
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const nextStatus = nextStatusMap[order.orderStatus];
                    const prevStatus = prevStatusMap[order.orderStatus];

                    return (
                      <div
                        key={order.id}
                        className="p-4 rounded-xl bg-white border border-stone-200 shadow-xs hover:shadow-md transition-all space-y-3 text-stone-800"
                      >
                        {/* Order Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono text-xs font-bold text-stone-900">
                              {order.orderNumber}
                            </span>
                            <h4 className="font-serif text-sm font-bold text-stone-900">
                              {order.customerName}
                            </h4>
                          </div>
                          <span className="text-xs font-bold text-rose-600 font-sans">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>

                        {/* Delivery & Schedule Info */}
                        <div className="space-y-1 text-[11px] text-stone-600 border-y border-stone-100 py-2">
                          <div className="flex items-center gap-1.5 font-medium text-stone-700">
                            <Calendar className="w-3.5 h-3.5 text-rose-500" />
                            <span>
                              {order.scheduledDate.split('-').reverse().join('/')} às {order.scheduledTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-amber-500" />
                            <span>
                              {order.deliveryType === 'delivery'
                                ? `Entrega (${order.deliveryNeighborhood || 'Delivery'})`
                                : 'Retirada no Ateliê'}
                            </span>
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div className="space-y-1 text-xs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="leading-tight">
                              <span className="font-semibold text-stone-900">
                                {item.quantity}x {item.productName}
                              </span>
                              {item.customDetails && (
                                <div className="text-[10px] text-stone-500 pl-2 border-l border-rose-200 mt-0.5 space-y-0.5">
                                  {item.customDetails.size && <div>Tamanho: {item.customDetails.size}</div>}
                                  {item.customDetails.dough && <div>Massa: {item.customDetails.dough}</div>}
                                  {item.customDetails.fillings && (
                                    <div>Recheio: {item.customDetails.fillings.join(' + ')}</div>
                                  )}
                                  {item.customDetails.cakeMessage && (
                                    <div className="font-semibold text-rose-700">
                                      Topo: "{item.customDetails.cakeMessage}"
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Order Actions */}
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedOrderForPrint(order)}
                              title="Imprimir Comanda"
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleNotifyCustomer(order)}
                              title="Avisar no WhatsApp"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            {prevStatus && (
                              <button
                                onClick={() => updateOrderStatus(order.id, prevStatus)}
                                title="Voltar status"
                                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {nextStatus && (
                              <button
                                onClick={() => updateOrderStatus(order.id, nextStatus)}
                                className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors"
                              >
                                <span>Avançar</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comanda Térmica Modal */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="font-bold text-stone-900">COMANDA DE PRODUÇÃO</span>
              <button
                onClick={() => setSelectedOrderForPrint(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-1">
              <div className="font-bold text-base">{settings.storeName.toUpperCase()}</div>
              <div>PEDIDO {selectedOrderForPrint.orderNumber}</div>
              <div>{formatDateTime(selectedOrderForPrint.createdAt)}</div>
            </div>

            <div className="border-t border-dashed border-stone-300 pt-2 space-y-1">
              <div><strong>CLIENTE:</strong> {selectedOrderForPrint.customerName}</div>
              <div><strong>WHATSAPP:</strong> {selectedOrderForPrint.customerPhone}</div>
              <div>
                <strong>ENTREGA/RETIRADA:</strong>{' '}
                {selectedOrderForPrint.scheduledDate.split('-').reverse().join('/')} às{' '}
                {selectedOrderForPrint.scheduledTime}
              </div>
              <div>
                <strong>TIPO:</strong>{' '}
                {selectedOrderForPrint.deliveryType === 'delivery'
                  ? `DELIVERY (${selectedOrderForPrint.deliveryAddress} - ${selectedOrderForPrint.deliveryNeighborhood})`
                  : 'RETIRADA NO ATELIÊ'}
              </div>
            </div>

            <div className="border-t border-dashed border-stone-300 pt-2 space-y-2">
              <div className="font-bold">ITENS:</div>
              {selectedOrderForPrint.items.map((i, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-semibold">
                    <span>{i.quantity}x {i.productName}</span>
                    <span>{formatCurrency(i.totalPrice)}</span>
                  </div>
                  {i.customDetails && (
                    <div className="text-[10px] text-stone-600 pl-2">
                      {i.customDetails.size && <div>• {i.customDetails.size}</div>}
                      {i.customDetails.dough && <div>• Massa: {i.customDetails.dough}</div>}
                      {i.customDetails.fillings && <div>• Recheio: {i.customDetails.fillings.join(' + ')}</div>}
                      {i.customDetails.topping && <div>• Cobertura: {i.customDetails.topping}</div>}
                      {i.customDetails.cakeMessage && <div>• FRASE: "{i.customDetails.cakeMessage}"</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-dashed border-stone-300 pt-2 flex justify-between font-bold text-sm">
              <span>TOTAL:</span>
              <span>{formatCurrency(selectedOrderForPrint.totalAmount)}</span>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-stone-900 text-white font-sans text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Agora</span>
              </button>
              <button
                onClick={() => setSelectedOrderForPrint(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-sans text-xs font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
