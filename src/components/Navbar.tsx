'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ShoppingBag, ArrowUpRight } from 'lucide-react';
import { InstagramIcon } from '@/components/InstagramIcon';

export default function Navbar() {
  const { settings, cart, setIsCartOpen } = useStore();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-6 pt-3 pb-2">
      <div className="max-w-7xl mx-auto rounded-2xl glass-panel shadow-sm px-4 sm:px-6 h-20 flex items-center justify-between transition-all">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#D5BFA8]/80 shadow-xs group-hover:scale-105 transition-all duration-300 bg-white shrink-0">
            <img
              src="/icon.jpg"
              alt="Ana Melo Confeitaria"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#2E1609] block leading-none group-hover:text-[#C69255] transition-colors">
              {settings.storeName}
            </span>
            <span className="text-[9px] sm:text-[10px] text-[#8C6D53] tracking-[0.2em] uppercase font-semibold mt-1 block">
              Confeitaria Artesanal
            </span>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-[11px] font-semibold uppercase tracking-widest text-[#6E4F38]">
          <Link
            href="#encomendas"
            className="hover:text-[#2E1609] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#C69255] hover:after:w-full after:transition-all"
          >
            Doces de Festa
          </Link>
          <Link
            href="#cardapio"
            className="hover:text-[#2E1609] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#C69255] hover:after:w-full after:transition-all"
          >
            Cardápio Completo
          </Link>
          <Link
            href="#sobre"
            className="hover:text-[#2E1609] transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#C69255] hover:after:w-full after:transition-all"
          >
            Retirada no Ateliê
          </Link>
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#8C6D53] hover:text-[#2E1609] transition-colors"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-[#C69255]" />
            <span>Instagram</span>
            <ArrowUpRight className="w-3 h-3 opacity-60" />
          </a>
        </nav>

        {/* Right Action: Cart */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl bg-[#2E1609] hover:bg-[#1F0E05] text-[#FAF7F3] font-medium text-xs tracking-wide shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-[#C69255]" />
            <span className="hidden sm:inline">Minha Sacola</span>
            <span className="sm:hidden">Sacola</span>
            {totalItems > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#C69255] text-white text-[10px] font-bold flex items-center justify-center animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
