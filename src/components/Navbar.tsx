'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { ShoppingBag, Phone } from 'lucide-react';
import { InstagramIcon } from '@/components/InstagramIcon';

export default function Navbar() {
  const { settings, cart, setIsCartOpen } = useStore();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F3]/95 backdrop-blur-md border-b border-[#E8D5C4]/60">
      {/* Top Notice Bar */}
      <div className="bg-[#3D1F0D] text-[#EFE4D8] text-[11px] py-1.5 px-4 text-center font-medium tracking-wide">
        <span>Produção sob encomenda com retirada no ateliê em Maringá • Pedidos antecipados</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-22 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-13 h-13 rounded-full overflow-hidden border border-[#D5BFA8] shadow-2xs group-hover:scale-102 transition-transform bg-[#F7F2EC]">
            <img
              src="/logo.jpg"
              alt="Ana Melo Confeitaria"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#3D1F0D] block leading-none">
              {settings.storeName}
            </span>
            <span className="text-[10px] sm:text-xs text-[#7A5A43] tracking-[0.18em] uppercase font-medium mt-1 block">
              Confeitaria Artesanal
            </span>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-[#5A3821]">
          <Link href="#cardapio" className="hover:text-[#3D1F0D] transition-colors">
            Cardápio
          </Link>
          <Link href="#encomendas" className="hover:text-[#3D1F0D] transition-colors">
            Encomendas Personalizadas
          </Link>
          <Link href="#sobre" className="hover:text-[#3D1F0D] transition-colors">
            O Ateliê
          </Link>
          <a
            href={settings.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#7A5A43] hover:text-[#3D1F0D] transition-colors"
          >
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>Instagram</span>
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3D1F0D] hover:bg-[#2C1407] text-[#FAF7F3] font-medium text-xs tracking-wide shadow-sm hover:shadow transition-all active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Sacola</span>
            {totalItems > 0 && (
              <span className="ml-1 w-5 h-5 rounded-full bg-[#C69255] text-white text-[11px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
