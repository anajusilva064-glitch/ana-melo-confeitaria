'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { X, Check, ShoppingBag } from 'lucide-react';

export default function CustomOrderModal() {
  const {
    isCustomModalOpen,
    setIsCustomModalOpen,
    customizingProduct,
    customOptions,
    addToCart,
  } = useStore();

  const [selectedSizeId, setSelectedSizeId] = useState<string>('');
  const [selectedDoughId, setSelectedDoughId] = useState<string>('');
  const [selectedFillingIds, setSelectedFillingIds] = useState<string[]>([]);
  const [selectedToppingId, setSelectedToppingId] = useState<string>('');
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [cakeMessage, setCakeMessage] = useState<string>('');

  const sizes = useMemo(() => customOptions.filter((o) => o.type === 'size' && o.isAvailable), [customOptions]);
  const doughs = useMemo(() => customOptions.filter((o) => o.type === 'dough' && o.isAvailable), [customOptions]);
  const fillings = useMemo(() => customOptions.filter((o) => o.type === 'filling' && o.isAvailable), [customOptions]);
  const toppings = useMemo(() => customOptions.filter((o) => o.type === 'topping' && o.isAvailable), [customOptions]);
  const extras = useMemo(() => customOptions.filter((o) => o.type === 'extra' && o.isAvailable), [customOptions]);

  React.useEffect(() => {
    if (isCustomModalOpen) {
      if (sizes.length > 0 && !selectedSizeId) setSelectedSizeId(sizes[0].id);
      if (doughs.length > 0 && !selectedDoughId) setSelectedDoughId(doughs[0].id);
      if (toppings.length > 0 && !selectedToppingId) setSelectedToppingId(toppings[0].id);
      if (fillings.length > 0 && selectedFillingIds.length === 0) setSelectedFillingIds([fillings[0].id]);
    }
  }, [isCustomModalOpen, sizes, doughs, toppings, fillings]);

  if (!isCustomModalOpen || !customizingProduct) return null;

  const basePrice = customizingProduct.price;
  const sizeOption = sizes.find((s) => s.id === selectedSizeId);
  const doughOption = doughs.find((d) => d.id === selectedDoughId);
  const toppingOption = toppings.find((t) => t.id === selectedToppingId);

  const fillingsTotal = selectedFillingIds.reduce((sum, id) => {
    const f = fillings.find((item) => item.id === id);
    return sum + (f?.extraPrice || 0);
  }, 0);

  const extrasTotal = selectedExtraIds.reduce((sum, id) => {
    const e = extras.find((item) => item.id === id);
    return sum + (e?.extraPrice || 0);
  }, 0);

  const totalPrice =
    basePrice +
    (sizeOption?.extraPrice || 0) +
    (doughOption?.extraPrice || 0) +
    (toppingOption?.extraPrice || 0) +
    fillingsTotal +
    extrasTotal;

  const toggleFilling = (id: string) => {
    if (selectedFillingIds.includes(id)) {
      if (selectedFillingIds.length > 1) {
        setSelectedFillingIds(selectedFillingIds.filter((item) => item !== id));
      }
    } else {
      if (selectedFillingIds.length < 2) {
        setSelectedFillingIds([...selectedFillingIds, id]);
      } else {
        setSelectedFillingIds([selectedFillingIds[0], id]);
      }
    }
  };

  const toggleExtra = (id: string) => {
    if (selectedExtraIds.includes(id)) {
      setSelectedExtraIds(selectedExtraIds.filter((item) => item !== id));
    } else {
      setSelectedExtraIds([...selectedExtraIds, id]);
    }
  };

  const handleConfirm = () => {
    const selectedFillingsNames = selectedFillingIds
      .map((id) => fillings.find((f) => f.id === id)?.name)
      .filter(Boolean) as string[];

    const selectedExtrasNames = selectedExtraIds
      .map((id) => extras.find((e) => e.id === id)?.name)
      .filter(Boolean) as string[];

    addToCart({
      productId: customizingProduct.id,
      productName: customizingProduct.name,
      quantity: 1,
      unitPrice: totalPrice,
      totalPrice: totalPrice,
      customDetails: {
        size: sizeOption?.name,
        dough: doughOption?.name,
        fillings: selectedFillingsNames,
        topping: toppingOption?.name,
        extras: selectedExtrasNames,
        cakeMessage: cakeMessage.trim() || undefined,
      },
    });

    setIsCustomModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1108]/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-[#E8D5C4]">
        {/* Header */}
        <div className="p-6 bg-[#3D1F0D] text-[#FAF7F3] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] font-medium tracking-widest uppercase text-[#C69255] block">
              Personalização da Encomenda
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-bold mt-0.5 text-white">
              {customizingProduct.name}
            </h2>
          </div>
          <button
            onClick={() => setIsCustomModalOpen(false)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-7 flex-1">
          {/* Passo 1: Tamanho */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-bold text-[#3D1F0D] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EFE4D8] text-[#3D1F0D] text-xs font-bold flex items-center justify-center">
                  1
                </span>
                Tamanho do Bolo
              </h3>
              <span className="text-xs text-[#7A5A43] font-medium">Obrigatório</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sizes.map((size) => {
                const isSelected = selectedSizeId === size.id;
                return (
                  <div
                    key={size.id}
                    onClick={() => setSelectedSizeId(size.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#3D1F0D] bg-[#F7F2EC] shadow-xs'
                        : 'border-[#E8D5C4] hover:border-[#C69255] bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-[#3D1F0D]">{size.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-[#3D1F0D] shrink-0" />}
                    </div>
                    {size.description && (
                      <p className="mt-1 text-[11px] text-[#7A5A43] leading-tight">
                        {size.description}
                      </p>
                    )}
                    <span className="mt-2 block text-xs font-semibold text-[#C69255]">
                      {size.extraPrice > 0 ? `+ ${formatCurrency(size.extraPrice)}` : 'Incluso'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Passo 2: Massa */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-bold text-[#3D1F0D] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EFE4D8] text-[#3D1F0D] text-xs font-bold flex items-center justify-center">
                  2
                </span>
                Massa
              </h3>
              <span className="text-xs text-[#7A5A43] font-medium">Obrigatório</span>
            </div>
            <div className="space-y-2">
              {doughs.map((dough) => {
                const isSelected = selectedDoughId === dough.id;
                return (
                  <div
                    key={dough.id}
                    onClick={() => setSelectedDoughId(dough.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#3D1F0D] bg-[#F7F2EC]'
                        : 'border-[#E8D5C4] hover:border-[#C69255]'
                    }`}
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-[#3D1F0D]">{dough.name}</div>
                      {dough.description && (
                        <div className="text-[11px] text-[#7A5A43]">{dough.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {dough.extraPrice > 0 && (
                        <span className="text-xs font-semibold text-[#C69255]">
                          + {formatCurrency(dough.extraPrice)}
                        </span>
                      )}
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#3D1F0D] bg-[#3D1F0D] text-white' : 'border-[#D5BFA8]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Passo 3: Recheios */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-bold text-[#3D1F0D] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EFE4D8] text-[#3D1F0D] text-xs font-bold flex items-center justify-center">
                  3
                </span>
                Recheios (Até 2 opções)
              </h3>
              <span className="text-xs font-semibold text-[#3D1F0D] bg-[#EFE4D8] px-2 py-0.5 rounded-md">
                {selectedFillingIds.length}/2 selecionados
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {fillings.map((filling) => {
                const isSelected = selectedFillingIds.includes(filling.id);
                return (
                  <div
                    key={filling.id}
                    onClick={() => toggleFilling(filling.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#3D1F0D] bg-[#F7F2EC]'
                        : 'border-[#E8D5C4] hover:border-[#C69255]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#3D1F0D]">{filling.name}</div>
                      {filling.extraPrice > 0 && (
                        <span className="text-[11px] font-medium text-[#C69255]">
                          + {formatCurrency(filling.extraPrice)}
                        </span>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        isSelected ? 'border-[#3D1F0D] bg-[#3D1F0D] text-white' : 'border-[#D5BFA8]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Passo 4: Cobertura */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-bold text-[#3D1F0D] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EFE4D8] text-[#3D1F0D] text-xs font-bold flex items-center justify-center">
                  4
                </span>
                Cobertura e Decoração
              </h3>
              <span className="text-xs text-[#7A5A43] font-medium">Obrigatório</span>
            </div>
            <div className="space-y-2">
              {toppings.map((top) => {
                const isSelected = selectedToppingId === top.id;
                return (
                  <div
                    key={top.id}
                    onClick={() => setSelectedToppingId(top.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#3D1F0D] bg-[#F7F2EC]'
                        : 'border-[#E8D5C4] hover:border-[#C69255]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-[#3D1F0D]">{top.name}</div>
                      {top.description && (
                        <div className="text-[11px] text-[#7A5A43]">{top.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {top.extraPrice > 0 && (
                        <span className="text-xs font-semibold text-[#C69255]">
                          + {formatCurrency(top.extraPrice)}
                        </span>
                      )}
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-[#3D1F0D] bg-[#3D1F0D] text-white' : 'border-[#D5BFA8]'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Passo 5: Topo e Mensagem */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-sm font-bold text-[#3D1F0D] flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#EFE4D8] text-[#3D1F0D] text-xs font-bold flex items-center justify-center">
                  5
                </span>
                Adicionais (Opcional)
              </h3>
            </div>
            <div className="space-y-2 mb-4">
              {extras.map((extra) => {
                const isSelected = selectedExtraIds.includes(extra.id);
                return (
                  <div
                    key={extra.id}
                    onClick={() => toggleExtra(extra.id)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#3D1F0D] bg-[#F7F2EC]'
                        : 'border-[#E8D5C4] hover:border-[#C69255]'
                    }`}
                  >
                    <div className="text-xs font-medium text-[#3D1F0D]">{extra.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-[#C69255]">
                        + {formatCurrency(extra.extraPrice)}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          isSelected ? 'border-[#3D1F0D] bg-[#3D1F0D] text-white' : 'border-[#D5BFA8]'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <label className="block text-xs font-semibold text-[#3D1F0D] mb-1">
              Nome ou frase para o topo / escrita no bolo
            </label>
            <input
              type="text"
              placeholder="Ex: Parabéns Helena"
              value={cakeMessage}
              onChange={(e) => setCakeMessage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D5BFA8] text-xs sm:text-sm focus:outline-hidden focus:border-[#3D1F0D]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-[#FAF7F3] border-t border-[#E8D5C4] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] text-[#7A5A43] block">Valor Total</span>
            <span className="text-xl sm:text-2xl font-bold text-[#3D1F0D] font-sans">
              {formatCurrency(totalPrice)}
            </span>
          </div>

          <button
            onClick={handleConfirm}
            className="px-6 py-3 rounded-xl bg-[#3D1F0D] hover:bg-[#2C1407] text-[#FAF7F3] font-medium text-xs sm:text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Adicionar à Sacola</span>
          </button>
        </div>
      </div>
    </div>
  );
}
