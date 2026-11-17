'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { Plus, Check, Clock, Sparkles } from 'lucide-react';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, openCustomizer } = useStore();
  const [justAdded, setJustAdded] = useState(false);

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
    <div className="group bg-white rounded-3xl overflow-hidden border border-[#E8D5C4]/70 shadow-xs hover:shadow-xl hover:border-[#D5BFA8] transition-all duration-500 flex flex-col justify-between hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F7F2EC]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Floating Glass Badges */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-1.5 pointer-events-none">
          {product.highlightBadge ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/90 backdrop-blur-md text-[#2E1609] border border-[#E8D5C4]/60 shadow-2xs">
              {product.highlightBadge}
            </span>
          ) : <div />}

          {product.isCustomOrder ? (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-[#2E1609]/85 backdrop-blur-md text-[#FAF7F3]">
              Personalizável
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide bg-[#6E4F38]/85 backdrop-blur-md text-white">
              Pronta Entrega
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
        <div className="space-y-2">
          <h3 className="font-serif text-lg font-bold text-[#2E1609] group-hover:text-[#C69255] transition-colors duration-300 line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-[#7A5A43] line-clamp-2 leading-relaxed font-sans">
            {product.description}
          </p>

          {product.prepTimeMinutes && product.isCustomOrder && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF7F3] border border-[#E8D5C4]/60 text-[11px] text-[#8C6D53] font-medium">
              <Clock className="w-3 h-3 text-[#C69255]" />
              <span>Antecedência: {product.prepTimeMinutes / 60}h</span>
            </div>
          )}
        </div>

        {/* Price & Action */}
        <div className="pt-4 border-t border-[#F5EBE1] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#A68F7B] block font-medium uppercase tracking-widest">
              {product.isCustomOrder ? 'A partir de' : 'Valor'}
            </span>
            <span className="text-lg font-bold text-[#2E1609] font-sans">
              {formatCurrency(product.price)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            className={`px-5 py-2.5 rounded-xl font-medium text-xs tracking-wide flex items-center gap-2 transition-all duration-300 active:scale-95 shadow-xs cursor-pointer ${
              product.isCustomOrder
                ? 'bg-[#2E1609] hover:bg-[#1F0E05] text-[#FAF7F3] hover:shadow-md'
                : justAdded
                ? 'bg-[#5C3317] text-white'
                : 'bg-[#FAF7F3] hover:bg-[#EFE4D8] text-[#2E1609] border border-[#D5BFA8]'
            }`}
          >
            {product.isCustomOrder ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#C69255]" />
                <span>Personalizar</span>
              </>
            ) : justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Adicionado</span>
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
