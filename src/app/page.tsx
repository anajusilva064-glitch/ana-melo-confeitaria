'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import CustomOrderModal from '@/components/CustomOrderModal';
import { useStore } from '@/context/StoreContext';
import {
  Cake,
  ArrowRight,
  MapPin,
  Sparkles,
  Phone,
  CheckCircle,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { InstagramIcon } from '@/components/InstagramIcon';

export default function Home() {
  const { categories, products, settings, openCustomizer } = useStore();
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');

  const filteredProducts = products.filter((p) => {
    if (!p.isAvailable) return false;
    if (activeCategoryId === 'all') return true;
    return p.categoryId === activeCategoryId;
  });

  const sweetsProduct =
    products.find((p) => p.productType === 'sweets' && p.isCustomOrder) ||
    products.find((p) => p.name.toLowerCase().includes('cento') || p.name.toLowerCase().includes('doce')) ||
    products[0];

  const cakeProduct =
    products.find((p) => p.productType === 'cake' && p.isCustomOrder) ||
    products.find((p) => p.name.toLowerCase().includes('bolo')) ||
    products[1];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F3] text-[#2E1609] selection:bg-[#C69255] selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
          {/* Subtle warm glow blobs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#EFE4D8]/60 to-[#F5EBE1]/40 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Content */}
              <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
                <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 border border-[#D5BFA8]/80 text-[#6E4F38] text-xs font-semibold tracking-wide shadow-2xs backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-[#C69255] animate-pulse" />
                  <span>Confeitaria Artesanal • Maringá - PR</span>
                </div>

                <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold text-[#2E1609] tracking-tight leading-[1.12]">
                  Doces de festa e bolos feitos para encantar.
                </h1>

                <p className="text-base sm:text-lg text-[#7A5A43] max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans font-normal">
                  Especialistas em doces gourmet finos para eventos, centos tradicionais de aniversário e bolos comemorativos. Produção artesanal sob encomenda com retirada no ateliê.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  {sweetsProduct && (
                    <button
                      onClick={() => openCustomizer(sweetsProduct)}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#2E1609] hover:bg-[#1A0B03] text-[#FAF7F3] font-medium text-xs sm:text-sm tracking-wide shadow-lg shadow-[#2E1609]/15 transition-all duration-300 hover:scale-102 active:scale-98 flex items-center justify-center gap-2.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#C69255]" />
                      <span>Montar Cento de Doces</span>
                    </button>
                  )}

                  {cakeProduct && (
                    <button
                      onClick={() => openCustomizer(cakeProduct)}
                      className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-[#FAF7F3] border border-[#D5BFA8] text-[#2E1609] font-medium text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-2xs cursor-pointer hover:border-[#C69255]"
                    >
                      <Cake className="w-4 h-4 text-[#C69255]" />
                      <span>Personalizar Bolo</span>
                    </button>
                  )}
                </div>

                {/* Micro trust row */}
                <div className="pt-8 grid grid-cols-3 gap-6 border-t border-[#E8D5C4]/80 max-w-lg mx-auto lg:mx-0 text-left">
                  <div>
                    <span className="block font-serif text-lg sm:text-xl font-bold text-[#2E1609]">
                      Doces de Festa
                    </span>
                    <span className="text-[11px] text-[#8C6D53]">Gourmet e tradicionais</span>
                  </div>
                  <div>
                    <span className="block font-serif text-lg sm:text-xl font-bold text-[#2E1609]">
                      Sob Medida
                    </span>
                    <span className="text-[11px] text-[#8C6D53]">Montagem em lotes</span>
                  </div>
                  <div>
                    <span className="block font-serif text-lg sm:text-xl font-bold text-[#2E1609]">
                      No Ateliê
                    </span>
                    <span className="text-[11px] text-[#8C6D53]">Retirada agendada</span>
                  </div>
                </div>
              </div>

              {/* Right Showcase Card */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-sm sm:max-w-md">
                  {/* Decorative glowing card */}
                  <div className="relative rounded-3xl overflow-hidden border border-[#D5BFA8]/80 shadow-2xl bg-white p-7 flex flex-col items-center text-center space-y-6">
                    <div className="relative">
                      <div className="w-44 h-44 rounded-full overflow-hidden border-2 border-[#E8D5C4] shadow-md bg-[#FAF7F3]">
                        <img
                          src="/logo.jpg"
                          alt="Ana Melo Confeitaria"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute bottom-1 right-1 px-3 py-1 rounded-full bg-[#2E1609] text-[#FAF7F3] text-[10px] font-bold tracking-wider uppercase shadow-xs">
                        Ateliê
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h2 className="font-serif text-2xl font-bold text-[#2E1609]">
                        {settings.storeName}
                      </h2>
                      <p className="text-xs text-[#7A5A43] font-medium">
                        {settings.address}
                      </p>
                      <p className="text-xs font-semibold text-[#C69255]">
                        WhatsApp: {settings.whatsapp}
                      </p>
                    </div>

                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#FAF7F3] border border-[#D5BFA8] text-xs font-semibold text-[#2E1609] hover:bg-[#EFE4D8] transition-all hover:scale-101"
                    >
                      <InstagramIcon className="w-4 h-4 text-[#C69255]" />
                      <span>Seguir {settings.instagram}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TWO-COLUMN EXPERIENCE PROMO */}
        <section id="encomendas" className="py-14 bg-white border-y border-[#E8D5C4]/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card 1: Doces de Festa */}
              <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-[#2E1609] to-[#1F0E05] text-[#FAF7F3] flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden group">
                <div className="space-y-3 relative z-10">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#C69255] px-3 py-1 rounded-full bg-white/10 inline-block">
                    O Carro-Chefe do Ateliê
                  </span>
                  <h3 className="font-serif text-3xl font-bold text-white tracking-tight">
                    Centos e Caixas de Doces de Festa
                  </h3>
                  <p className="text-[#D8C4B2] text-xs sm:text-sm leading-relaxed max-w-md font-sans">
                    Monte sua mesa de doces com opções da Linha Gourmet (Belga 54%, Pistache com crocante, Ninho com Nutella) e Linha Tradicional (Brigadeiro, Beijinho, Bicho de pé, Dois amores e Cajuzinho).
                  </p>
                </div>

                {sweetsProduct && (
                  <button
                    onClick={() => openCustomizer(sweetsProduct)}
                    className="self-start px-7 py-3.5 rounded-xl bg-[#C69255] hover:bg-[#B8803F] text-white font-semibold text-xs tracking-wide shadow-md transition-all active:scale-95 cursor-pointer relative z-10 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Montar Encomenda de Doces</span>
                  </button>
                )}
              </div>

              {/* Card 2: Bolos */}
              <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF7F3] border border-[#D5BFA8] flex flex-col justify-between space-y-6 shadow-sm group">
                <div className="space-y-3">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-[#8C6D53] px-3 py-1 rounded-full bg-white inline-block border border-[#E8D5C4]">
                    Produção Artesanal
                  </span>
                  <h3 className="font-serif text-3xl font-bold text-[#2E1609] tracking-tight">
                    Bolos Comemorativos Personalizados
                  </h3>
                  <p className="text-[#6E4F38] text-xs sm:text-sm leading-relaxed max-w-md font-sans">
                    Aros 15, 20 ou 25 com massa fofinha amanteigada ou cacau 100%, recheio duplo artesanal e finalização espatulada ao seu gosto.
                  </p>
                </div>

                {cakeProduct && (
                  <button
                    onClick={() => openCustomizer(cakeProduct)}
                    className="self-start px-7 py-3.5 rounded-xl bg-[#2E1609] hover:bg-[#1A0B03] text-white font-semibold text-xs tracking-wide shadow-sm transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <Cake className="w-3.5 h-3.5 text-[#C69255]" />
                    <span>Personalizar Bolo</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* MENU / PRODUCTS SECTION */}
        <section id="cardapio" className="py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <span className="text-[11px] font-bold text-[#C69255] uppercase tracking-[0.2em]">
                Cardápio Oficial
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2E1609]">
                Doces, Bolos e Sobremesas
              </h2>
              <p className="text-xs sm:text-sm text-[#7A5A43]">
                Selecione uma categoria abaixo para explorar todas as produções disponíveis para encomenda.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                onClick={() => setActiveCategoryId('all')}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeCategoryId === 'all'
                    ? 'bg-[#2E1609] text-[#FAF7F3] shadow-sm'
                    : 'bg-white hover:bg-[#FAF7F3] text-[#6E4F38] border border-[#D5BFA8]'
                }`}
              >
                Todos ({products.filter((p) => p.isAvailable).length})
              </button>

              {categories.map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id && p.isAvailable).length;
                const isActive = activeCategoryId === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-[#2E1609] text-[#FAF7F3] shadow-sm'
                        : 'bg-white hover:bg-[#FAF7F3] text-[#6E4F38] border border-[#D5BFA8]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="ml-1.5 text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* HOW TO ORDER / EXPERIENCE STEPS */}
        <section id="sobre" className="py-20 bg-white border-t border-[#E8D5C4]/70">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-3">
              <span className="text-[11px] font-bold text-[#C69255] uppercase tracking-[0.2em]">
                Simples e Direto
              </span>
              <h2 className="font-serif text-3xl font-bold text-[#2E1609]">
                Como encomendar no ateliê
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-7 rounded-3xl bg-[#FAF7F3] border border-[#E8D5C4] space-y-3 relative">
                <span className="w-8 h-8 rounded-full bg-[#2E1609] text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h4 className="font-serif text-base font-bold text-[#2E1609]">
                  Monte seus Sabores
                </h4>
                <p className="text-xs text-[#7A5A43] leading-relaxed">
                  Escolha o pacote de doces (25, 50 ou 100 unidades) ou monte seu bolo comemorativo passo a passo.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-[#FAF7F3] border border-[#E8D5C4] space-y-3 relative">
                <span className="w-8 h-8 rounded-full bg-[#2E1609] text-white text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h4 className="font-serif text-base font-bold text-[#2E1609]">
                  Confirmação no WhatsApp
                </h4>
                <p className="text-xs text-[#7A5A43] leading-relaxed">
                  O pedido é enviado estruturado para o número (44) 99973-9472 para confirmação de horário e pagamento Pix.
                </p>
              </div>

              <div className="p-7 rounded-3xl bg-[#FAF7F3] border border-[#E8D5C4] space-y-3 relative">
                <span className="w-8 h-8 rounded-full bg-[#2E1609] text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h4 className="font-serif text-base font-bold text-[#2E1609]">
                  Retirada no Ateliê
                </h4>
                <p className="text-xs text-[#7A5A43] leading-relaxed">
                  No dia marcado, sua encomenda estará fresca e embalada na Rua Marcio Bacaraim Possebom 2082.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <CartDrawer />
      <CustomOrderModal />
    </div>
  );
}
