'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CartDrawer from '@/components/CartDrawer';
import CustomOrderModal from '@/components/CustomOrderModal';
import { useStore } from '@/context/StoreContext';
import {
  Sparkles,
  Cake,
  Heart,
  ShieldCheck,
  Clock,
  ArrowRight,
  Star,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-stone-50/40 text-stone-900">
      <Navbar />

      <main className="flex-1">
        {/* HERO BANNER */}
        <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/80 via-white to-stone-50/40 py-16 sm:py-24 border-b border-rose-100/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Text */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 border border-rose-200 text-rose-700 text-xs font-semibold shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Confeitaria Gourmet Artesanal em São Paulo</span>
                </div>

                <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight leading-[1.15]">
                  Momentos doces feitos com{' '}
                  <span className="text-rose-600 italic">amor</span> e chocolate nobre.
                </h1>

                <p className="text-base sm:text-lg text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
                  Bolos festivos sob encomenda, brigadeiros belgas feitos no dia e sobremesas que encantam. Peça direto aqui com <strong>frete grátis</strong> acima de R$ {settings.freeDeliveryMinAmount.toFixed(0)} e sem taxas de app!
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                  <a
                    href="#cardapio"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm shadow-xl shadow-rose-200 transition-all hover:scale-102 active:scale-98 flex items-center justify-center gap-2"
                  >
                    <span>Ver Cardápio de Hoje</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  {customOrderProduct && (
                    <button
                      onClick={() => openCustomizer(customOrderProduct)}
                      className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white hover:bg-rose-50 border-2 border-rose-200 text-rose-700 font-semibold text-sm transition-all hover:border-rose-300 flex items-center justify-center gap-2 shadow-2xs"
                    >
                      <Cake className="w-4 h-4 text-rose-500" />
                      <span>Montar Bolo Personalizado</span>
                    </button>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="pt-6 grid grid-cols-3 gap-4 border-t border-rose-100/80 max-w-lg mx-auto lg:mx-0 text-left">
                  <div>
                    <span className="block font-serif text-lg font-bold text-stone-900">100%</span>
                    <span className="text-xs text-stone-500">Artesanal & Fresco</span>
                  </div>
                  <div>
                    <span className="block font-serif text-lg font-bold text-stone-900">0%</span>
                    <span className="text-xs text-stone-500">Taxas de App</span>
                  </div>
                  <div>
                    <span className="block font-serif text-lg font-bold text-stone-900">5.0 ★</span>
                    <span className="text-xs text-stone-500">+1.200 Clientes</span>
                  </div>
                </div>
              </div>

              {/* Right Visual Image */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Glowing backdrop */}
                  <div className="absolute -inset-4 bg-gradient-to-tr from-rose-200/50 to-amber-200/40 rounded-3xl blur-2xl -z-10" />

                  <div className="relative rounded-3xl overflow-hidden border-4 border-white shadow-2xl aspect-4/5 bg-rose-100">
                    <img
                      src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1000&auto=format&fit=crop&q=80"
                      alt="Bolo artesanal da Ana Melo Doces"
                      className="w-full h-full object-cover"
                    />

                    {/* Overlay Tag */}
                    <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-rose-100 shadow-lg flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
                        <Cake className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900">
                          Bolo Festivo Personalizado
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Aro 20 • Recheio Duplo • Decoração Floral
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CUSTOM CAKE PROMO BANNER */}
        <section id="encomendas" className="py-12 bg-white border-b border-rose-100/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-stone-900 via-stone-800 to-rose-950 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Personalização Sem Complicações</span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Vai comemorar? Monte seu bolo em 4 passos rápidos.
                </h2>
                <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
                  Escolha o aro ideal para o número de convidados, a massa caseira, dois recheios e o topo de bolo com o nome do aniversariante sem precisar esperar atendimento no WhatsApp.
                </p>
              </div>

              {customOrderProduct && (
                <button
                  onClick={() => openCustomizer(customOrderProduct)}
                  className="px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm shadow-lg shadow-rose-900/50 hover:scale-102 transition-all active:scale-98 shrink-0 flex items-center gap-2"
                >
                  <Cake className="w-4 h-4" />
                  <span>Montar Meu Bolo Agora</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* MENU / PRODUCTS SECTION */}
        <section id="cardapio" className="py-16 sm:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            {/* Section Title */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
                Nosso Cardápio Gourmet
              </h2>
              <p className="text-sm text-stone-500">
                Pronta entrega para adoçar o seu dia ou encomendas para marcar suas melhores celebrações.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveCategoryId('all')}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeCategoryId === 'all'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                    : 'bg-white hover:bg-rose-50 text-stone-600 border border-stone-200'
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
                    className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                        : 'bg-white hover:bg-rose-50 text-stone-600 border border-stone-200'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`ml-1.5 text-[10px] opacity-80`}>({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* REVIEWS & QUALITY PROMISE */}
        <section id="sobre" className="py-16 bg-rose-50/50 border-t border-rose-100/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-widest">
                Depoimentos Reais
              </span>
              <h2 className="font-serif text-3xl font-bold text-stone-900">
                O que dizem sobre nossos doces
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-rose-100 shadow-2xs space-y-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-stone-600 italic leading-relaxed">
                  "O bolo do aniversário da minha filha foi o mais elogiado que já pedi! A massa fofinha e o brigadeiro belga não são enjoativos. Chegou pontualíssimo e impecável."
                </p>
                <div className="pt-2 font-serif text-xs font-bold text-stone-900">
                  — Juliana Medeiros
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-rose-100 shadow-2xs space-y-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-stone-600 italic leading-relaxed">
                  "Os brigadeiros gourmet são outro nível. A caixa de presente com fita dourada parece de joalheria. Pedi direto pelo site e foi super prático no WhatsApp!"
                </p>
                <div className="pt-2 font-serif text-xs font-bold text-stone-900">
                  — Rodrigo Alencar
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-rose-100 shadow-2xs space-y-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-stone-600 italic leading-relaxed">
                  "O copo da felicidade de Ninho com Nutella e as fatias red velvet viraram vício aqui no escritório. A Ana Melo arrasa em cada detalhe!"
                </p>
                <div className="pt-2 font-serif text-xs font-bold text-stone-900">
                  — Camila F. Santos
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <CustomOrderModal />
    </div>
  );
}
