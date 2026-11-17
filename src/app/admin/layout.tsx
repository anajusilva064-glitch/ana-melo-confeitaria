'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Cake,
  Boxes,
  Calculator,
  DollarSign,
  Settings,
  ExternalLink,
  ChevronRight,
  Bell,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { label: 'Visão Geral', href: '/admin', icon: LayoutDashboard },
  { label: 'Pedidos & Kanban', href: '/admin/pedidos', icon: ClipboardList, badgeCountKey: 'received' },
  { label: 'Cardápio & Produtos', href: '/admin/cardapio', icon: UtensilsCrossed },
  { label: 'Opções de Encomenda', href: '/admin/encomendas', icon: Cake },
  { label: 'Estoque & Insumos', href: '/admin/estoque', icon: Boxes, badgeCountKey: 'lowStock' },
  { label: 'Ficha Técnica & Custos', href: '/admin/ficha-tecnica', icon: Calculator },
  { label: 'Financeiro & Fluxo', href: '/admin/financeiro', icon: DollarSign },
  { label: 'Configurações', href: '/admin/configuracoes', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { settings, orders, ingredients } = useStore();

  const receivedOrdersCount = orders.filter((o) => o.orderStatus === 'received').length;
  const lowStockCount = ingredients.filter((i) => i.currentStock <= i.minStockAlert).length;

  return (
    <div className="min-h-screen bg-stone-100/70 flex flex-col md:flex-row text-stone-900">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-stone-900 text-stone-300 flex flex-col justify-between shrink-0 border-r border-stone-800">
        <div>
          {/* Brand / Ateliê Info */}
          <div className="p-6 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                <Cake className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <h2 className="font-serif text-sm font-bold text-white tracking-wide">
                  {settings.storeName}
                </h2>
                <span className="text-[11px] text-rose-400 font-medium">Gestão & Ateliê</span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              let badge = null;
              if (item.badgeCountKey === 'received' && receivedOrdersCount > 0) {
                badge = (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                    {receivedOrdersCount}
                  </span>
                );
              } else if (item.badgeCountKey === 'lowStock' && lowStockCount > 0) {
                badge = (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-900">
                    {lowStockCount}
                  </span>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                  {badge}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Link to Public Store */}
        <div className="p-4 border-t border-stone-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-xs font-semibold text-rose-300 border border-stone-700 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Cardápio Público</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
          </Link>
          <div className="text-[10px] text-stone-500 text-center">
            Ana Melo Doces ERP • v1.0 Funcional
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>Ateliê</span>
            <ChevronRight className="w-3 h-3" />
            <span className="font-semibold text-stone-900">
              {navItems.find((n) => n.href === pathname)?.label || 'Painel'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {receivedOrdersCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                <Bell className="w-3.5 h-3.5 text-rose-500 animate-bounce" />
                <span>{receivedOrdersCount} novo(s) pedido(s)</span>
              </div>
            )}
            <div className="w-8 h-8 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              AM
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
