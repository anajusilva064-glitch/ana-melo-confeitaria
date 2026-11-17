'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Cake, Phone, MapPin, Camera, Clock, Heart } from 'lucide-react';

export default function Footer() {
  const { settings } = useStore();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-stone-800">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
                <Cake className="w-5 h-5 text-rose-400" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-white tracking-wide">
                {settings.storeName}
              </h2>
            </div>
            <p className="text-stone-400 text-sm max-w-md leading-relaxed">
              {settings.tagline} Produzimos bolos comemorativos, brigadeiros gourmet com chocolate nobre e sobremesas feitas com amor e os melhores ingredientes.
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs text-rose-300">
              <span className="flex items-center gap-1.5 bg-rose-950/60 border border-rose-800/60 px-3 py-1.5 rounded-full">
                ✨ 100% Artesanal & Fresco
              </span>
              <span className="flex items-center gap-1.5 bg-amber-950/60 border border-amber-800/60 px-3 py-1.5 rounded-full text-amber-300">
                🍫 Chocolate Nobre Belga
              </span>
            </div>
          </div>

          {/* Contact & Hours */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-white tracking-wide">
              Atendimento & Ateliê
            </h3>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-rose-400 shrink-0" />
                <span>WhatsApp: {settings.whatsapp}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Camera className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{settings.instagram}</span>
              </li>
              <li className="flex items-start gap-2.5 pt-1">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-xs">{settings.businessHours}</span>
              </li>
            </ul>
          </div>

          {/* Quick Links & Admin */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-white tracking-wide">
              Acesso Rápido
            </h3>
            <ul className="space-y-2 text-sm text-stone-400">
              <li>
                <Link href="#cardapio" className="hover:text-rose-400 transition-colors">
                  Cardápio Pronta Entrega
                </Link>
              </li>
              <li>
                <Link href="#encomendas" className="hover:text-rose-400 transition-colors">
                  Encomendar Bolo Personalizado
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-rose-400 transition-colors flex items-center gap-1.5">
                  Painel de Gestão (Ana Melo)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>© 2026 {settings.storeName}. Todos os direitos reservados.</p>
          <p className="flex items-center gap-1">
            Feito com <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> para os melhores momentos da sua família.
          </p>
        </div>
      </div>
    </footer>
  );
}
