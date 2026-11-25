'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, formatDateTime, isImmediateOrder, isScheduledOrder } from '@/lib/utils';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  TrendingUp,
  Boxes,
  Cake,
  ArrowUpRight,
  Plus,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { orders, ingredients, transactions, products } = useStore();

  // Métricas do dia
  const [today, setToday] = React.useState('2026-11-17');
  React.useEffect(() => {
    setToday(new Date().toISOString().split('T')[0]);
  }, []);
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(today));
  const todayRevenue = todayOrders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Pedidos separados: Pronta Entrega na cozinha vs Encomendas no Calendário
  const pendingKitchenOrders = orders.filter(
    (o) => isImmediateOrder(o) && (o.orderStatus === 'received' || o.orderStatus === 'preparing')
  );

  const pendingPreOrders = orders.filter(
    (o) => isScheduledOrder(o) && (o.orderStatus === 'received' || o.orderStatus === 'preparing')
  );

  const lowStockItems = ingredients.filter((i) => i.currentStock <= i.minStockAlert);

  const totalMonthlyIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalMonthlyExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalMonthlyIncome - totalMonthlyExpenses;

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Painel Geral do Ateliê
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Resumo em tempo real de vendas, pedidos e estoque da Ana Melo Doces.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/cardapio"
            className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Doce / Produto</span>
          </Link>
          <Link
            href="/admin/pedidos"
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Ver Kanban de Pedidos</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Vendas Hoje */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Faturamento Hoje</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-stone-900 font-sans">
              {formatCurrency(todayRevenue)}
            </span>
            <span className="block text-[11px] text-stone-400 mt-0.5">
              {todayOrders.length} pedido(s) hoje
            </span>
          </div>
        </div>

        {/* Pedidos na Cozinha (Pronta Entrega) */}
        <Link
          href="/admin/pedidos"
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3 hover:border-[#C69255] transition-all block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Cozinha (Pronta Entrega)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-stone-900 font-sans">
              {pendingKitchenOrders.length}
            </span>
            <span className="block text-[11px] text-amber-700 font-medium mt-0.5">
              {pendingKitchenOrders.length > 0 ? 'Requer preparo imediato' : 'Cozinha sem pendências'}
            </span>
          </div>
        </Link>

        {/* Encomendas no Calendário */}
        <Link
          href="/admin/encomendas-agenda"
          className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3 hover:border-[#C69255] transition-all block"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Encomendas Programadas</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Cake className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-stone-900 font-sans">
              {pendingPreOrders.length}
            </span>
            <span className="block text-[11px] text-rose-600 font-medium mt-0.5">
              Agendadas no Calendário
            </span>
          </div>
        </Link>

        {/* Lucro Líquido Acumulado */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Lucro Líquido Real</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span
              className={`text-2xl font-bold font-sans ${
                netProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'
              }`}
            >
              {formatCurrency(netProfit)}
            </span>
            <span className="block text-[11px] text-stone-400 mt-0.5">
              Receitas (-) Despesas
            </span>
          </div>
        </div>

        {/* Alertas de Estoque Baixo */}
        <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-500">Alertas de Estoque</span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                lowStockItems.length > 0
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-stone-50 text-stone-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-bold text-stone-900 font-sans">
              {lowStockItems.length}
            </span>
            <span className="block text-[11px] text-amber-600 font-medium mt-0.5">
              {lowStockItems.length > 0 ? 'Insumos precisando de compra' : 'Estoque equilibrado'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Pedidos Recentes & Alertas de Estoque */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pedidos Recentes (2 Cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Últimos Pedidos Recebidos
              </h2>
              <p className="text-xs text-stone-500">Atualizado automaticamente em tempo real</p>
            </div>
            <Link
              href="/admin/pedidos"
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>Ver Kanban Completo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-stone-100">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">{order.orderNumber}</span>
                    <span className="text-xs font-medium text-stone-700">• {order.customerName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isImmediateOrder(order)
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-purple-50 text-purple-800 border-purple-300'
                    }`}>
                      {isImmediateOrder(order) ? 'Pronta Entrega' : 'Encomenda'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.orderStatus === 'received'
                          ? 'bg-rose-100 text-rose-700'
                          : order.orderStatus === 'preparing'
                          ? 'bg-amber-100 text-amber-700'
                          : order.orderStatus === 'ready'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {order.orderStatus === 'received'
                        ? 'Novo'
                        : order.orderStatus === 'preparing'
                        ? 'Na Cozinha'
                        : order.orderStatus === 'ready'
                        ? 'Pronto'
                        : 'Entregue'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(', ')}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-stone-900 block font-sans">
                    {formatCurrency(order.totalAmount)}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {order.deliveryType === 'delivery' ? 'Entrega' : 'Retirada'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertas de Insumos & Estoque (1 Col) */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  Estoque Crítico
                </h2>
                <p className="text-xs text-stone-500">Insumos perto do fim</p>
              </div>
              <Link
                href="/admin/estoque"
                className="text-xs font-semibold text-rose-600 hover:text-rose-700"
              >
                Gerenciar
              </Link>
            </div>

            {lowStockItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400">
                Nenhum insumo em nível crítico no momento.
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-stone-900">{item.name}</div>
                      <div className="text-[11px] text-amber-800">
                        Restam: {item.currentStock} {item.unit} (Mínimo: {item.minStockAlert} {item.unit})
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase bg-amber-200/60 px-2 py-0.5 rounded-md">
                      Comprar
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F3] border border-[#E8D5C4] text-xs text-[#5A3821] space-y-2">
            <div className="font-bold text-[#3D1F0D] flex items-center gap-1.5">
              <Cake className="w-4 h-4 text-[#C69255]" />
              <span>Gestão de Produção Ana Melo</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[#7A5A43]">
              Acompanhar o estoque de insumos e embalagens de transporte com antecedência garante que nenhuma encomenda de fim de semana seja recusada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
