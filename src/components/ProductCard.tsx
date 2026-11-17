'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { Plus, Check, Clock } from 'lucide-react';

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
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#E8D5C4] shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      {/* Product Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-[#F7F2EC]">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.highlightBadge && (
            <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/95 text-[#3D1F0D] border border-[#E8D5C4] shadow-2xs">
              {product.highlightBadge}
            </span>
          )}
          {product.isCustomOrder ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#3D1F0D]/90 text-[#FAF7F3]">
              Sob Encomenda
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#7A5A43]/90 text-white">
              Pronta Entrega
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-serif text-base font-bold text-[#3D1F0D] group-hover:text-[#C69255] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="mt-1.5 text-xs text-[#7A5A43] line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {product.prepTimeMinutes && product.isCustomOrder && (
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#A68F7B] font-medium">
              <Clock className="w-3.5 h-3.5 text-[#C69255]" />
              <span>Antecedência: {product.prepTimeMinutes / 60} horas</span>
            </div>
          )}
        </div>

        {/* Price & Action */}
        <div className="pt-4 border-t border-[#F2E8DF] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#A68F7B] block font-medium uppercase tracking-wider">
              {product.isCustomOrder ? 'A partir de' : 'Valor'}
            </span>
            <span className="text-base font-bold text-[#3D1F0D] font-sans">
              {formatCurrency(product.price)}
            </span>
          </div>

          <button
            onClick={handleAdd}
            className={`px-4 py-2 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs ${
              product.isCustomOrder
                ? 'bg-[#3D1F0D] hover:bg-[#2C1407] text-[#FAF7F3]'
                : justAdded
                ? 'bg-[#5C3317] text-white'
                : 'bg-[#F7F2EC] hover:bg-[#EFE4D8] text-[#3D1F0D] border border-[#D5BFA8]'
            }`}
          >
            {product.isCustomOrder ? (
              <span>Personalizar</span>
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
