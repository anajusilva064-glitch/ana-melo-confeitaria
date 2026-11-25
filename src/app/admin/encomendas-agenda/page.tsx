'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, formatDateTime, isScheduledOrder } from '@/lib/utils';
import {
  Calendar as CalendarIcon,
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
  RefreshCw,
  ExternalLink,
  Plus,
  LayoutGrid,
  Columns3,
  FileSpreadsheet,
  Phone,
  AlertCircle,
  Tag,
  Ban,
  ShieldCheck,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { sendAutomaticWhatsAppNotification } from '@/lib/whatsapp';

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

const agendaColumns: { id: OrderStatus; title: string; color: string; badgeColor: string }[] = [
  { id: 'received', title: 'Agendadas (Aguardando Data)', color: 'border-[#D5BFA8] bg-[#FAF7F3]', badgeColor: 'bg-[#C69255] text-white' },
  { id: 'preparing', title: 'Em Produção', color: 'border-[#D5BFA8] bg-[#FAF7F3]', badgeColor: 'bg-[#7A5A43] text-white' },
  { id: 'ready', title: 'Prontas para Retirada', color: 'border-[#D5BFA8] bg-[#FAF7F3]', badgeColor: 'bg-[#3D1F0D] text-white' },
  { id: 'finished', title: 'Entregues / Concluídas', color: 'border-[#D5BFA8] bg-[#FAF7F3]', badgeColor: 'bg-emerald-700 text-white' },
];

export default function AdminEncomendasAgendaPage() {
  const {
    orders,
    updateOrderStatus,
    addOrder,
    syncPartnerSpreadsheet,
    settings,
    markOrderDepositPaid,
    markOrderRemainingPaid,
    addBlockedDate,
    removeBlockedDate,
  } = useStore();

  // Estados de Visualização
  const [viewMode, setViewMode] = useState<'calendar' | 'kanban'>('calendar');
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(10); // 10 = Novembro (0-indexed)

  // Filtros
  const [sourceFilter, setSourceFilter] = useState<'all' | 'partner_excel' | 'storefront'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDayOrders, setSelectedDayOrders] = useState<{ dateStr: string; orders: Order[] } | null>(null);

  // Modais e Ações
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  const [selectedOrderForPrint, setSelectedOrderForPrint] = useState<Order | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);

  // Formulário de Nova Encomenda
  const [newOrderForm, setNewOrderForm] = useState({
    customerName: '',
    customerPhone: '',
    scheduledDate: '2026-11-20',
    scheduledTime: '15:00',
    productName: 'Cento de Doces Gourmet de Festa (100 unidades)',
    totalAmount: 190.0,
    notes: '',
    source: 'partner_excel' as 'partner_excel' | 'storefront',
  });

  // Filtra encomendas com estrita separação:
  // Apenas pedidos agendados antecipadamente, bolos decorados e encomendas do parceiro
  const preOrders = useMemo(() => {
    return orders.filter((o) => {
      // Ignora completamente pedidos de pronta entrega imediata da cozinha
      if (!isScheduledOrder(o)) return false;

      const matchSource =
        sourceFilter === 'all'
          ? true
          : sourceFilter === 'partner_excel'
          ? o.source === 'partner_excel'
          : o.source !== 'partner_excel';

      const matchStatus = statusFilter === 'all' ? true : o.orderStatus === statusFilter;

      return matchSource && matchStatus;
    });
  }, [orders, sourceFilter, statusFilter]);

  // Contadores de Encomendas Agendadas
  const partnerOrdersCount = useMemo(
    () => orders.filter((o) => isScheduledOrder(o) && o.source === 'partner_excel').length,
    [orders]
  );
  const storefrontOrdersCount = useMemo(
    () => orders.filter((o) => isScheduledOrder(o) && o.source !== 'partner_excel').length,
    [orders]
  );

  // Navegação de Mês do Calendário
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(2026);
    setCurrentMonth(10); // Novembro
  };

  // Geração da Grade Mensal do Calendário
  const calendarGrid = useMemo(() => {
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Domingo
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const cells: {
      dayNumber: number | null;
      dateStr: string | null;
      isCurrentMonth: boolean;
      orders: Order[];
    }[] = [];

    // Células vazias do início (padding)
    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push({
        dayNumber: null,
        dateStr: null,
        isCurrentMonth: false,
        orders: [],
      });
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      const dayPadded = String(day).padStart(2, '0');
      const monthPadded = String(currentMonth + 1).padStart(2, '0');
      const dateStr = `${currentYear}-${monthPadded}-${dayPadded}`;

      const dayOrders = preOrders.filter((o) => o.scheduledDate === dateStr);

      cells.push({
        dayNumber: day,
        dateStr,
        isCurrentMonth: true,
        orders: dayOrders,
      });
    }

    // Preenche até múltiplo de 7 se necessário
    while (cells.length % 7 !== 0) {
      cells.push({
        dayNumber: null,
        dateStr: null,
        isCurrentMonth: false,
        orders: [],
      });
    }

    return cells;
  }, [currentYear, currentMonth, preOrders]);

  // Sincronização em Tempo Real com a Planilha do Parceiro (OneDrive)
  const handleSyncPartner = async () => {
    setIsSyncing(true);
    try {
      const res = await syncPartnerSpreadsheet();
      setSyncToast(res.message);
    } catch {
      setSyncToast('Erro ao consultar o link do OneDrive.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncToast(null), 5000);
    }
  };

  // Criação rápida de encomenda
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderForm.customerName.trim()) return;

    addOrder({
      customerName: newOrderForm.customerName,
      customerPhone: newOrderForm.customerPhone || 'Não informado',
      scheduledDate: newOrderForm.scheduledDate,
      scheduledTime: newOrderForm.scheduledTime,
      deliveryType: 'pickup',
      deliveryFee: 0,
      totalAmount: Number(newOrderForm.totalAmount) || 150.0,
      paymentMethod: 'pix',
      paymentStatus: 'paid',
      orderStatus: 'received',
      source: newOrderForm.source,
      notes: newOrderForm.notes,
      items: [
        {
          id: `it-${Date.now()}`,
          productId: 'prod-cento-tradicional',
          productName: newOrderForm.productName,
          quantity: 1,
          unitPrice: Number(newOrderForm.totalAmount) || 150.0,
          totalPrice: Number(newOrderForm.totalAmount) || 150.0,
        },
      ],
    });

    setIsAddModalOpen(false);
    setSyncToast('Nova encomenda adicionada com sucesso!');
    setTimeout(() => setSyncToast(null), 3000);
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
      {/* Toast Notification */}
      {syncToast && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-[#2E1609] text-[#FAF7F3] shadow-2xl border border-[#C69255] text-xs font-semibold flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#C69255]" />
          <span>{syncToast}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2E1609]">
              Agenda & Calendário de Encomendas
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EFE4D8] text-[#5A3821] text-[10px] font-bold tracking-wider uppercase">
              {preOrders.length} Encomendas
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7A5A43] mt-1">
            Planejamento visual diário com sincronização direta da planilha Excel compartilhada pelo parceiro.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-white border border-[#D5BFA8] p-1 shadow-2xs">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-[#2E1609] text-white shadow-xs'
                  : 'text-[#6E4F38] hover:text-[#2E1609]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Calendário</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#2E1609] text-white shadow-xs'
                  : 'text-[#6E4F38] hover:text-[#2E1609]'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
          </div>

          {/* Sync Partner Spreadsheet */}
          <button
            onClick={handleSyncPartner}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-[#7A4B1A] border border-amber-300 font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
            title="Sincronizar dados da planilha Excel do parceiro"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sincronizar Planilha ({partnerOrdersCount})</span>
          </button>

          {/* Open OneDrive Link */}
          {settings.partnerSpreadsheetUrl && (
            <a
              href={settings.partnerSpreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-white hover:bg-[#FAF7F3] border border-[#D5BFA8] text-[#5A3821] font-semibold text-xs flex items-center gap-1.5 transition-all"
              title="Abrir a planilha original do parceiro no Excel Online"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Abrir Excel</span>
              <ExternalLink className="w-3 h-3 text-[#8C6D53]" />
            </a>
          )}

          {/* New Order */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#2E1609] hover:bg-[#1A0B03] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Encomenda</span>
          </button>
        </div>
      </div>

      {/* Filter and Origin Badges */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#D5BFA8] shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-[#2E1609] uppercase tracking-wider text-[11px] mr-1">
            Origem:
          </span>
          <button
            onClick={() => setSourceFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              sourceFilter === 'all'
                ? 'bg-[#2E1609] text-white'
                : 'bg-[#FAF7F3] text-[#6E4F38] hover:bg-[#EFE4D8]'
            }`}
          >
            Todas as Encomendas ({orders.length})
          </button>
          <button
            onClick={() => setSourceFilter('partner_excel')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              sourceFilter === 'partner_excel'
                ? 'bg-amber-700 text-white'
                : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
            <span>Planilha Parceiro ({partnerOrdersCount})</span>
          </button>
          <button
            onClick={() => setSourceFilter('storefront')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              sourceFilter === 'storefront'
                ? 'bg-[#3D1F0D] text-white'
                : 'bg-[#FAF7F3] text-[#6E4F38] hover:bg-[#EFE4D8]'
            }`}
          >
            Loja Online Oficial ({storefrontOrdersCount})
          </button>
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-[#7A5A43]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>Entregue / Pronto</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>Em Produção</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#8C6D53]" />
            <span>Agendado</span>
          </span>
        </div>
      </div>

      {/* ======================= CALENDAR VIEW ======================= */}
      {viewMode === 'calendar' && (
        <div className="bg-white rounded-3xl border border-[#D5BFA8] shadow-sm overflow-hidden space-y-0">
          {/* Month Navigation Bar */}
          <div className="p-4 sm:p-6 bg-[#FAF7F3] border-b border-[#E8D5C4] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrevMonth}
                className="w-9 h-9 rounded-xl bg-white hover:bg-[#EFE4D8] border border-[#D5BFA8] flex items-center justify-center text-[#2E1609] transition-colors cursor-pointer"
                title="Mês Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2E1609] min-w-48 text-center sm:text-left">
                {monthNames[currentMonth]} {currentYear}
              </h2>
              <button
                onClick={handleNextMonth}
                className="w-9 h-9 rounded-xl bg-white hover:bg-[#EFE4D8] border border-[#D5BFA8] flex items-center justify-center text-[#2E1609] transition-colors cursor-pointer"
                title="Próximo Mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleToday}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#EFE4D8] border border-[#D5BFA8] text-xs font-semibold text-[#5A3821] transition-colors cursor-pointer"
            >
              Novembro Atual
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-[#E8D5C4] bg-[#F5EBE1] text-center py-2.5 text-[11px] font-bold text-[#6E4F38] uppercase tracking-wider">
            {weekDays.map((w, idx) => (
              <div key={idx} className={idx === 0 || idx === 6 ? 'text-amber-800' : ''}>
                {w}
              </div>
            ))}
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-[#E8D5C4] min-h-[550px]">
            {calendarGrid.map((cell, idx) => {
              const isToday =
                cell.dateStr === '2026-11-17' ||
                cell.dateStr === new Date().toISOString().split('T')[0];

              if (!cell.dayNumber) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="bg-[#FAF7F3]/40 min-h-[90px] p-1.5 sm:p-2 text-stone-300"
                  />
                );
              }

              const isBlocked = settings.blockedDates?.find((b) => b.date === cell.dateStr);

              return (
                <div
                  key={`day-${cell.dayNumber}`}
                  className={`min-h-[115px] p-1.5 sm:p-2.5 flex flex-col justify-between transition-colors group ${
                    isBlocked
                      ? 'bg-red-50/70 border-red-200'
                      : isToday
                      ? 'bg-amber-50/50'
                      : 'bg-white hover:bg-[#FAF7F3]/60'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs sm:text-sm font-bold rounded-lg w-7 h-7 flex items-center justify-center ${
                        isBlocked
                          ? 'bg-red-700 text-white shadow-xs'
                          : isToday
                          ? 'bg-[#2E1609] text-white shadow-xs'
                          : cell.orders.length > 0
                          ? 'text-[#2E1609] font-extrabold'
                          : 'text-[#8C6D53]'
                      }`}
                    >
                      {String(cell.dayNumber).padStart(2, '0')}
                    </span>

                    <div className="flex items-center gap-1">
                      {isBlocked ? (
                        <button
                          onClick={() => removeBlockedDate(isBlocked.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-700 hover:text-red-950 p-1 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                          title="Desbloquear esta data"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() => addBlockedDate(cell.dateStr!, 'Capacidade Esgotada')}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-100 text-red-600 transition-opacity cursor-pointer"
                          title="Bloquear esta data (Capacidade Esgotada)"
                        >
                          <Ban className="w-3 h-3" />
                        </button>
                      )}

                      {/* Quick Add on Date */}
                      <button
                        onClick={() => {
                          setNewOrderForm((prev) => ({
                            ...prev,
                            scheduledDate: cell.dateStr || '2026-11-20',
                          }));
                          setIsAddModalOpen(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-md hover:bg-[#EFE4D8] text-[#7A5A43] flex items-center justify-center transition-opacity cursor-pointer"
                        title={`Adicionar encomenda no dia ${cell.dayNumber}`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Blocked Date Badge */}
                  {isBlocked && (
                    <div className="mb-1.5 px-1.5 py-0.5 rounded-md bg-red-100 border border-red-300 text-red-900 text-[9px] font-bold flex items-center gap-1">
                      <Ban className="w-2.5 h-2.5 text-red-600 shrink-0" />
                      <span className="truncate">{isBlocked.reason || 'Agenda Fechada'}</span>
                    </div>
                  )}

                  {/* Day Orders Stack */}
                  <div className="flex-1 space-y-1.5 overflow-hidden">
                    {cell.orders.map((ord) => {
                      const isPartner = ord.source === 'partner_excel';
                      const isFinished = ord.orderStatus === 'finished';
                      const isReady = ord.orderStatus === 'ready';
                      const isPreparing = ord.orderStatus === 'preparing';

                      const statusDot = isFinished
                        ? 'bg-emerald-600'
                        : isReady
                        ? 'bg-blue-600'
                        : isPreparing
                        ? 'bg-amber-600'
                        : 'bg-[#8C6D53]';

                      return (
                        <div
                          key={ord.id}
                          onClick={() => setSelectedOrderDetails(ord)}
                          className={`p-1.5 rounded-xl border text-[10px] sm:text-[11px] leading-tight cursor-pointer transition-all hover:scale-102 hover:shadow-xs ${
                            isPartner
                              ? 'bg-amber-50 border-amber-200 text-amber-950'
                              : 'bg-[#FAF7F3] border-[#D5BFA8] text-[#2E1609]'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 min-w-0">
                            <span className="font-bold text-[#2E1609] truncate flex items-center gap-1 min-w-0 flex-1">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot}`} />
                              <span className="truncate">{ord.customerName}</span>
                            </span>
                            {isPartner && (
                              <span className="text-[8px] px-1 py-0.2 rounded-sm bg-amber-200/90 font-bold text-amber-900 shrink-0">
                                Planilha
                              </span>
                            )}
                          </div>

                          <div className="text-[9px] text-[#7A5A43] truncate mt-0.5 font-sans">
                            {ord.items[0]?.productName || ord.notes || 'Doces de Festa'}
                          </div>

                          {/* Se for 50% de sinal */}
                          {ord.paymentScheme === 'half_deposit' && (
                            <div className="mt-1 flex items-center gap-1 text-[8px] font-bold">
                              <span className={`px-1 py-0.2 rounded ${
                                ord.depositPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-200 text-amber-900'
                              }`}>
                                {ord.depositPaid ? 'Sinal 50% ✓' : 'Sinal 50% ⏳'}
                              </span>
                              {ord.remainingPaid && (
                                <span className="px-1 py-0.2 rounded bg-emerald-100 text-emerald-800">
                                  Restante ✓
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[9px] font-semibold text-[#5A3821] mt-1 pt-0.5 border-t border-black/5">
                            <span>{formatCurrency(ord.totalAmount)}</span>
                            <span className="opacity-75">{ord.scheduledTime}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================= KANBAN VIEW ======================= */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {agendaColumns.map((col) => {
            const columnOrders = preOrders.filter((o) => o.orderStatus === col.id);

            return (
              <div
                key={col.id}
                className="flex flex-col bg-white rounded-3xl border border-[#D5BFA8] shadow-2xs overflow-hidden"
              >
                {/* Column Header */}
                <div className="p-4 border-b border-[#E8D5C4] flex items-center justify-between bg-[#FAF7F3]">
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm font-bold text-[#2E1609]">
                      {col.title}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.badgeColor}`}>
                    {columnOrders.length}
                  </span>
                </div>

                {/* Orders List */}
                <div className="p-3.5 flex-1 space-y-3 overflow-y-auto max-h-[700px] bg-[#FAF7F3]/30">
                  {columnOrders.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#8C6D53] border-2 border-dashed border-[#E8D5C4] rounded-2xl">
                      Nenhuma encomenda nesta etapa.
                    </div>
                  ) : (
                    columnOrders.map((order) => {
                      const nextStatus = nextStatusMap[order.orderStatus];
                      const prevStatus = prevStatusMap[order.orderStatus];
                      const isPartner = order.source === 'partner_excel';

                      return (
                        <div
                          key={order.id}
                          className={`p-4 rounded-2xl border shadow-2xs space-y-3 transition-all hover:shadow-xs ${
                            isPartner
                              ? 'bg-amber-50/70 border-amber-200'
                              : 'bg-white border-[#D5BFA8]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[10px] font-bold text-[#7A5A43]">
                                  {order.orderNumber}
                                </span>
                                {isPartner ? (
                                  <span className="px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[9px] font-bold">
                                    Planilha Excel
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded-md bg-stone-100 text-[#5A3821] text-[9px] font-bold">
                                    Loja Oficial
                                  </span>
                                )}
                              </div>
                              <h4 className="font-serif text-sm font-bold text-[#2E1609] mt-0.5">
                                {order.customerName}
                              </h4>
                            </div>

                            <button
                              onClick={() => setSelectedOrderForPrint(order)}
                              className="p-1.5 rounded-lg hover:bg-[#EFE4D8] text-[#7A5A43] transition-colors"
                              title="Imprimir Ficha de Produção"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Data de Retirada */}
                          <div className="flex items-center gap-2 text-xs font-semibold text-[#5A3821] p-2 rounded-xl bg-white/80 border border-[#E8D5C4]">
                            <CalendarIcon className="w-3.5 h-3.5 text-[#C69255]" />
                            <span>
                              {order.scheduledDate.split('-').reverse().join('/')} às {order.scheduledTime}
                            </span>
                          </div>

                          {/* Resumo dos Itens */}
                          <div className="space-y-1 text-xs text-[#2E1609]">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="font-medium">
                                • {it.quantity}x {it.productName}
                              </div>
                            ))}
                            {order.notes && (
                              <div className="text-[11px] text-[#7A5A43] bg-white p-2 rounded-lg border border-[#E8D5C4] italic mt-1.5">
                                "{order.notes}"
                              </div>
                            )}
                          </div>

                          {/* Condição de Pagamento / Sinal */}
                          <div className="p-2 rounded-xl bg-white/90 border border-[#E8D5C4] text-[10px] space-y-1">
                            <div className="flex items-center justify-between text-[#7A5A43]">
                              <span className="font-semibold">
                                {order.paymentMethod === 'card_link' ? 'Cartão de Crédito' : 'Pix Direto'}
                              </span>
                              <span className="font-bold text-[#2E1609]">
                                {formatCurrency(order.totalAmount)}
                              </span>
                            </div>

                            {order.paymentScheme === 'half_deposit' ? (
                              <div className="flex items-center gap-1.5 pt-0.5 border-t border-[#F2E8DF]">
                                <span
                                  className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                                    order.depositPaid
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-900'
                                  }`}
                                >
                                  {order.depositPaid ? 'Sinal 50% Pago' : 'Sinal 50% Pendente'}
                                </span>
                                <span
                                  className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                                    order.remainingPaid
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-stone-100 text-stone-700'
                                  }`}
                                >
                                  {order.remainingPaid ? 'Restante Pago' : '50% na Véspera'}
                                </span>
                              </div>
                            ) : (
                              <div className="text-[9px] text-[#7A5A43]">
                                <span>Pagamento Integral (100%)</span>
                              </div>
                            )}
                          </div>

                          {/* Footer & Actions */}
                          <div className="pt-2 border-t border-[#E8D5C4] flex items-center justify-between text-xs">
                            <span className="font-serif font-bold text-sm text-[#2E1609]">
                              {formatCurrency(order.totalAmount)}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {prevStatus && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, prevStatus)}
                                  className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-semibold flex items-center gap-0.5 cursor-pointer"
                                  title="Voltar etapa"
                                >
                                  <ChevronLeft className="w-3 h-3" />
                                </button>
                              )}
                              {nextStatus && (
                                <button
                                  onClick={() => updateOrderStatus(order.id, nextStatus)}
                                  className="px-2.5 py-1 rounded-lg bg-[#2E1609] hover:bg-[#1A0B03] text-white text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                                  title="Avançar etapa"
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
      )}

      {/* ======================= ORDER DETAILS MODAL ======================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1108]/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-7 space-y-5 border border-[#D5BFA8] text-xs">
            <div className="flex items-center justify-between border-b border-[#E8D5C4] pb-3.5">
              <div>
                <span className="font-mono text-xs font-bold text-[#7A5A43]">
                  {selectedOrderDetails.orderNumber}
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2E1609]">
                  {selectedOrderDetails.customerName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="w-8 h-8 rounded-full hover:bg-[#EFE4D8] flex items-center justify-center text-[#7A5A43]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FAF7F3] border border-[#E8D5C4]">
              <div>
                <span className="text-[#8C6D53] text-[10px] block">Data de Retirada:</span>
                <span className="font-bold text-sm text-[#2E1609]">
                  {selectedOrderDetails.scheduledDate.split('-').reverse().join('/')} às{' '}
                  {selectedOrderDetails.scheduledTime}
                </span>
              </div>
              <div>
                <span className="text-[#8C6D53] text-[10px] block">Origem do Pedido:</span>
                <span className="font-bold text-sm text-[#2E1609]">
                  {selectedOrderDetails.source === 'partner_excel'
                    ? 'Planilha Excel (Parceiro)'
                    : 'Loja Online Oficial'}
                </span>
              </div>
            </div>

            {/* Itens */}
            <div className="space-y-2">
              <span className="font-bold text-xs uppercase tracking-wider text-[#6E4F38] block">
                Itens da Encomenda
              </span>
              <div className="p-3.5 rounded-xl border border-[#E8D5C4] bg-white space-y-2">
                {selectedOrderDetails.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between font-semibold text-xs">
                    <span>{it.quantity}x {it.productName}</span>
                    <span>{formatCurrency(it.totalPrice)}</span>
                  </div>
                ))}
                {selectedOrderDetails.notes && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 text-xs">
                    <strong>Observação do Parceiro:</strong> {selectedOrderDetails.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Detalhes Financeiros & Sinal 50% */}
            <div className="space-y-2">
              <span className="font-bold text-xs uppercase tracking-wider text-[#6E4F38] block">
                Controle de Pagamento & Sinal
              </span>

              <div className="p-3.5 rounded-2xl bg-[#FAF7F3] border border-[#E8D5C4] space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-[#2E1609]">
                    {selectedOrderDetails.paymentMethod === 'card_link' ? (
                      <>
                        <CreditCard className="w-4 h-4 text-[#C69255]" />
                        <span>Cartão de Crédito (Link Direto)</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4 text-[#C69255]" />
                        <span>Pix Direto ({settings.pixKey})</span>
                      </>
                    )}
                  </div>
                  <span className="font-bold text-[#2E1609] text-sm">
                    {formatCurrency(selectedOrderDetails.totalAmount)}
                  </span>
                </div>

                {selectedOrderDetails.paymentScheme === 'half_deposit' ? (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8D5C4]">
                    {/* Sinal 50% */}
                    <div className="p-2.5 rounded-xl bg-white border border-[#D5BFA8] space-y-1.5">
                      <div className="text-[10px] text-[#7A5A43] font-semibold">
                        Sinal de 50% (Reserva da Data):
                      </div>
                      <div className="font-bold text-sm text-[#2E1609]">
                        {formatCurrency(
                          selectedOrderDetails.depositAmount ?? selectedOrderDetails.totalAmount * 0.5
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = !selectedOrderDetails.depositPaid;
                          markOrderDepositPaid(selectedOrderDetails.id, nextVal);
                          setSelectedOrderDetails((prev) =>
                            prev ? { ...prev, depositPaid: nextVal } : null
                          );
                        }}
                        className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                          selectedOrderDetails.depositPaid
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        }`}
                      >
                        {selectedOrderDetails.depositPaid ? '✓ Sinal 50% Pago' : 'Marcar Sinal Pago'}
                      </button>
                    </div>

                    {/* Restante 50% */}
                    <div className="p-2.5 rounded-xl bg-white border border-[#D5BFA8] space-y-1.5">
                      <div className="text-[10px] text-[#7A5A43] font-semibold">
                        Restante na Véspera (50%):
                      </div>
                      <div className="font-bold text-sm text-[#2E1609]">
                        {formatCurrency(
                          selectedOrderDetails.remainingAmount ?? selectedOrderDetails.totalAmount * 0.5
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const nextVal = !selectedOrderDetails.remainingPaid;
                          markOrderRemainingPaid(selectedOrderDetails.id, nextVal);
                          setSelectedOrderDetails((prev) =>
                            prev ? { ...prev, remainingPaid: nextVal } : null
                          );
                        }}
                        className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                          selectedOrderDetails.remainingPaid
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                        }`}
                      >
                        {selectedOrderDetails.remainingPaid ? '✓ Restante Quitado' : 'Marcar Restante Pago'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-[#E8D5C4] flex items-center justify-between text-xs">
                    <span className="text-[#7A5A43]">Condição: Quitação Integral (100%)</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        selectedOrderDetails.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {selectedOrderDetails.paymentStatus === 'paid' ? 'Pago' : 'Aguardando Pagamento'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Status Change Buttons */}
            <div className="space-y-2">
              <span className="font-bold text-xs uppercase tracking-wider text-[#6E4F38] block">
                Alterar Status de Produção
              </span>
              <div className="grid grid-cols-4 gap-2">
                {agendaColumns.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => {
                      updateOrderStatus(selectedOrderDetails.id, col.id);
                      setSelectedOrderDetails((prev) => (prev ? { ...prev, orderStatus: col.id } : null));
                    }}
                    className={`p-2 rounded-xl text-[10px] font-bold text-center border transition-all cursor-pointer ${
                      selectedOrderDetails.orderStatus === col.id
                        ? 'bg-[#2E1609] text-white border-[#2E1609] shadow-xs'
                        : 'bg-[#FAF7F3] hover:bg-[#EFE4D8] border-[#D5BFA8] text-[#5A3821]'
                    }`}
                  >
                    {col.title.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-[#E8D5C4] flex items-center justify-between gap-3">
              <div className="font-serif font-bold text-base text-[#2E1609]">
                Total: {formatCurrency(selectedOrderDetails.totalAmount)}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedOrderForPrint(selectedOrderDetails);
                    setSelectedOrderDetails(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF7F3] border border-[#D5BFA8] text-[#2E1609] font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Ficha</span>
                </button>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-4 py-2 rounded-xl bg-[#2E1609] text-white font-semibold text-xs cursor-pointer"
                >
                  Concluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MODAL DE NOVA ENCOMENDA MANUAL ======================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1108]/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 space-y-4 border border-[#D5BFA8] text-xs">
            <div className="flex items-center justify-between border-b border-[#E8D5C4] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#2E1609]">
                Cadastrar Encomenda na Agenda
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-7 h-7 rounded-full hover:bg-[#EFE4D8] flex items-center justify-center text-[#7A5A43]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3.5">
              <div>
                <label className="block font-semibold text-[#2E1609] mb-1">Nome do Cliente / Evento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vanessa (Aniversário)"
                  value={newOrderForm.customerName}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, customerName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5BFA8] focus:border-[#2E1609] outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2E1609] mb-1">Data de Retirada</label>
                  <input
                    type="date"
                    required
                    value={newOrderForm.scheduledDate}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5BFA8] focus:border-[#2E1609] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2E1609] mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={newOrderForm.scheduledTime}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5BFA8] focus:border-[#2E1609] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#2E1609] mb-1">Valor Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newOrderForm.totalAmount}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, totalAmount: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#D5BFA8] focus:border-[#2E1609] outline-hidden font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2E1609] mb-1">Origem</label>
                  <select
                    value={newOrderForm.source}
                    onChange={(e) => setNewOrderForm({ ...newOrderForm, source: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D5BFA8] bg-white focus:border-[#2E1609] outline-hidden"
                  >
                    <option value="partner_excel">Planilha Parceiro (Excel)</option>
                    <option value="storefront">Loja Oficial</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2E1609] mb-1">Descrição / Sabores</label>
                <input
                  type="text"
                  placeholder="Ex: 120 UN doces de festa variados"
                  value={newOrderForm.productName}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, productName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5BFA8] focus:border-[#2E1609] outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2E1609] mb-1">Observações (opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: trocar ferrero por nesquik"
                  value={newOrderForm.notes}
                  onChange={(e) => setNewOrderForm({ ...newOrderForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5BFA8] focus:border-[#2E1609] outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-[#E8D5C4] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2E1609] hover:bg-[#1A0B03] text-white font-semibold cursor-pointer"
                >
                  Salvar Encomenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= IMPRESSÃO DE FICHA DE PRODUÇÃO ======================= */}
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
              <div>ORIGEM: {selectedOrderForPrint.source === 'partner_excel' ? 'PLANILHA PARCEIRO (EXCEL)' : 'LOJA OFICIAL'}</div>
            </div>

            <div className="border-t border-dashed border-stone-300 pt-2 space-y-1">
              <div><strong>CLIENTE:</strong> {selectedOrderForPrint.customerName}</div>
              <div><strong>CONTATO:</strong> {selectedOrderForPrint.customerPhone}</div>
              <div>
                <strong>DATA DE RETIRADA:</strong>{' '}
                {selectedOrderForPrint.scheduledDate.split('-').reverse().join('/')} às{' '}
                {selectedOrderForPrint.scheduledTime}
              </div>
              <div>
                <strong>LOCAL:</strong>{' '}
                {settings.showExactAddressPublicly
                  ? settings.address
                  : 'Ateliê em Umuarama - PR (Endereço enviado na confirmação)'}
              </div>
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
                </div>
              ))}
              {selectedOrderForPrint.notes && (
                <div className="text-[10px] bg-stone-100 p-2 rounded">
                  <strong>OBSERVAÇÕES:</strong> {selectedOrderForPrint.notes}
                </div>
              )}
            </div>

            <div className="border-t border-dashed border-stone-300 pt-2 flex justify-between font-bold text-sm">
              <span>TOTAL:</span>
              <span>{formatCurrency(selectedOrderForPrint.totalAmount)}</span>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-[#2E1609] text-white font-sans text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ficha</span>
              </button>
              <button
                onClick={() => setSelectedOrderForPrint(null)}
                className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-sans text-xs font-semibold cursor-pointer"
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
