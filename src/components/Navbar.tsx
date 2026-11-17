'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ShoppingBag, Cake, Sparkles, LayoutDashboard, Clock } from 'lucide-react';

export default function Navbar() {
  const { settings, cart, setIsCartOpen } = useStore();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-400 to-amber-500 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
        <span>Frete grátis em compras acima de R$ {settings.freeDeliveryMinAmount.toFixed(2)} | Peça direto pelo site sem taxas!</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
            <Cake className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-rose-600 transition-colors">
              {settings.storeName}
            </h1>
            <p className="text-xs text-stone-500 font-sans tracking-wide">
              Doceria & Confeitaria Fina
            </p>
          </div>
        </Link>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
          <Link href="#cardapio" className="hover:text-rose-600 transition-colors">
            Cardápio
          </Link>
          <Link href="#encomendas" className="hover:text-rose-600 transition-colors">
            Monte sua Encomenda
          </Link>
          <Link href="#sobre" className="hover:text-rose-600 transition-colors">
            O Ateliê
          </Link>
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Aceitando Pedidos</span>
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Admin ERP Button */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors"
            title="Acessar Painel de Gestão"
          >
            <LayoutDashboard className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">Painel da Ana</span>
          </Link>

          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Minha Sacola</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-stone-900 text-xs font-bold flex items-center justify-center border-2 border-white shadow-xs">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
