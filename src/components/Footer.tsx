'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Phone, MapPin, Clock } from 'lucide-react';
import { InstagramIcon } from '@/components/InstagramIcon';

export default function Footer() {
  const { settings } = useStore();

  return (
    <footer className="bg-[#2C1407] text-[#D8C4B2] pt-16 pb-12 border-t border-[#4A2810]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#3D1F0D]">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-[#5C3317] bg-[#3D1F0D]">
                <img
                  src="/logo-dark.jpg"
                  alt="Ana Melo Confeitaria"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-serif text-xl font-bold text-[#FAF7F3] block">
                  {settings.storeName}
                </span>
                <span className="text-[10px] text-[#C69255] tracking-widest uppercase font-medium">
                  Confeitaria Artesanal
                </span>
              </div>
            </div>
            <p className="text-[#B59F8B] text-xs sm:text-sm max-w-md leading-relaxed font-sans">
              Produções exclusivas de bolos decorados, brigadeiros nobres e sobremesas finas feitas sob encomenda com ingredientes de altíssima qualidade.
            </p>
          </div>

          {/* Contact & Address */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold text-[#FAF7F3] tracking-wide uppercase">
              Ateliê e Retirada
            </h3>
            <ul className="space-y-2.5 text-xs text-[#B59F8B]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C69255] shrink-0 mt-0.5" />
                <span>
                  {settings.showExactAddressPublicly
                    ? settings.address
                    : (settings.publicAddressText || 'Ateliê em Maringá - PR (Endereço para retirada enviado na confirmação)')}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C69255] shrink-0" />
                <a
                  href={`https://wa.me/5544999739472`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp: {settings.whatsapp}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <InstagramIcon className="w-4 h-4 text-[#C69255] shrink-0" />
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {settings.instagram}
                </a>
              </li>
              <li className="flex items-start gap-2.5 pt-1 text-[11px] text-[#A68F7B]">
                <Clock className="w-4 h-4 text-[#C69255] shrink-0 mt-0.5" />
                <span>{settings.businessHours}</span>
              </li>
            </ul>
          </div>

          {/* Direct Navigation */}
          <div className="space-y-3">
            <h3 className="font-serif text-sm font-semibold text-[#FAF7F3] tracking-wide uppercase">
              Informações
            </h3>
            <ul className="space-y-2 text-xs text-[#B59F8B]">
              <li>
                <Link href="#cardapio" className="hover:text-white transition-colors">
                  Cardápio
                </Link>
              </li>
              <li>
                <Link href="#encomendas" className="hover:text-white transition-colors">
                  Encomendas Personalizadas
                </Link>
              </li>
              <li>
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Acompanhar no Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#8A725E] gap-4">
          <p>© 2026 {settings.storeName}. Todos os direitos reservados.</p>
          <p>
            Retiradas com agendamento prévio no ateliê em Maringá - PR.
          </p>
        </div>
      </div>
    </footer>
  );
}
