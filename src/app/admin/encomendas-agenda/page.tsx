'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  Calendar,
  Clock,
  Printer,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  MapPin,
  X,
  Send,
  Sparkles,
  Cake,
  Boxes,
  Check,
} from 'lucide-react';
import { sendAutomaticWhatsAppNotification, getWhatsAppNotificationMessage } from '@/lib/whatsapp';

const agendaColumns: { id: OrderStatus; title: string; color: string; badgeColor: string }[] = [
  { id: 'received', title: 'Agendadas (Aguardando Data)', color: 'border-[#D5BFA8] bg-[#FAF7F3]', badgeColor: 'bg-[#C69255] text-white' },
  { id: 'preparing', title: 'Em Produção Antecipada', color: 'border-[#D5BFA8] bg-[#FAF7F3]', badgeColor: 'bg-[#7A5A43] text-white' },
  { id: 'ready', title: 'Prontas para Retirada', color: 'border-[#D5BFA8] bg-[#FAF7F3]', badgeColor: 'bg-[#3D1F0D] text-white' },
  { id: 'finished', title: 'Entregues e Concluídas', color: 'border-[#D5BFA8] bg-[#FAF7F3]', badgeColor: 'bg-[#4A2810] text-white' },
];

export default function AdminEncomendasAgendaPage() {
  const { orders, updateOrderStatus, settings } = useStore();
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [notifyingOrderId, setNotifyingOrderId] = useState<string | null>(null);
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null);

  // Filtra apenas encomendas (pedidos sob encomenda agendados)
  const preOrders = useMemo(() => {
    return orders.filter((o) => {
      // Pedido com itens de personalização ou data agendada
      const hasCustom = o.items.some((i) => Boolean(i.customDetails));
      return o.isPreOrder || hasCustom || o.deliveryType === 'pickup';
    });
  }, [orders]);

  // Lista de datas únicas com encomendas
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(preOrders.map((o) => o.scheduledDate))).sort();
    return dates;
  }, [preOrders]);

  const filteredOrders = useMemo(() => {
    if (selectedDate === 'all') return preOrders;
    return preOrders.filter((o) => o.scheduledDate === selectedDate);
  }, [preOrders, selectedDate]);

  const handleNotifyCustomer = async (order: Order) => {
    setNotifyingOrderId(order.id);
    const result = await sendAutomaticWhatsAppNotification(
      order,
      order.orderStatus,
      settings.storeName,
      settings.address,
      settings.instagram
    );

    setNotifyingOrderId(null);
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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D1F0D]">
            Agenda e Calendário de Encomendas
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5A43] mt-1">
            Planejamento diário e semanal da produção de doces de festa e bolos comemorativos.
          </p>
        </div>

        {/* WhatsApp API Status Badge */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF7F3] border border-[#D5BFA8] text-xs font-semibold text-[#5A3821] self-start sm:self-auto">
          <Send className="w-3.5 h-3.5 text-[#C69255]" />
          <span>API WhatsApp: {settings.whatsappAutoNotify ? 'Notificações Ativas' : 'Manual'}</span>
        </div>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8D5C4] shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#3D1F0D] uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C69255]" />
            <span>Filtrar por Data de Retirada da Encomenda</span>
          </span>
          <span className="text-xs text-[#7A5A43] font-medium">
            {filteredOrders.length} encomenda(s) selecionada(s)
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedDate('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              selectedDate === 'all'
                ? 'bg-[#3D1F0D] text-[#FAF7F3]'
                : 'bg-[#FAF7F3] hover:bg-[#EFE4D8] text-[#5A3821] border border-[#D5BFA8]'
            }`}
          >
            Todas as Datas ({preOrders.length})
          </button>

          {availableDates.map((dateStr) => {
            const count = preOrders.filter((o) => o.scheduledDate === dateStr).length;
            const isSelected = selectedDate === dateStr;
            const [y, m, d] = dateStr.split('-');

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#3D1F0D] text-[#FAF7F3]'
                    : 'bg-[#FAF7F3] hover:bg-[#EFE4D8] text-[#5A3821] border border-[#D5BFA8]'
                }`}
              >
                <span>{`${d}/${m}/${y}`}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-white/20' : 'bg-[#E8D5C4] text-[#3D1F0D]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Kanban das Encomendas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
        {agendaColumns.map((col) => {
          const colOrders = filteredOrders.filter((o) => o.orderStatus === col.id);

          return (
            <div
              key={col.id}
              className={`rounded-2xl border p-3 space-y-3 min-h-[480px] flex flex-col ${col.color}`}
            >
              {/* Header da Coluna */}
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
                    Nenhuma encomenda nesta etapa
                  </div>
                ) : (
                  colOrders.map((order) => {
                    const nextStatus = nextStatusMap[order.orderStatus];
                    const prevStatus = prevStatusMap[order.orderStatus];
                    const isNotifying = notifyingOrderId === order.id;
                    const justNotified = notificationSuccess === order.id;

                    return (
                      <div
                        key={order.id}
                        className="p-4 rounded-xl bg-white border border-[#E8D5C4] shadow-xs hover:shadow-md transition-all space-y-3"
                      >
                        {/* Header do Pedido */}
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

                        {/* Data e Horário */}
                        <div className="space-y-1 text-[11px] text-[#5A3821] border-y border-[#F2E8DF] py-2">
                          <div className="flex items-center gap-1.5 font-semibold text-[#3D1F0D]">
                            <Calendar className="w-3.5 h-3.5 text-[#C69255]" />
                            <span>
                              Retirada: {order.scheduledDate.split('-').reverse().join('/')} às {order.scheduledTime}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#7A5A43]">
                            <MapPin className="w-3.5 h-3.5 text-[#A68F7B]" />
                            <span>{settings.address}</span>
                          </div>
                        </div>

                        {/* Detalhes dos Doces ou Bolos */}
                        <div className="space-y-1.5 text-xs">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="leading-tight">
                              <span className="font-semibold text-[#3D1F0D]">
                                {item.quantity}x {item.productName}
                              </span>

                              {/* Detalhes de Doces de Festa */}
                              {item.customDetails?.selectedFlavors && (
                                <div className="text-[10px] text-[#6B4B35] pl-2 border-l border-[#C69255] mt-1 space-y-0.5">
                                  <div className="font-bold text-[#3D1F0D]">Sabores Selecionados:</div>
                                  {item.customDetails.selectedFlavors.map((flv, i) => (
                                    <div key={i}>• {flv}</div>
                                  ))}
                                  {item.customDetails.wrapperType && (
                                    <div className="text-[#A68F7B] mt-0.5">
                                      Forminha: {item.customDetails.wrapperType}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Detalhes de Bolo */}
                              {item.customDetails?.size && (
                                <div className="text-[10px] text-[#6B4B35] pl-2 border-l border-[#C69255] mt-1 space-y-0.5">
                                  <div>Tamanho: {item.customDetails.size}</div>
                                  {item.customDetails.dough && <div>Massa: {item.customDetails.dough}</div>}
                                  {item.customDetails.fillings && (
                                    <div>Recheios: {item.customDetails.fillings.join(' + ')}</div>
                                  )}
                                  {item.customDetails.cakeMessage && (
                                    <div className="font-semibold text-[#3D1F0D]">
                                      Escrita: "{item.customDetails.cakeMessage}"
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Ações */}
                        <div className="pt-2 border-t border-[#F2E8DF] flex items-center justify-between gap-1 text-xs">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedOrderForPrint(order)}
                              title="Imprimir Ficha de Produção"
                              className="p-1.5 rounded-lg bg-[#FAF7F3] hover:bg-[#EFE4D8] text-[#3D1F0D]"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleNotifyCustomer(order)}
                              disabled={isNotifying}
                              title="Disparar Notificação WhatsApp"
                              className={`p-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                                justNotified
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-[#FAF7F3] hover:bg-[#EFE4D8] text-[#5A3821]'
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

      {/* Comanda / Ficha de Produção */}
      {selectedOrderForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1108]/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4 font-mono text-xs border border-[#D5BFA8]">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="font-bold text-[#3D1F0D]">FICHA DE PRODUÇÃO DE ENCOMENDA</span>
              <button onClick={() => setSelectedOrderForPrint(null)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <div className="text-center space-y-1">
              <div className="font-bold text-base">{settings.storeName.toUpperCase()}</div>
              <div>ENCOMENDA {selectedOrderForPrint.orderNumber}</div>
              <div>{formatDateTime(selectedOrderForPrint.createdAt)}</div>
            </div>

            <div className="border-t border-dashed border-stone-300 pt-2 space-y-1">
              <div><strong>CLIENTE:</strong> {selectedOrderForPrint.customerName}</div>
              <div><strong>WHATSAPP:</strong> {selectedOrderForPrint.customerPhone}</div>
              <div>
                <strong>DATA DE RETIRADA:</strong>{' '}
                {selectedOrderForPrint.scheduledDate.split('-').reverse().join('/')} às{' '}
                {selectedOrderForPrint.scheduledTime}
              </div>
              <div><strong>LOCAL:</strong> {settings.address}</div>
            </div>

            <div className="border-t border-dashed border-stone-300 pt-2 space-y-2">
              <div className="font-bold">ITENS E SABORES:</div>
              {selectedOrderForPrint.items.map((i, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="flex justify-between font-semibold">
                    <span>{i.quantity}x {i.productName}</span>
                    <span>{formatCurrency(i.totalPrice)}</span>
                  </div>
                  {i.customDetails?.selectedFlavors && (
                    <div className="text-[10px] pl-2 space-y-0.5">
                      {i.customDetails.selectedFlavors.map((flv, fIdx) => (
                        <div key={fIdx}>• {flv}</div>
                      ))}
                    </div>
                  )}
                  {i.customDetails?.cakeMessage && (
                    <div className="text-[10px] font-bold pl-2">
                      ESCRITA: "{i.customDetails.cakeMessage}"
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
                className="flex-1 py-2 rounded-xl bg-[#3D1F0D] text-white font-sans text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ficha</span>
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
