'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { Calculator, Plus, Trash2, Sparkles, TrendingUp, DollarSign } from 'lucide-react';

type RecipeRow = {
  ingredientId: string;
  quantity: number; // quantidade g/ml/un
};

export default function AdminFichaTecnicaPage() {
  const { products, ingredients } = useStore();

  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [recipeYield, setRecipeYield] = useState<number>(1); // rende 1 bolo ou 40 brigadeiros
  const [targetMargin, setTargetMargin] = useState<number>(200); // 200% de margem

  // Receita simulada dinâmica
  const [recipeRows, setRecipeRows] = useState<RecipeRow[]>([
    { ingredientId: ingredients[0]?.id || 'ing-1', quantity: 395 }, // Leite condensado
    { ingredientId: ingredients[1]?.id || 'ing-2', quantity: 200 }, // Creme de leite
    { ingredientId: ingredients[2]?.id || 'ing-3', quantity: 150 }, // Chocolate Belga
    { ingredientId: ingredients[7]?.id || 'ing-8', quantity: 1 },   // Caixa transporte
  ]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const addIngredientRow = () => {
    if (ingredients.length === 0) return;
    setRecipeRows([...recipeRows, { ingredientId: ingredients[0].id, quantity: 100 }]);
  };

  const removeRow = (idx: number) => {
    setRecipeRows(recipeRows.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, field: 'ingredientId' | 'quantity', val: any) => {
    setRecipeRows(
      recipeRows.map((r, i) => {
        if (i !== idx) return r;
        return { ...r, [field]: val };
      })
    );
  };

  // Cálculos de Custos
  const totalBatchCost = recipeRows.reduce((sum, row) => {
    const ing = ingredients.find((i) => i.id === row.ingredientId);
    if (!ing) return sum;
    return sum + row.quantity * ing.costPerUnit;
  }, 0);

  const safeYield = recipeYield > 0 ? recipeYield : 1;
  const unitCost = totalBatchCost / safeYield;

  // Preço de venda praticado
  const sellingPrice = selectedProduct?.price || 0;
  const unitProfit = sellingPrice - unitCost;
  const currentMargin = unitCost > 0 ? (unitProfit / unitCost) * 100 : 0;

  // Preço sugerido com base na margem alvo
  const suggestedPrice = unitCost * (1 + targetMargin / 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Ficha Técnica & Precificação de Doces
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Descubra o custo exato em centavos de cada receita e garanta que a Ana Melo nunca venda no prejuízo.
        </p>
      </div>

      {/* Select Product */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Selecione o Produto para Analisar
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm font-semibold text-stone-800 focus:outline-hidden focus:border-rose-500"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({formatCurrency(p.price)})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Rendimento da Fornada / Receita
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                value={recipeYield}
                onChange={(e) => setRecipeYield(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-24 px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-bold text-stone-900"
              />
              <span className="text-xs text-stone-500 font-medium">unidade(s)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Margem de Lucro Alvo (%)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                value={targetMargin}
                onChange={(e) => setTargetMargin(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm font-bold text-stone-900"
              />
              <span className="text-xs text-stone-500 font-medium">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards of the Recipe */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs font-medium text-stone-500 block">Custo Total da Receita</span>
          <span className="text-xl font-bold text-stone-900 font-sans mt-1 block">
            {formatCurrency(totalBatchCost)}
          </span>
          <span className="text-[11px] text-stone-400">Insumos + embalagens</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs font-medium text-stone-500 block">Custo Unitário (Por Doce)</span>
          <span className="text-xl font-bold text-rose-600 font-sans mt-1 block">
            {formatCurrency(unitCost)}
          </span>
          <span className="text-[11px] text-stone-400">Custo real de cada porção</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-xs font-medium text-stone-500 block">Margem Praticada Atual</span>
          <span
            className={`text-xl font-bold font-sans mt-1 block ${
              currentMargin >= 100 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {currentMargin.toFixed(1)}% ({formatCurrency(unitProfit)} lucro)
          </span>
          <span className="text-[11px] text-stone-400">Preço atual: {formatCurrency(sellingPrice)}</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-2xs">
          <span className="text-xs font-bold text-emerald-800 block">Preço de Venda Sugerido</span>
          <span className="text-xl font-bold text-emerald-900 font-sans mt-1 block">
            {formatCurrency(suggestedPrice)}
          </span>
          <span className="text-[11px] text-emerald-700">Para garantir {targetMargin}% de lucro</span>
        </div>
      </div>

      {/* Recipe Builder Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-stone-900">
            Ingredientes Usados nesta Ficha Técnica
          </h3>
          <button
            onClick={addIngredientRow}
            className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Ingrediente</span>
          </button>
        </div>

        <div className="space-y-3">
          {recipeRows.map((row, idx) => {
            const ing = ingredients.find((i) => i.id === row.ingredientId);
            const lineCost = ing ? row.quantity * ing.costPerUnit : 0;

            return (
              <div
                key={idx}
                className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex-1">
                  <select
                    value={row.ingredientId}
                    onChange={(e) => updateRow(idx, 'ingredientId', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white font-medium text-stone-800"
                  >
                    {ingredients.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name} ({formatCurrency(i.costPerUnit)}/{i.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-stone-500">Qtd:</span>
                  <input
                    type="number"
                    step="any"
                    value={row.quantity}
                    onChange={(e) => updateRow(idx, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-24 px-3 py-2 rounded-lg border border-stone-200 bg-white font-bold"
                  />
                  <span className="text-stone-600 font-medium w-8">{ing?.unit || 'g'}</span>
                </div>

                <div className="w-28 text-right font-bold text-stone-900 font-sans">
                  {formatCurrency(lineCost)}
                </div>

                <button
                  onClick={() => removeRow(idx)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
