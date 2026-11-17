'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Ingredient } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Boxes,
  Plus,
  Minus,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  Search,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';

export default function AdminEstoquePage() {
  const { ingredients, addIngredient, updateIngredient, deleteIngredient, adjustStock } = useStore();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);

  // Form Insumo
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<'g' | 'kg' | 'ml' | 'l' | 'un'>('g');
  const [packageQuantity, setPackageQuantity] = useState('1000');
  const [packageCost, setPackageCost] = useState('10.00');
  const [currentStock, setCurrentStock] = useState('2000');
  const [minStockAlert, setMinStockAlert] = useState('1000');

  // Modal Ajuste Rápido (+ ou -)
  const [adjustingItem, setAdjustingItem] = useState<{ item: Ingredient; isAdding: boolean } | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  const openNewModal = () => {
    setEditingIngredient(null);
    setName('');
    setUnit('g');
    setPackageQuantity('1000');
    setPackageCost('10.00');
    setCurrentStock('2000');
    setMinStockAlert('1000');
    setIsModalOpen(true);
  };

  const openEditModal = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setName(ing.name);
    setUnit(ing.unit);
    setPackageQuantity(ing.packageQuantity.toString());
    setPackageCost(ing.packageCost.toString());
    setCurrentStock(ing.currentStock.toString());
    setMinStockAlert(ing.minStockAlert.toString());
    setIsModalOpen(true);
  };

  const handleSaveIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const pkgQty = parseFloat(packageQuantity) || 1;
    const pkgCost = parseFloat(packageCost.replace(',', '.')) || 0;
    const currStock = parseFloat(currentStock) || 0;
    const minAlert = parseFloat(minStockAlert) || 0;

    if (editingIngredient) {
      updateIngredient(editingIngredient.id, {
        name: name.trim(),
        unit,
        packageQuantity: pkgQty,
        packageCost: pkgCost,
        currentStock: currStock,
        minStockAlert: minAlert,
      });
    } else {
      addIngredient({
        name: name.trim(),
        unit,
        packageQuantity: pkgQty,
        packageCost: pkgCost,
        currentStock: currStock,
        minStockAlert: minAlert,
      });
    }

    setIsModalOpen(false);
  };

  const handleQuickAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingItem || !adjustQty) return;

    const qty = parseFloat(adjustQty) || 0;
    const delta = adjustingItem.isAdding ? qty : -qty;

    adjustStock(
      adjustingItem.item.id,
      delta,
      adjustReason || (adjustingItem.isAdding ? 'Compra de Reposição' : 'Consumo / Quebra')
    );

    setAdjustingItem(null);
    setAdjustQty('');
    setAdjustReason('');
  };

  const filtered = ingredients.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Estoque de Insumos & Embalagens
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Controle de matéria-prima, cálculo do custo por grama e alertas de compras.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Novo Insumo</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar ingrediente ou embalagem..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold">
                <th className="p-4">Insumo / Embalagem</th>
                <th className="p-4">Embalagem Compra</th>
                <th className="p-4">Custo Unitário</th>
                <th className="p-4">Estoque Atual</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Ajuste Rápido / Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filtered.map((item) => {
                const isLow = item.currentStock <= item.minStockAlert;

                return (
                  <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="p-4 font-semibold text-stone-900">
                      <div>{item.name}</div>
                      <span className="text-[10px] text-stone-400 font-normal">
                        Alerta de mínimo: {item.minStockAlert} {item.unit}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>{formatCurrency(item.packageCost)}</div>
                      <span className="text-[10px] text-stone-400">
                        Pct com {item.packageQuantity} {item.unit}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-medium text-stone-800">
                      {formatCurrency(item.costPerUnit)} / {item.unit}
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-stone-900 font-sans">
                        {item.currentStock.toLocaleString('pt-BR')}
                      </span>{' '}
                      <span className="text-xs text-stone-500">{item.unit}</span>
                    </td>
                    <td className="p-4">
                      {isLow ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Estoque Baixo
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setAdjustingItem({ item, isAdding: true })}
                          title="Dar entrada / Comprar reposição"
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Entrada</span>
                        </button>
                        <button
                          onClick={() => setAdjustingItem({ item, isAdding: false })}
                          title="Dar baixa / Quebra"
                          className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-[11px] flex items-center gap-1"
                        >
                          <Minus className="w-3 h-3" />
                          <span>Baixa</span>
                        </button>
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir insumo "${item.name}"?`)) deleteIngredient(item.id);
                          }}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Insumo (Novo / Editar) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-base font-bold text-stone-900">
                {editingIngredient ? 'Editar Insumo' : 'Cadastrar Insumo / Embalagem'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSaveIngredient} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nome do Insumo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Leite Condensado Moça"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Unidade de Medida</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-rose-500"
                  >
                    <option value="g">Gramas (g)</option>
                    <option value="kg">Quilos (kg)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="l">Litros (l)</option>
                    <option value="un">Unidades (un)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Qtd na Embalagem</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Ex: 395"
                    value={packageQuantity}
                    onChange={(e) => setPackageQuantity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Preço da Embalagem (R$)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 7.50"
                    value={packageCost}
                    onChange={(e) => setPackageCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Estoque Inicial ({unit})</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="Ex: 3950"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Alerta de Estoque Mínimo ({unit})
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="Ex: 1000"
                  value={minStockAlert}
                  onChange={(e) => setMinStockAlert(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-rose-500"
                />
                <span className="text-[10px] text-stone-400 mt-0.5 block">
                  O painel avisará quando o estoque atingir esse número.
                </span>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs sm:text-sm"
                >
                  {editingIngredient ? 'Salvar Insumo' : 'Cadastrar Insumo'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajuste Rápido */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h3 className="font-serif text-sm font-bold text-stone-900">
                {adjustingItem.isAdding ? 'Dar Entrada (Compra)' : 'Dar Baixa / Quebra'}
              </h3>
              <button onClick={() => setAdjustingItem(null)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleQuickAdjust} className="space-y-3 text-xs">
              <p className="text-stone-600">
                Insumo: <strong>{adjustingItem.item.name}</strong> (Estoque atual: {adjustingItem.item.currentStock} {adjustingItem.item.unit})
              </p>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Quantidade a {adjustingItem.isAdding ? 'adicionar' : 'subtrair'} ({adjustingItem.item.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder={`Ex: 500`}
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Motivo / Observação
                </label>
                <input
                  type="text"
                  placeholder={adjustingItem.isAdding ? 'Ex: Compra no Atacadão' : 'Ex: Produção de fatias'}
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-rose-500"
                />
              </div>

              {adjustingItem.isAdding && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] leading-tight">
                  💡 Uma despesa será lançada automaticamente no seu Financeiro proporcionalmente ao valor deste lote.
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-xs ${
                    adjustingItem.isAdding ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  Confirmar {adjustingItem.isAdding ? 'Entrada' : 'Baixa'}
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustingItem(null)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 text-stone-700 font-semibold text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
