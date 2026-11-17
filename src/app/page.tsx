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
  Clock,
  ArrowRight,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
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

  const sweetsProduct = products.find((p) => p.productType === 'sweets' && p.isCustomOrder);
  const cakeProduct = products.find((p) => p.productType === 'cake' && p.isCustomOrder);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F3] text-[#3D1F0D]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-[#E8D5C4]/70 bg-gradient-to-b from-[#F7F2EC] to-[#FAF7F3]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Text */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE4D8] border border-[#D5BFA8] text-[#5A3821] text-xs font-medium tracking-wide">
                  <span>Confeitaria Artesanal • Maringá - PR</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#3D1F0D] tracking-tight leading-[1.15]">
                  Doces gourmet de festa e bolos feitos sob encomenda.
                </h1>

                <p className="text-sm sm:text-base text-[#6B4B35] max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
                  Especialistas em doces gourmet finos para eventos, clássicos tradicionais de aniversário e bolos comemorativos. Produção 100% artesanal com retirada agendada no ateliê.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  {sweetsProduct && (
                    <button
                      onClick={() => openCustomizer(sweetsProduct)}
                      className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#3D1F0D] hover:bg-[#2C1407] text-[#FAF7F3] font-medium text-xs sm:text-sm tracking-wide shadow-sm transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-[#C69255]" />
                      <span>Montar Cento de Doces</span>
                    </button>
                  )}

                  <a
                    href="#cardapio"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-[#F7F2EC] border border-[#D5BFA8] text-[#3D1F0D] font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>Ver Cardápio Completo</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>

                {/* Pillars */}
                <div className="pt-6 grid grid-cols-3 gap-6 border-t border-[#E8D5C4] max-w-md mx-auto lg:mx-0 text-left">
                  <div>
                    <span className="block font-serif text-base sm:text-lg font-bold text-[#3D1F0D]">
                      Doces de Festa
                    </span>
                    <span className="text-[11px] text-[#7A5A43]">Gourmet e tradicionais</span>
                  </div>
                  <div>
                    <span className="block font-serif text-base sm:text-lg font-bold text-[#3D1F0D]">
                      Bolos sob Medida
                    </span>
                    <span className="text-[11px] text-[#7A5A43]">Massa e recheio duplo</span>
                  </div>
                  <div>
                    <span className="block font-serif text-base sm:text-lg font-bold text-[#3D1F0D]">
                      Retirada no Ateliê
                    </span>
                    <span className="text-[11px] text-[#7A5A43]">{settings.address}</span>
                  </div>
                </div>
              </div>

              {/* Logo Showcase */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-sm sm:max-w-md">
                  <div className="relative rounded-3xl overflow-hidden border border-[#D5BFA8] shadow-lg bg-white p-6 flex flex-col items-center text-center space-y-4">
                    <div className="w-44 h-44 rounded-full overflow-hidden border-2 border-[#E8D5C4] shadow-xs">
                      <img
                        src="/logo.jpg"
                        alt="Ana Melo Confeitaria"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl font-bold text-[#3D1F0D]">
                        {settings.storeName}
                      </h3>
                      <p className="text-xs text-[#7A5A43] mt-1">
                        {settings.address} • {settings.whatsapp}
                      </p>
                    </div>

                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF7F3] border border-[#D5BFA8] text-xs font-semibold text-[#5A3821] hover:bg-[#EFE4D8] transition-colors"
                    >
                      <InstagramIcon className="w-3.5 h-3.5 text-[#C69255]" />
                      <span>{settings.instagram}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SWEETS & CAKES HIGHLIGHT BANNER */}
        <section id="encomendas" className="py-12 bg-white border-b border-[#E8D5C4]/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Doces de Festa */}
              <div className="p-8 rounded-2xl bg-[#3D1F0D] text-[#FAF7F3] flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-[#C69255]">
                    Doces para Eventos e Aniversários
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    Centos e Caixas de Doces de Festa
                  </h3>
                  <p className="text-[#D8C4B2] text-xs sm:text-sm leading-relaxed">
                    Escolha entre nossa Linha Gourmet (Belga, Pistache, Ninho com Nutella) e Linha Tradicional (Brigadeiro, Beijinho, Bicho de Pé, Cajuzinho). Monte com 25 unidades de cada sabor.
                  </p>
                </div>
                {sweetsProduct && (
                  <button
                    onClick={() => openCustomizer(sweetsProduct)}
                    className="self-start px-6 py-3 rounded-xl bg-[#C69255] hover:bg-[#B8803F] text-white font-medium text-xs sm:text-sm transition-all"
                  >
                    Montar Encomenda de Doces
                  </button>
                )}
              </div>

              {/* Card Bolos */}
              <div className="p-8 rounded-2xl bg-[#F7F2EC] border border-[#D5BFA8] flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-[#7A5A43]">
                    Bolos Decorados
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-[#3D1F0D]">
                    Bolos Festivos Personalizados
                  </h3>
                  <p className="text-[#6B4B35] text-xs sm:text-sm leading-relaxed">
                    Aros 15, 20 ou 25 com massa amanteigada ou de chocolate nobre, combinação de até dois recheios cremosos e topo personalizado.
                  </p>
                </div>
                {cakeProduct && (
                  <button
                    onClick={() => openCustomizer(cakeProduct)}
                    className="self-start px-6 py-3 rounded-xl bg-[#3D1F0D] hover:bg-[#2C1407] text-white font-medium text-xs sm:text-sm transition-all"
                  >
                    Personalizar Bolo
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* MENU / PRODUCTS SECTION */}
        <section id="cardapio" className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-[11px] font-semibold text-[#C69255] uppercase tracking-widest">
                Cardápio do Ateliê
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D1F0D]">
                Doces de Festa, Bolos e Sobremesas
              </h2>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveCategoryId('all')}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                  activeCategoryId === 'all'
                    ? 'bg-[#3D1F0D] text-[#FAF7F3]'
                    : 'bg-white hover:bg-[#F7F2EC] text-[#5A3821] border border-[#D5BFA8]'
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
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-[#3D1F0D] text-[#FAF7F3]'
                        : 'bg-white hover:bg-[#F7F2EC] text-[#5A3821] border border-[#D5BFA8]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="ml-1 text-[10px] opacity-75">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* ATELIÊ & RETIRADA INFO */}
        <section id="sobre" className="py-16 bg-[#F7F2EC] border-t border-[#E8D5C4]/70">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="text-[11px] font-semibold text-[#C69255] uppercase tracking-widest">
              Informações do Ateliê
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D1F0D]">
              Retirada no Ateliê Ana Melo
            </h2>
            <p className="text-xs sm:text-sm text-[#6B4B35] leading-relaxed max-w-2xl mx-auto">
              Endereço: <strong>{settings.address}</strong>. Todas as produções de doces e bolos são realizadas sob encomenda para manter o mais alto padrão de qualidade e sabor.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
              <div className="p-5 rounded-xl bg-white border border-[#E8D5C4] space-y-2">
                <span className="text-xs font-bold text-[#3D1F0D] block">1. Monte seus Sabores</span>
                <p className="text-[11px] text-[#7A5A43] leading-relaxed">
                  Selecione a quantidade de doces (25, 50 ou 100) e marque os sabores desejados da linha gourmet ou tradicional.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-[#E8D5C4] space-y-2">
                <span className="text-xs font-bold text-[#3D1F0D] block">2. Envio no WhatsApp</span>
                <p className="text-[11px] text-[#7A5A43] leading-relaxed">
                  O pedido é enviado diretamente para o WhatsApp {settings.whatsapp} com os dados da encomenda e instruções de Pix.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-[#E8D5C4] space-y-2">
                <span className="text-xs font-bold text-[#3D1F0D] block">3. Retirada Agendada</span>
                <p className="text-[11px] text-[#7A5A43] leading-relaxed">
                  No dia marcado, sua encomenda estará fresca e embalada para o seu evento.
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
