'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { CustomOrderOption, CustomOptionType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Pencil, Trash2, Check, X, Sparkles, Cake } from 'lucide-react';

const tabs: { type: CustomOptionType; label: string }[] = [
  { type: 'size', label: 'Tamanhos & Aros' },
  { type: 'dough', label: 'Massas Artesanais' },
  { type: 'filling', label: 'Recheios' },
  { type: 'topping', label: 'Coberturas & Decorações' },
  { type: 'extra', label: 'Adicionais & Topos' },
];

export default function AdminEncomendasPage() {
  const { customOptions, addCustomOption, updateCustomOption, deleteCustomOption } = useStore();

  const [activeTab, setActiveTab] = useState<CustomOptionType>('size');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<CustomOrderOption | null>(null);

  // Form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [extraPrice, setExtraPrice] = useState('0');

  const filteredOptions = customOptions.filter((o) => o.type === activeTab);

  const openNewModal = () => {
    setEditingOption(null);
    setName('');
    setDescription('');
    setExtraPrice('0');
    setIsModalOpen(true);
  };

  const openEditModal = (opt: CustomOrderOption) => {
    setEditingOption(opt);
    setName(opt.name);
    setDescription(opt.description || '');
    setExtraPrice(opt.extraPrice.toString());
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const price = parseFloat(extraPrice.replace(',', '.')) || 0;

    if (editingOption) {
      updateCustomOption(editingOption.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        extraPrice: price,
      });
    } else {
      addCustomOption({
        type: activeTab,
        name: name.trim(),
        description: description.trim() || undefined,
        extraPrice: price,
        isAvailable: true,
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
            Opções do Montador de Encomendas
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Personalize os aros, massas, recheios e coberturas que os clientes podem escolher no link.
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Opção nesta Categoria</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.type;
          const count = customOptions.filter((o) => o.type === tab.type).length;

          return (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-50 text-stone-600 border border-stone-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Options List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOptions.map((opt) => (
          <div
            key={opt.id}
            className="p-5 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif text-sm sm:text-base font-bold text-stone-900">
                  {opt.name}
                </h3>
                <span className="text-xs font-bold text-rose-600 font-sans shrink-0">
                  {opt.extraPrice > 0 ? `+ ${formatCurrency(opt.extraPrice)}` : 'Incluso'}
                </span>
              </div>
              {opt.description && (
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                  {opt.description}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <button
                onClick={() => updateCustomOption(opt.id, { isAvailable: !opt.isAvailable })}
                className={`text-xs font-semibold ${
                  opt.isAvailable ? 'text-emerald-600' : 'text-stone-400'
                }`}
              >
                {opt.isAvailable ? '● Disponível' : '○ Pausado / Esgotado'}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(opt)}
                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Excluir opção "${opt.name}"?`)) deleteCustomOption(opt.id);
                  }}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Nova / Editar Opção */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="font-serif text-base font-bold text-stone-900">
                {editingOption ? 'Editar Opção' : `Nova Opção em ${tabs.find((t) => t.type === activeTab)?.label}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nome da Opção *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Ninho Trufado Cremoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Descrição Curta</label>
                <input
                  type="text"
                  placeholder="Ex: Feito com chocolate nobre e morangos frescos"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Valor Adicional ao Preço Base (R$)
                </label>
                <input
                  type="text"
                  placeholder="0.00"
                  value={extraPrice}
                  onChange={(e) => setExtraPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Coloque 0 se esta opção já estiver inclusa no preço base do bolo.
                </span>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs sm:text-sm shadow-xs"
                >
                  {editingOption ? 'Salvar Alteração' : 'Criar Opção'}
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
    </div>
  );
}
