'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  Printer,
  ChevronRight,
  ChevronLeft,
  Calendar,
  X,
  Send,
  Check,
  ArrowRight,
} from 'lucide-react';
import { sendAutomaticWhatsAppNotification } from '@/lib/whatsapp';

const columns: { id: OrderStatus; title: string; color: string; badgeColor: string }[] = [
  { id: 'received', title: 'Novos Pedidos', color: 'border-[#D5BFA8] bg-[#FAF7F3]', badgeColor: 'bg-[#C69255] text-white' },
  { id: 'preparing', title: 'Em Preparo / Montagem', color: 'border-[#D5BFA8] bg-[#FAF7F3]', badgeColor: 'bg-[#7A5A43] text-white' },
  { id: 'ready', title: 'Pronto para Retirada', color: 'border-[#D5BFA8] bg-[#FAF7F3]', badgeColor: 'bg-[#3D1F0D] text-white' },
  { id: 'finished', title: 'Concluídos', color: 'border-[#D5BFA8] bg-[#FAF7F3]', badgeColor: 'bg-[#4A2810] text-white' },
];

export default function AdminPedidosKanbanPage() {
  const { orders, updateOrderStatus, settings } = useStore();
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null);

  // Pedidos Pronta Entrega
  const immediateOrders = orders.filter((o) => !o.isPreOrder || !o.items.some((i) => Boolean(i.customDetails)));

  const handleNotifyCustomer = async (order: Order) => {
    const result = await sendAutomaticWhatsAppNotification(
      order,
      order.orderStatus,
      settings.storeName,
      settings.address,
      settings.instagram
    );

    if (result.success) {
      setNotificationSuccess(order.id);
      setTimeout(() => setNotificationSuccess(null), 2500);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D1F0D]">
            Kanban de Pedidos (Pronta Entrega)
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5A43] mt-1">
            Fila operacional para pedidos de consumo rápido e fatias prontas do ateliê.
          </p>
        </div>

        <Link
          href="/admin/encomendas-agenda"
          className="px-4 py-2.5 rounded-xl bg-[#3D1F0D] hover:bg-[#2C1407] text-[#FAF7F3] text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4 text-[#C69255]" />
          <span>Ver Agenda de Encomendas Programadas</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const colOrders = immediateOrders.filter((o) => o.orderStatus === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl border p-3 space-y-3 min-h-[480px] flex flex-col ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-1">
                <h3 className="font-serif text-xs sm:text-sm font-bold text-[#3D1F0D]">
                  {col.title}
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${col.badgeColor}`}>
                  {colOrders.length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-3 flex-1">
                {colOrders.length === 0 ? (
                  <div className="h-32 flex items-center justify-center text-xs text-[#A68F7B] italic">
                    Nenhum pedido aqui
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const nextStatus = nextStatusMap[order.orderStatus];
                    const prevStatus = prevStatusMap[order.orderStatus];
                    const justNotified = notificationSuccess === order.id;

                    return (
                      <div
                        key={order.id}
                        className="p-4 rounded-xl bg-white border border-[#E8D5C4] shadow-xs hover:shadow-md transition-all space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-mono text-xs font-bold text-[#3D1F0D]">
                              {order.orderNumber}
                            </span>
                            <h4 className="font-serif text-sm font-bold text-[#3D1F0D]">
                              {order.customerName}
                            </h4>
                          </div>
                          <span className="text-xs font-bold text-[#C69255] font-sans">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>

                        {/* Items */}
                        <div className="space-y-1 text-xs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="font-medium text-[#5A3821]">
                              {item.quantity}x {item.productName}
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="pt-2 border-t border-[#F2E8DF] flex items-center justify-between gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedOrderForPrint(order)}
                              title="Imprimir Comanda"
                              className="p-1.5 rounded-lg bg-[#FAF7F3] hover:bg-[#EFE4D8] text-[#3D1F0D]"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleNotifyCustomer(order)}
                              title="Enviar Notificação WhatsApp"
                              className={`p-1.5 rounded-lg flex items-center gap-1 ${
                                justNotified ? 'bg-emerald-100 text-emerald-800' : 'bg-[#FAF7F3] text-[#5A3821]'
                              }`}
                            >
                              {justNotified ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          <div className="flex items-center gap-1">
                            {prevStatus && (
                              <button
                                onClick={() => updateOrderStatus(order.id, prevStatus)}
                                className="p-1.5 rounded-lg bg-[#FAF7F3] text-[#7A5A43] hover:bg-[#EFE4D8]"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {nextStatus && (
                              <button
                                onClick={() => updateOrderStatus(order.id, nextStatus)}
                                className="px-2.5 py-1 rounded-lg bg-[#3D1F0D] hover:bg-[#2C1407] text-[#FAF7F3] text-[11px] font-semibold flex items-center gap-1"
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

      {/* Comanda Modal */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1108]/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4 font-mono text-xs border border-[#D5BFA8]">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="font-bold text-[#3D1F0D]">COMANDA DE BALCÃO</span>
              <button onClick={() => setSelectedOrderForPrint(null)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <div className="text-center space-y-1">
              <div className="font-bold text-base">{settings.storeName.toUpperCase()}</div>
              <div>PEDIDO {selectedOrderForPrint.orderNumber}</div>
              <div>{formatDateTime(selectedOrderForPrint.createdAt)}</div>
            </div>

            <div className="border-t border-dashed border-stone-300 pt-2 space-y-1">
              <div><strong>CLIENTE:</strong> {selectedOrderForPrint.customerName}</div>
              <div><strong>CONTATO:</strong> {selectedOrderForPrint.customerPhone}</div>
            </div>

            <div className="border-t border-dashed border-stone-300 pt-2 space-y-1">
              {selectedOrderForPrint.items.map((i, idx) => (
                <div key={idx} className="flex justify-between">
                  <span>{i.quantity}x {i.productName}</span>
                  <span>{formatCurrency(i.totalPrice)}</span>
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
                className="flex-1 py-2 rounded-xl bg-[#3D1F0D] text-white font-sans text-xs font-semibold"
              >
                Imprimir
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
