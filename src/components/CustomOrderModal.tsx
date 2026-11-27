'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { X, Check, ShoppingBag, Plus, Minus, Sparkles, Filter } from 'lucide-react';
import { CustomOrderOption } from '@/types';

export default function CustomOrderModal() {
  const {
    isCustomModalOpen,
    setIsCustomModalOpen,
    customizingProduct,
    customOptions,
    addToCart,
  } = useStore();

  const isSweetOrder =
    customizingProduct?.productType === 'sweets' ||
    customizingProduct?.name.toLowerCase().includes('doce') ||
    customizingProduct?.name.toLowerCase().includes('cento');

  // Estado para Bolos
  const [selectedSizeId, setSelectedSizeId] = useState<string>('');
  const [selectedDoughId, setSelectedDoughId] = useState<string>('');
  const [selectedFillingIds, setSelectedFillingIds] = useState<string[]>([]);
  const [selectedToppingId, setSelectedToppingId] = useState<string>('');
  const [selectedExtraIds, setSelectedExtraIds] = useState<string[]>([]);
  const [cakeMessage, setCakeMessage] = useState<string>('');

  // Estado para Doces de Festa
  const [targetSweetUnits, setTargetSweetUnits] = useState<number>(100);
  const [selectedSweetFlavors, setSelectedSweetFlavors] = useState<{ name: string; qty: number; extraPrice: number }[]>([]);
  const [selectedWrapperId, setSelectedWrapperId] = useState<string>('');
  const [sweetNotes, setSweetNotes] = useState<string>('');
  const [activeSweetTab, setActiveSweetTab] = useState<'all' | 'gourmet' | 'traditional' | 'fine'>('all');

  // Opções de Bolo
  const cakeSizes = useMemo(() => customOptions.filter((o) => o.type === 'size' && o.isAvailable), [customOptions]);
  const doughs = useMemo(() => customOptions.filter((o) => o.type === 'dough' && o.isAvailable), [customOptions]);
  const fillings = useMemo(() => customOptions.filter((o) => o.type === 'filling' && o.isAvailable), [customOptions]);
  const toppings = useMemo(() => customOptions.filter((o) => o.type === 'topping' && o.isAvailable), [customOptions]);
  const cakeExtras = useMemo(() => customOptions.filter((o) => o.type === 'extra' && o.isAvailable), [customOptions]);

  // Opções de Doces
  const traditionalSweets = useMemo(() => customOptions.filter((o) => o.type === 'sweet_traditional' && o.isAvailable), [customOptions]);
  const gourmetSweets = useMemo(() => customOptions.filter((o) => o.type === 'sweet_gourmet' && o.isAvailable), [customOptions]);
  const fineSweets = useMemo(() => customOptions.filter((o) => o.type === 'sweet_fine' && o.isAvailable), [customOptions]);
  const wrappers = useMemo(() => customOptions.filter((o) => o.type === 'wrapper' && o.isAvailable), [customOptions]);

  // Inicialização ao abrir modal
  useEffect(() => {
    if (isCustomModalOpen) {
      if (cakeSizes.length > 0 && !selectedSizeId) setSelectedSizeId(cakeSizes[0].id);
      if (doughs.length > 0 && !selectedDoughId) setSelectedDoughId(doughs[0].id);
      if (toppings.length > 0 && !selectedToppingId) setSelectedToppingId(toppings[0].id);
      if (fillings.length > 0 && selectedFillingIds.length === 0) setSelectedFillingIds([fillings[0].id]);
      if (wrappers.length > 0 && !selectedWrapperId) setSelectedWrapperId(wrappers[0].id);

      // Pré-selecionar quantidade inicial baseada no produto
      if (customizingProduct) {
        if (customizingProduct.name.includes('50') || customizingProduct.name.includes('Meio')) {
          setTargetSweetUnits(50);
        } else if (customizingProduct.name.includes('25')) {
          setTargetSweetUnits(25);
        } else {
          setTargetSweetUnits(100);
        }
        setSelectedSweetFlavors([]);

        // Se o produto for especificamente de doces finos ou tradicionais, ajusta aba inicial
        if (customizingProduct.name.toLowerCase().includes('fino')) {
          setActiveSweetTab('fine');
        } else if (customizingProduct.name.toLowerCase().includes('tradicional')) {
          setActiveSweetTab('traditional');
        } else {
          setActiveSweetTab('all');
        }
      }
    }
  }, [isCustomModalOpen, cakeSizes, doughs, toppings, fillings, wrappers, customizingProduct]);

  if (!isCustomModalOpen || !customizingProduct) return null;

  // Total de unidades de doces selecionadas no momento
  const currentTotalSweetUnits = selectedSweetFlavors.reduce((sum, item) => sum + item.qty, 0);

  // Determinar preço unitário por doce baseado no produto clicado
  const baseUnitCount = customizingProduct.name.includes('50') || customizingProduct.name.includes('Meio')
    ? 50
    : customizingProduct.name.includes('25')
    ? 25
    : 100;

  const unitSweetPrice = customizingProduct.price / baseUnitCount;
  const effectiveSweetUnits = Math.max(targetSweetUnits, currentTotalSweetUnits);
  const baseSweetPrice = effectiveSweetUnits * unitSweetPrice;

  const wrapperOption = wrappers.find((w) => w.id === selectedWrapperId);
  const wrapperExtra = wrapperOption ? wrapperOption.extraPrice * Math.max(1, Math.round(effectiveSweetUnits / 100)) : 0;
  const sweetExtrasPrice = selectedSweetFlavors.reduce((sum, f) => sum + ((f.extraPrice || 0) * f.qty), 0) + wrapperExtra;
  const sweetTotalPrice = baseSweetPrice + sweetExtrasPrice;

  // Preço para Bolos
  const basePrice = customizingProduct.price;
  const sizeOption = cakeSizes.find((s) => s.id === selectedSizeId);
  const doughOption = doughs.find((d) => d.id === selectedDoughId);
  const toppingOption = toppings.find((t) => t.id === selectedToppingId);
  const cakeFillingsExtra = selectedFillingIds.reduce((sum, id) => {
    const f = fillings.find((item) => item.id === id);
    return sum + (f?.extraPrice || 0);
  }, 0);
  const cakeExtrasPrice = selectedExtraIds.reduce((sum, id) => {
    const e = cakeExtras.find((item) => item.id === id);
    return sum + (e?.extraPrice || 0);
  }, 0);

  const cakeTotalPrice =
    basePrice +
    (sizeOption?.extraPrice || 0) +
    (doughOption?.extraPrice || 0) +
    (toppingOption?.extraPrice || 0) +
    cakeFillingsExtra +
    cakeExtrasPrice;

  const finalPrice = isSweetOrder ? sweetTotalPrice : cakeTotalPrice;

  // Ações de Atualização de Quantidade de Doces (de 5 em 5 unidades)
  const handleUpdateSweetQty = (flavorName: string, delta: number, extraPrice = 0) => {
    const existing = selectedSweetFlavors.find((f) => f.name === flavorName);

    if (!existing && delta > 0) {
      const newTotal = currentTotalSweetUnits + delta;
      if (newTotal > targetSweetUnits) {
        setTargetSweetUnits(newTotal);
      }
      setSelectedSweetFlavors([...selectedSweetFlavors, { name: flavorName, qty: delta, extraPrice }]);
      return;
    }

    if (existing) {
      const newQty = existing.qty + delta;
      if (newQty <= 0) {
        setSelectedSweetFlavors(selectedSweetFlavors.filter((f) => f.name !== flavorName));
      } else {
        const newTotal = currentTotalSweetUnits + delta;
        if (newTotal > targetSweetUnits) {
          setTargetSweetUnits(newTotal);
        }
        setSelectedSweetFlavors(
          selectedSweetFlavors.map((f) => (f.name === flavorName ? { ...f, qty: newQty } : f))
        );
      }
    }
  };

  const handleRemoveSweetFlavor = (flavorName: string) => {
    setSelectedSweetFlavors(selectedSweetFlavors.filter((f) => f.name !== flavorName));
  };

  // Ações de Bolo
  const toggleFilling = (id: string) => {
    if (selectedFillingIds.includes(id)) {
      if (selectedFillingIds.length > 1) setSelectedFillingIds(selectedFillingIds.filter((i) => i !== id));
    } else {
      if (selectedFillingIds.length < 2) setSelectedFillingIds([...selectedFillingIds, id]);
      else setSelectedFillingIds([selectedFillingIds[0], id]);
    }
  };

  const toggleCakeExtra = (id: string) => {
    if (selectedExtraIds.includes(id)) setSelectedExtraIds(selectedExtraIds.filter((i) => i !== id));
    else setSelectedExtraIds([...selectedExtraIds, id]);
  };

  const handleConfirm = () => {
    if (isSweetOrder) {
      if (selectedSweetFlavors.length === 0) {
        alert('Por favor, selecione ao menos um sabor de doce para o seu pedido.');
        return;
      }

      const totalChosen = currentTotalSweetUnits;
      if (totalChosen < targetSweetUnits) {
        const diff = targetSweetUnits - totalChosen;
        const confirmAdjust = confirm(
          `Você selecionou ${totalChosen} doces de um pacote previsto de ${targetSweetUnits} (faltam ${diff} doces).\n\nDeseja confirmar a encomenda com exatamente ${totalChosen} doces no valor de ${formatCurrency(sweetTotalPrice)}?`
        );
        if (!confirmAdjust) return;
        setTargetSweetUnits(totalChosen);
      }

      const finalCount = Math.max(targetSweetUnits, currentTotalSweetUnits);
      const cleanBaseName = customizingProduct.name.split('(')[0].trim();

      addToCart({
        productId: customizingProduct.id,
        productName: `${cleanBaseName} (${finalCount} unidades)`,
        quantity: 1,
        unitPrice: sweetTotalPrice,
        totalPrice: sweetTotalPrice,
        customDetails: {
          sweetPackageSize: `${finalCount} unidades`,
          selectedFlavors: selectedSweetFlavors.map((f) => `${f.qty}x ${f.name}`),
          wrapperType: wrapperOption?.name,
          extras: sweetNotes.trim() ? [sweetNotes.trim()] : undefined,
        },
      });
    } else {
      const selectedFillingsNames = selectedFillingIds
        .map((id) => fillings.find((f) => f.id === id)?.name)
        .filter(Boolean) as string[];

      const selectedExtrasNames = selectedExtraIds
        .map((id) => cakeExtras.find((e) => e.id === id)?.name)
        .filter(Boolean) as string[];

      addToCart({
        productId: customizingProduct.id,
        productName: customizingProduct.name,
        quantity: 1,
        unitPrice: cakeTotalPrice,
        totalPrice: cakeTotalPrice,
        customDetails: {
          size: sizeOption?.name,
          dough: doughOption?.name,
          fillings: selectedFillingsNames,
          topping: toppingOption?.name,
          extras: selectedExtrasNames,
          cakeMessage: cakeMessage.trim() || undefined,
        },
      });
    }

    setIsCustomModalOpen(false);
  };

  // Card de Seleção de Sabor de Doce com Stepper de 5 em 5 unidades
  const renderSweetFlavorCard = (flavor: CustomOrderOption, badgeLabel: string) => {
    const selectedItem = selectedSweetFlavors.find((f) => f.name === flavor.name);
    const qty = selectedItem?.qty || 0;
    const isSelected = qty > 0;

    return (
      <div
        key={flavor.id}
        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
          isSelected
            ? 'border-[#2E1609] bg-[#FAF7F3] shadow-xs ring-1 ring-[#2E1609]'
            : 'border-[#E8D5C4] bg-white hover:border-[#D5BFA8]'
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-[#2E1609]">{flavor.name}</span>
              <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#EFE4D8] text-[#6E4F38]">
                {badgeLabel}
              </span>
            </div>
            {flavor.description && (
              <p className="text-[11px] text-[#7A5A43] leading-relaxed">
                {flavor.description}
              </p>
            )}
            {flavor.extraPrice > 0 && (
              <span className="text-[10px] text-[#C69255] font-semibold block mt-0.5">
                + {formatCurrency(flavor.extraPrice)} / unidade
              </span>
            )}
          </div>

          {isSelected && (
            <span className="px-2.5 py-1 rounded-full bg-[#2E1609] text-white text-[11px] font-bold shrink-0 shadow-2xs">
              {qty} un
            </span>
          )}
        </div>

        {/* Controles de Quantidade: Aumentando e Diminuindo de 5 em 5 */}
        <div className="pt-2 border-t border-[#F2E8DF] flex items-center justify-between gap-2">
          {isSelected ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#D5BFA8] shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleUpdateSweetQty(flavor.name, -5)}
                  className="w-7 h-7 rounded-lg bg-[#FAF7F3] hover:bg-[#EFE4D8] text-[#2E1609] flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                  title="Diminuir 5 unidades"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-14 text-center font-extrabold text-xs text-[#2E1609] select-none">
                  {qty} un
                </span>
                <button
                  type="button"
                  onClick={() => handleUpdateSweetQty(flavor.name, +5, flavor.extraPrice)}
                  className="w-7 h-7 rounded-lg bg-[#2E1609] hover:bg-[#1F1108] text-white flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                  title="Aumentar 5 unidades"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleUpdateSweetQty(flavor.name, +25, flavor.extraPrice)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF7F3] hover:bg-[#EFE4D8] border border-[#D5BFA8] text-[10px] font-bold text-[#6E4F38] transition-colors"
                  title="Adicionar +25 unidades deste sabor"
                >
                  +25 un
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveSweetFlavor(flavor.name)}
                  className="w-7 h-7 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                  title="Remover sabor"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full gap-2">
              <button
                type="button"
                onClick={() => handleUpdateSweetQty(flavor.name, +5, flavor.extraPrice)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-[#FAF7F3] hover:bg-[#2E1609] hover:text-white border border-[#D5BFA8] text-[11px] font-bold text-[#2E1609] transition-all flex items-center justify-center gap-1.5 cursor-pointer group/btn"
              >
                <Plus className="w-3.5 h-3.5 text-[#C69255] group-hover/btn:text-white" />
                <span>+ 5 unidades</span>
              </button>
              <button
                type="button"
                onClick={() => handleUpdateSweetQty(flavor.name, +25, flavor.extraPrice)}
                className="py-1.5 px-2.5 rounded-xl bg-white hover:bg-[#FAF7F3] border border-[#E8D5C4] text-[10px] font-semibold text-[#7A5A43] transition-colors"
                title="Adicionar lote de 25"
              >
                + 25 un
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1108]/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-[#E8D5C4]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#2E1609] text-[#FAF7F3] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold tracking-widest uppercase text-[#C69255] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {isSweetOrder ? 'Montador Flexível de Doces de Festa' : 'Personalização de Bolo Artesanal'}
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
        <div className="p-5 sm:p-6 overflow-y-auto space-y-7 flex-1">
          {/* SE FOR PEDIDO DE DOCES DE FESTA */}
          {isSweetOrder ? (
            <>
              {/* Passo 1: Quantidade Total da Encomenda (Pode escolher mais de 100) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-sm font-bold text-[#2E1609] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#EFE4D8] text-[#2E1609] text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    Quantidade Total da Encomenda
                  </h3>
                  <span className="text-xs text-[#7A5A43] font-medium">
                    Preço: <strong>{formatCurrency(unitSweetPrice)}/unidade</strong>
                  </span>
                </div>

                {/* Pílulas de Seleção Rápida */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: '50 un (Meio Cento)', value: 50 },
                    { label: '100 un (1 Cento)', value: 100 },
                    { label: '150 un (1,5 Cento)', value: 150 },
                    { label: '200 un (2 Centos)', value: 200 },
                    { label: '250 un', value: 250 },
                    { label: '300 un (3 Centos)', value: 300 },
                  ].map((preset) => {
                    const isSelected = targetSweetUnits === preset.value;
                    return (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => setTargetSweetUnits(preset.value)}
                        className={`px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#2E1609] bg-[#2E1609] text-white shadow-xs'
                            : 'border-[#E8D5C4] bg-white hover:border-[#C69255] text-[#5A3821]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Stepper Interativo de Quantidade Personalizada (Mais de 100 unidades) */}
                <div className="p-4 rounded-2xl bg-[#FAF7F3] border border-[#E8D5C4] flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-[#2E1609] block">
                      Ajuste fino de quantidade (de 5 em 5):
                    </span>
                    <span className="text-[11px] text-[#7A5A43]">
                      Escolha qualquer quantidade acima de 25 doces (100, 105, 120, 150, 200...).
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTargetSweetUnits((prev) => Math.max(25, prev - 25))}
                      disabled={targetSweetUnits <= 25}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-[#D5BFA8] text-xs font-semibold text-[#2E1609] hover:bg-[#F2E8DF] disabled:opacity-40 transition-colors"
                      title="Diminuir 25 unidades"
                    >
                      - 25
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetSweetUnits((prev) => Math.max(25, prev - 5))}
                      disabled={targetSweetUnits <= 25}
                      className="w-8 h-8 rounded-lg bg-white border border-[#D5BFA8] text-[#2E1609] hover:bg-[#F2E8DF] flex items-center justify-center font-bold text-xs disabled:opacity-40 transition-colors"
                      title="Diminuir 5 unidades"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <div className="px-4 py-1.5 rounded-lg bg-white border-2 border-[#2E1609] text-center min-w-[110px]">
                      <span className="text-lg font-extrabold text-[#2E1609] font-sans">
                        {targetSweetUnits}
                      </span>
                      <span className="text-[10px] text-[#7A5A43] block -mt-1 font-semibold">
                        doces ({formatCurrency(targetSweetUnits * unitSweetPrice)})
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTargetSweetUnits((prev) => prev + 5)}
                      className="w-8 h-8 rounded-lg bg-[#2E1609] hover:bg-[#1A0B03] text-white flex items-center justify-center font-bold text-xs transition-colors"
                      title="Aumentar 5 unidades"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setTargetSweetUnits((prev) => prev + 25)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#2E1609] hover:bg-[#1A0B03] text-white text-xs font-semibold transition-colors"
                      title="Aumentar 25 unidades"
                    >
                      + 25
                    </button>
                  </div>
                </div>
              </div>

              {/* Passo 2: Escolha de Sabores (Aumentando de 5 em 5 doces) */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-serif text-sm font-bold text-[#2E1609] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#EFE4D8] text-[#2E1609] text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    Escolha as Quantidades de Cada Sabor (de 5 em 5 doces)
                  </h3>

                  <div
                    className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 transition-all ${
                      currentTotalSweetUnits === targetSweetUnits
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : currentTotalSweetUnits > targetSweetUnits
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    {currentTotalSweetUnits === targetSweetUnits ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{currentTotalSweetUnits} de {targetSweetUnits} doces completos!</span>
                      </>
                    ) : (
                      <span>
                        Distribuídos: {currentTotalSweetUnits} / {targetSweetUnits} doces{' '}
                        {targetSweetUnits - currentTotalSweetUnits > 0
                          ? `(faltam ${targetSweetUnits - currentTotalSweetUnits})`
                          : `(+${currentTotalSweetUnits - targetSweetUnits})`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Barra Visual de Progresso */}
                <div className="space-y-1">
                  <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        currentTotalSweetUnits === targetSweetUnits
                          ? 'bg-emerald-600'
                          : currentTotalSweetUnits > targetSweetUnits
                          ? 'bg-blue-600'
                          : 'bg-[#C69255]'
                      }`}
                      style={{
                        width: `${Math.min(100, (currentTotalSweetUnits / targetSweetUnits) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#7A5A43]">
                    <span>0 doces</span>
                    <span>Meta: {targetSweetUnits} doces</span>
                  </div>
                </div>

                {/* Abas de Filtro de Sabores */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    { id: 'all', label: `Todos os Sabores (${gourmetSweets.length + traditionalSweets.length + fineSweets.length})` },
                    { id: 'gourmet', label: `Linha Gourmet (${gourmetSweets.length})` },
                    { id: 'traditional', label: `Linha Tradicional (${traditionalSweets.length})` },
                    { id: 'fine', label: `Doces Finos (${fineSweets.length})` },
                  ].map((tab) => {
                    const isActive = activeSweetTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveSweetTab(tab.id as any)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                          isActive
                            ? 'bg-[#2E1609] text-white shadow-2xs'
                            : 'bg-white hover:bg-[#FAF7F3] text-[#7A5A43] border border-[#E8D5C4]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Lista de Sabores Gourmet */}
                {(activeSweetTab === 'all' || activeSweetTab === 'gourmet') && (
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold text-[#C69255] uppercase tracking-wider block">
                      Linha Gourmet de Festa (Ninho c/ Nutella, Creme Brûlée, Ferrero, etc.)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {gourmetSweets.map((flavor) => renderSweetFlavorCard(flavor, 'Gourmet'))}
                    </div>
                  </div>
                )}

                {/* Lista de Sabores Tradicionais */}
                {(activeSweetTab === 'all' || activeSweetTab === 'traditional') && (
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold text-[#7A5A43] uppercase tracking-wider block">
                      Linha Tradicional de Festa (Brigadeiro, Beijinho, Dois Amores, Bicho de Pé...)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {traditionalSweets.map((flavor) => renderSweetFlavorCard(flavor, 'Tradicional'))}
                    </div>
                  </div>
                )}

                {/* Lista de Doces Finos */}
                {(activeSweetTab === 'all' || activeSweetTab === 'fine') && fineSweets.length > 0 && (
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-bold text-[#7A5A43] uppercase tracking-wider block">
                      Linha de Doces Finos Nobres
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {fineSweets.map((flavor) => renderSweetFlavorCard(flavor, 'Doce Fino'))}
                    </div>
                  </div>
                )}
              </div>

              {/* Passo 3: Forminhas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-sm font-bold text-[#2E1609] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#EFE4D8] text-[#2E1609] text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    Forminhas e Acabamento
                  </h3>
                </div>
                <div className="space-y-2">
                  {wrappers.map((wrap) => {
                    const isSelected = selectedWrapperId === wrap.id;
                    return (
                      <div
                        key={wrap.id}
                        onClick={() => setSelectedWrapperId(wrap.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#2E1609] bg-[#FAF7F3] shadow-2xs font-semibold'
                            : 'border-[#E8D5C4] hover:border-[#C69255]'
                        }`}
                      >
                        <div className="text-xs text-[#2E1609]">{wrap.name}</div>
                        <div className="flex items-center gap-2">
                          {wrap.extraPrice > 0 && (
                            <span className="text-xs font-semibold text-[#C69255]">
                              + {formatCurrency(wrap.extraPrice)} / cento
                            </span>
                          )}
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-[#2E1609] bg-[#2E1609] text-white' : 'border-[#D5BFA8]'
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

              {/* Passo 4: Observações */}
              <div>
                <label className="block text-xs font-semibold text-[#2E1609] mb-1">
                  Observações para a encomenda (ex: cores de confeitos, tema da festa, data especial...)
                </label>
                <textarea
                  rows={2}
                  placeholder="Alguma preferência especial?"
                  value={sweetNotes}
                  onChange={(e) => setSweetNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs focus:outline-hidden focus:border-[#2E1609]"
                />
              </div>
            </>
          ) : (
            /* SE FOR PEDIDO DE BOLO */
            <>
              {/* Passo 1: Tamanho do Bolo */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-sm font-bold text-[#2E1609] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#EFE4D8] text-[#2E1609] text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    Tamanho do Bolo
                  </h3>
                  <span className="text-xs text-[#7A5A43] font-medium">Obrigatório</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {cakeSizes.map((size) => {
                    const isSelected = selectedSizeId === size.id;
                    return (
                      <div
                        key={size.id}
                        onClick={() => setSelectedSizeId(size.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#2E1609] bg-[#FAF7F3] shadow-xs'
                            : 'border-[#E8D5C4] hover:border-[#C69255]'
                        }`}
                      >
                        <div className="font-bold text-xs text-[#2E1609]">{size.name}</div>
                        {size.description && (
                          <div className="text-[11px] text-[#7A5A43] mt-0.5">{size.description}</div>
                        )}
                        {size.extraPrice > 0 && (
                          <div className="text-xs font-bold text-[#C69255] mt-1">
                            + {formatCurrency(size.extraPrice)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Passo 2: Massa */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-sm font-bold text-[#2E1609] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#EFE4D8] text-[#2E1609] text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    Massa do Bolo
                  </h3>
                  <span className="text-xs text-[#7A5A43] font-medium">Obrigatório</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {doughs.map((dough) => {
                    const isSelected = selectedDoughId === dough.id;
                    return (
                      <div
                        key={dough.id}
                        onClick={() => setSelectedDoughId(dough.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#2E1609] bg-[#FAF7F3]'
                            : 'border-[#E8D5C4] hover:border-[#C69255]'
                        }`}
                      >
                        <div className="text-xs font-medium text-[#2E1609]">{dough.name}</div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#2E1609] bg-[#2E1609] text-white' : 'border-[#D5BFA8]'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Passo 3: Recheios (Até 2) */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-sm font-bold text-[#2E1609] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#EFE4D8] text-[#2E1609] text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    Recheios Artesanais (Escolha até 2)
                  </h3>
                  <span className="text-xs font-semibold text-[#2E1609] bg-[#EFE4D8] px-2.5 py-1 rounded-md">
                    {selectedFillingIds.length}/2 selecionados
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {fillings.map((fill) => {
                    const isSelected = selectedFillingIds.includes(fill.id);
                    return (
                      <div
                        key={fill.id}
                        onClick={() => toggleFilling(fill.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#2E1609] bg-[#FAF7F3]'
                            : 'border-[#E8D5C4] hover:border-[#C69255]'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-medium text-[#2E1609]">{fill.name}</div>
                          {fill.extraPrice > 0 && (
                            <span className="text-[10px] text-[#C69255] font-semibold">
                              + {formatCurrency(fill.extraPrice)}
                            </span>
                          )}
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                            isSelected ? 'border-[#2E1609] bg-[#2E1609] text-white' : 'border-[#D5BFA8]'
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
                  <h3 className="font-serif text-sm font-bold text-[#2E1609] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#EFE4D8] text-[#2E1609] text-xs font-bold flex items-center justify-center">
                      4
                    </span>
                    Finalização / Cobertura
                  </h3>
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
                            ? 'border-[#2E1609] bg-[#FAF7F3]'
                            : 'border-[#E8D5C4] hover:border-[#C69255]'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-medium text-[#2E1609]">{top.name}</div>
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
                              isSelected ? 'border-[#2E1609] bg-[#2E1609] text-white' : 'border-[#D5BFA8]'
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
                  <h3 className="font-serif text-sm font-bold text-[#2E1609] flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#EFE4D8] text-[#2E1609] text-xs font-bold flex items-center justify-center">
                      5
                    </span>
                    Adicionais (Opcional)
                  </h3>
                </div>
                <div className="space-y-2 mb-4">
                  {cakeExtras.map((extra) => {
                    const isSelected = selectedExtraIds.includes(extra.id);
                    return (
                      <div
                        key={extra.id}
                        onClick={() => toggleCakeExtra(extra.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#2E1609] bg-[#FAF7F3]'
                            : 'border-[#E8D5C4] hover:border-[#C69255]'
                        }`}
                      >
                        <div className="text-xs font-medium text-[#2E1609]">{extra.name}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#C69255]">
                            + {formatCurrency(extra.extraPrice)}
                          </span>
                          <div
                            className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                              isSelected ? 'border-[#2E1609] bg-[#2E1609] text-white' : 'border-[#D5BFA8]'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <label className="block text-xs font-semibold text-[#2E1609] mb-1">
                  Nome ou frase para o topo / escrita no bolo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Parabéns Helena"
                  value={cakeMessage}
                  onChange={(e) => setCakeMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D5BFA8] text-xs sm:text-sm focus:outline-hidden focus:border-[#2E1609]"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Fixo */}
        <div className="p-5 bg-[#FAF7F3] border-t border-[#E8D5C4] flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] text-[#7A5A43] block">
              {isSweetOrder
                ? `Total da Encomenda (${effectiveSweetUnits} doces • ${formatCurrency(unitSweetPrice)}/un)`
                : 'Valor Total'}
            </span>
            <span className="text-xl sm:text-2xl font-bold text-[#2E1609] font-sans">
              {formatCurrency(finalPrice)}
            </span>
          </div>

          <button
            onClick={handleConfirm}
            className="px-6 py-3 rounded-xl bg-[#2E1609] hover:bg-[#1A0B03] text-[#FAF7F3] font-medium text-xs sm:text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Adicionar à Sacola</span>
          </button>
        </div>
      </div>
    </div>
  );
}
