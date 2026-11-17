'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Calendar,
  ExternalLink,
  ChevronRight,
  LogOut,
  Bell,
} from 'lucide-react';

const navItems = [
  { label: 'Visão Geral', href: '/admin', icon: LayoutDashboard },
  { label: 'Pedidos Pronta Entrega', href: '/admin/pedidos', icon: ClipboardList, badgeCountKey: 'received' },
  { label: 'Encomendas e Calendário', href: '/admin/encomendas-agenda', icon: Calendar },
  { label: 'Cardápio e Produtos', href: '/admin/cardapio', icon: UtensilsCrossed },
  { label: 'Sabores e Opções', href: '/admin/encomendas', icon: Cake },
  { label: 'Estoque de Insumos', href: '/admin/estoque', icon: Boxes, badgeCountKey: 'lowStock' },
  { label: 'Ficha Técnica e Custos', href: '/admin/ficha-tecnica', icon: Calculator },
  { label: 'Financeiro e Fluxo', href: '/admin/financeiro', icon: DollarSign },
  { label: 'Configurações & WhatsApp API', href: '/admin/configuracoes', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings, orders, ingredients } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    const auth = sessionStorage.getItem('ana_melo_admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push('/admin/login');
    }
  }, [pathname, router]);

  // Se estiver na tela de login, renderiza apenas o conteúdo de login sem sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Enquanto valida autenticação
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#1F1108] flex items-center justify-center text-[#D8C4B2] text-xs">
        Carregando painel de gestão...
      </div>
    );
  }

  // Se não autenticado
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    sessionStorage.removeItem('ana_melo_admin_auth');
    sessionStorage.removeItem('ana_melo_admin_user');
    router.push('/admin/login');
  };

  const receivedOrdersCount = orders.filter((o) => o.orderStatus === 'received').length;
  const lowStockCount = ingredients.filter((i) => i.currentStock <= i.minStockAlert).length;

  return (
    <div className="min-h-screen bg-[#F7F2EC] flex flex-col md:flex-row text-[#3D1F0D]">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#2C1407] text-[#D8C4B2] flex flex-col justify-between shrink-0 border-r border-[#4A2810]">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-[#3D1F0D] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-[#5C3317] bg-[#3D1F0D]">
              <img
                src="/logo-dark.jpg"
                alt="Ana Melo Confeitaria"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="font-serif text-sm font-bold text-white tracking-wide">
                {settings.storeName}
              </h2>
              <span className="text-[10px] text-[#C69255] uppercase tracking-widest font-medium">
                Gestão e Produção
              </span>
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
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C69255] text-white">
                    {receivedOrdersCount}
                  </span>
                );
              } else if (item.badgeCountKey === 'lowStock' && lowStockCount > 0) {
                badge = (
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#A67540] text-white">
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
                      ? 'bg-[#3D1F0D] text-[#C69255] border border-[#5C3317]'
                      : 'text-[#B59F8B] hover:text-white hover:bg-[#3D1F0D]/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C69255]' : 'text-[#8A725E]'}`} />
                  <span>{item.label}</span>
                  {badge}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-[#3D1F0D] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#3D1F0D]/80 hover:bg-[#3D1F0D] text-xs font-semibold text-[#D8C4B2] border border-[#4A2810] transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-[#C69255]" />
              <span>Ver Loja Externa</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[#7A5A43]" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#B59F8B] hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-[#E8D5C4] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#7A5A43]">
            <span>Painel</span>
            <ChevronRight className="w-3 h-3 text-[#A68F7B]" />
            <span className="font-semibold text-[#3D1F0D]">
              {navItems.find((n) => n.href === pathname)?.label || 'Visão Geral'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {receivedOrdersCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F3] border border-[#D5BFA8] text-xs text-[#3D1F0D] font-medium">
                <Bell className="w-3.5 h-3.5 text-[#C69255]" />
                <span>{receivedOrdersCount} novo(s) pedido(s)</span>
              </div>
            )}
            <div className="w-8 h-8 rounded-full overflow-hidden border border-[#D5BFA8]">
              <img src="/icon.jpg" alt="Ana Melo" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <div className="p-6 sm:p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
