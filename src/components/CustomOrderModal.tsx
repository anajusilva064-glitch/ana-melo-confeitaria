'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { X, Check, Sparkles, AlertCircle, ShoppingBag } from 'lucide-react';

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

  // Filtrar opções por tipo
  const sizes = useMemo(() => customOptions.filter((o) => o.type === 'size' && o.isAvailable), [customOptions]);
  const doughs = useMemo(() => customOptions.filter((o) => o.type === 'dough' && o.isAvailable), [customOptions]);
  const fillings = useMemo(() => customOptions.filter((o) => o.type === 'filling' && o.isAvailable), [customOptions]);
  const toppings = useMemo(() => customOptions.filter((o) => o.type === 'topping' && o.isAvailable), [customOptions]);
  const extras = useMemo(() => customOptions.filter((o) => o.type === 'extra' && o.isAvailable), [customOptions]);

  // Inicializar opções padrão ao abrir
  React.useEffect(() => {
    if (isCustomModalOpen) {
      if (sizes.length > 0 && !selectedSizeId) setSelectedSizeId(sizes[0].id);
      if (doughs.length > 0 && !selectedDoughId) setSelectedDoughId(doughs[0].id);
      if (toppings.length > 0 && !selectedToppingId) setSelectedToppingId(toppings[0].id);
      if (fillings.length > 0 && selectedFillingIds.length === 0) setSelectedFillingIds([fillings[0].id]);
    }
  }, [isCustomModalOpen, sizes, doughs, toppings, fillings]);

  if (!isCustomModalOpen || !customizingProduct) return null;

  // Cálculo de Preço Total
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

  // Toggle de Recheios (Permite até 2)
  const toggleFilling = (id: string) => {
    if (selectedFillingIds.includes(id)) {
      if (selectedFillingIds.length > 1) {
        setSelectedFillingIds(selectedFillingIds.filter((item) => item !== id));
      }
    } else {
      if (selectedFillingIds.length < 2) {
        setSelectedFillingIds([...selectedFillingIds, id]);
      } else {
        // Substitui o último
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-rose-500 to-rose-600 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-semibold tracking-wider uppercase text-rose-100">
                Monte sua Encomenda Exclusiva
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold mt-0.5">
              {customizingProduct.name}
            </h2>
          </div>
          <button
            onClick={() => setIsCustomModalOpen(false)}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {/* Passo 1: Tamanho */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                Escolha o Tamanho do Bolo
              </h3>
              <span className="text-xs text-stone-500 font-medium">Obrigatório</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {sizes.map((size) => {
                const isSelected = selectedSizeId === size.id;
                return (
                  <div
                    key={size.id}
                    onClick={() => setSelectedSizeId(size.id)}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/60 shadow-xs'
                        : 'border-stone-200 hover:border-rose-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-stone-900">{size.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                    </div>
                    {size.description && (
                      <p className="mt-1 text-[11px] text-stone-500 leading-tight">
                        {size.description}
                      </p>
                    )}
                    <span className="mt-2 block text-xs font-semibold text-rose-600">
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
              <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                Escolha a Massa Artesanal
              </h3>
              <span className="text-xs text-stone-500 font-medium">Obrigatório</span>
            </div>
            <div className="space-y-2.5">
              {doughs.map((dough) => {
                const isSelected = selectedDoughId === dough.id;
                return (
                  <div
                    key={dough.id}
                    onClick={() => setSelectedDoughId(dough.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                        : 'border-stone-200 hover:border-rose-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-stone-900">{dough.name}</div>
                      {dough.description && (
                        <div className="text-[11px] text-stone-500">{dough.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {dough.extraPrice > 0 && (
                        <span className="text-xs font-semibold text-rose-600">
                          + {formatCurrency(dough.extraPrice)}
                        </span>
                      )}
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-stone-300'
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

          {/* Passo 3: Recheios (Até 2) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                Escolha até 2 Recheios
              </h3>
              <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
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
                        ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                        : 'border-stone-200 hover:border-rose-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-stone-900">{filling.name}</div>
                      {filling.extraPrice > 0 && (
                        <span className="text-[11px] font-medium text-rose-600">
                          + {formatCurrency(filling.extraPrice)}
                        </span>
                      )}
                    </div>
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                        isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-stone-300'
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
              <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center">
                  4
                </span>
                Cobertura & Decoração
              </h3>
              <span className="text-xs text-stone-500 font-medium">Obrigatório</span>
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
                        ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                        : 'border-stone-200 hover:border-rose-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-stone-900">{top.name}</div>
                      {top.description && (
                        <div className="text-[11px] text-stone-500">{top.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {top.extraPrice > 0 && (
                        <span className="text-xs font-semibold text-rose-600">
                          + {formatCurrency(top.extraPrice)}
                        </span>
                      )}
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-stone-300'
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

          {/* Passo 5: Adicionais & Mensagem do Bolo */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-center">
                  5
                </span>
                Adicionais Especiais (Opcional)
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
                        ? 'border-rose-500 bg-rose-50/50'
                        : 'border-stone-200 hover:border-rose-200'
                    }`}
                  >
                    <div className="text-xs font-medium text-stone-900">{extra.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-rose-600">
                        + {formatCurrency(extra.extraPrice)}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-stone-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mensagem personalizada no topo ou velinha */}
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Frase no Topo do Bolo ou Observação (Ex: "Parabéns Sofia 15 Anos!")
            </label>
            <input
              type="text"
              placeholder="Digite aqui a frase personalizada..."
              value={cakeMessage}
              onChange={(e) => setCakeMessage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>

        {/* Modal Footer with Live Price & Add Action */}
        <div className="p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs text-stone-500 block">Total da Encomenda</span>
            <span className="text-2xl font-bold text-stone-900 font-sans">
              {formatCurrency(totalPrice)}
            </span>
          </div>

          <button
            onClick={handleConfirm}
            className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-rose-200 active:scale-95 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Adicionar à Sacola</span>
          </button>
        </div>
      </div>
    </div>
  );
}
