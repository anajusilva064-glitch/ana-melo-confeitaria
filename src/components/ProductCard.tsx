'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/types';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { Plus, Sparkles, Clock, Check } from 'lucide-react';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, openCustomizer } = useStore();
  const [justAdded, setJustAdded] = React.useState(false);

  const handleAdd = () => {
    if (product.isCustomOrder) {
      openCustomizer(product);
    } else {
      addToCart({
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        totalPrice: product.price,
      });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1200);
    }
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-rose-100/80 shadow-xs hover:shadow-xl hover:border-rose-200 transition-all duration-300 flex flex-col justify-between">
      {/* Product Image & Badges */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-rose-50">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.highlightBadge && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-rose-600 shadow-xs backdrop-blur-xs flex items-center gap-1 border border-rose-100">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
              {product.highlightBadge}
            </span>
          )}
          {product.isCustomOrder ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/90 text-white backdrop-blur-xs">
              Sob Encomenda
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-600/90 text-white backdrop-blur-xs">
              Pronta Entrega
            </span>
          )}
        </div>

        {/* Stock info if available */}
        {!product.isCustomOrder && product.stock !== undefined && (
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-stone-900/70 text-white text-[11px] font-medium backdrop-blur-xs">
            {product.stock > 0 ? `${product.stock} un. prontas` : 'Esgotado'}
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-rose-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1.5 text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {product.prepTimeMinutes && product.isCustomOrder && (
            <div className="mt-2.5 flex items-center gap-1 text-[11px] text-amber-700 font-medium">
              <Clock className="w-3 h-3" />
              <span>Antecedência mínima: {product.prepTimeMinutes / 60}h</span>
            </div>
          )}
        </div>

        {/* Bottom Price & Action */}
        <div className="mt-5 pt-4 border-t border-rose-50 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-stone-400 block font-medium">
              {product.isCustomOrder ? 'A partir de' : 'Preço'}
            </span>
            <span className="text-lg font-bold text-stone-900 font-sans">
              {formatCurrency(product.price)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            className={`px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 shadow-xs ${
              product.isCustomOrder
                ? 'bg-rose-500 hover:bg-rose-600 text-white'
                : justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            }`}
          >
            {product.isCustomOrder ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Personalizar</span>
              </>
            ) : justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Adicionado!</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
