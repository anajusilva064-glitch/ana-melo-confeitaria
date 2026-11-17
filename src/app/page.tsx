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

  const customOrderProduct = products.find((p) => p.isCustomOrder);

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
                  <span>Confeitaria Artesanal e Personalizada em Maringá</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-[#3D1F0D] tracking-tight leading-[1.15]">
                  Doces e bolos pensados para marcar seus melhores momentos.
                </h1>

                <p className="text-sm sm:text-base text-[#6B4B35] max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
                  Produções artesanais com ingredientes selecionados e acabamento delicado. Faça seu pedido diretamente aqui e agende a retirada no ateliê.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <a
                    href="#cardapio"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#3D1F0D] hover:bg-[#2C1407] text-[#FAF7F3] font-medium text-xs sm:text-sm tracking-wide shadow-sm transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
                  >
                    <span>Conferir Cardápio</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  {customOrderProduct && (
                    <button
                      onClick={() => openCustomizer(customOrderProduct)}
                      className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-[#F7F2EC] border border-[#D5BFA8] text-[#3D1F0D] font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Cake className="w-4 h-4 text-[#C69255]" />
                      <span>Montar Bolo Personalizado</span>
                    </button>
                  )}
                </div>

                {/* Pillars */}
                <div className="pt-6 grid grid-cols-3 gap-6 border-t border-[#E8D5C4] max-w-md mx-auto lg:mx-0 text-left">
                  <div>
                    <span className="block font-serif text-base sm:text-lg font-bold text-[#3D1F0D]">
                      Artesanal
                    </span>
                    <span className="text-[11px] text-[#7A5A43]">Receitas autorais</span>
                  </div>
                  <div>
                    <span className="block font-serif text-base sm:text-lg font-bold text-[#3D1F0D]">
                      Sob Encomenda
                    </span>
                    <span className="text-[11px] text-[#7A5A43]">Preparo fresco</span>
                  </div>
                  <div>
                    <span className="block font-serif text-base sm:text-lg font-bold text-[#3D1F0D]">
                      Retirada Agendada
                    </span>
                    <span className="text-[11px] text-[#7A5A43]">Direto no ateliê</span>
                  </div>
                </div>
              </div>

              {/* Logo / Image Showcase */}
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
                        {settings.address}
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

        {/* CUSTOM CAKE HIGHLIGHT BANNER */}
        <section id="encomendas" className="py-12 bg-white border-b border-[#E8D5C4]/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 sm:p-10 rounded-2xl bg-[#3D1F0D] text-[#FAF7F3] shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl text-center md:text-left">
                <span className="text-[11px] uppercase tracking-widest font-semibold text-[#C69255]">
                  Encomendas Personalizadas
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Monte seu bolo festivo sob medida
                </h2>
                <p className="text-[#D8C4B2] text-xs sm:text-sm leading-relaxed">
                  Defina o número de fatias, tipo de massa, dois recheios e a escrita personalizada. O pedido é enviado diretamente para a nossa produção.
                </p>
              </div>

              {customOrderProduct && (
                <button
                  onClick={() => openCustomizer(customOrderProduct)}
                  className="px-6 py-3.5 rounded-xl bg-[#C69255] hover:bg-[#B8803F] text-white font-medium text-xs sm:text-sm shadow-xs transition-all shrink-0 flex items-center gap-2"
                >
                  <Cake className="w-4 h-4" />
                  <span>Personalizar Bolo</span>
                </button>
              )}
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
                Opções para Encomenda
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
              Como Funciona
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D1F0D]">
              Retirada no Ateliê Ana Melo
            </h2>
            <p className="text-xs sm:text-sm text-[#6B4B35] leading-relaxed max-w-2xl mx-auto">
              Nossas produções são 100% artesanais e feitas sob encomenda para garantir frescor absoluto. Os pedidos são retirados com data e horário previamente alinhados.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
              <div className="p-5 rounded-xl bg-white border border-[#E8D5C4] space-y-2">
                <span className="text-xs font-bold text-[#3D1F0D] block">1. Escolha e Personalize</span>
                <p className="text-[11px] text-[#7A5A43] leading-relaxed">
                  Selecione os itens no cardápio ou monte seu bolo comemorativo com seus sabores favoritos.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-[#E8D5C4] space-y-2">
                <span className="text-xs font-bold text-[#3D1F0D] block">2. Envio no WhatsApp</span>
                <p className="text-[11px] text-[#7A5A43] leading-relaxed">
                  A comanda é enviada diretamente para o nosso número para validação da data e pagamento via Pix.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-white border border-[#E8D5C4] space-y-2">
                <span className="text-xs font-bold text-[#3D1F0D] block">3. Retirada Agendada</span>
                <p className="text-[11px] text-[#7A5A43] leading-relaxed">
                  Sua encomenda estará pronta e embalada no endereço {settings.address}.
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
