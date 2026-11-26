'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { CustomOrderOption, CustomOptionType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Plus, Pencil, Trash2, Check, X, RefreshCw } from 'lucide-react';

const tabs: { type: CustomOptionType; label: string }[] = [
  { type: 'sweet_gourmet', label: 'Doces Gourmet (R$ 180/cento)' },
  { type: 'sweet_traditional', label: 'Doces Tradicionais (R$ 140/cento)' },
  { type: 'sweet_fine', label: 'Doces Finos' },
  { type: 'filling', label: 'Recheios de Bolo' },
  { type: 'topping', label: 'Decorações de Bolo' },
  { type: 'dough', label: 'Massas de Bolo' },
  { type: 'size', label: 'Tamanhos de Bolo' },
  { type: 'wrapper', label: 'Forminhas Especiais' },
  { type: 'extra', label: 'Adicionais & Topos' },
];

export default function AdminEncomendasPage() {
  const { customOptions, addCustomOption, updateCustomOption, deleteCustomOption, resetCustomOptionsToDefault } = useStore();

  const [activeTab, setActiveTab] = useState<CustomOptionType>('sweet_gourmet');
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
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D1F0D]">
            Gestão de Encomendas: Doces de Festa e Bolos
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5A43] mt-1">
            Cadastre os sabores de doces tradicionais, doces gourmet, forminhas, massas e recheios disponíveis para o cliente montar no pedido.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  'Deseja recarregar todos os itens oficiais dos cardápios da Ana Melo Confeitaria (Doces Tradicionais, Gourmet, Finos e Bolos)?'
                )
              ) {
                resetCustomOptionsToDefault();
              }
            }}
            className="px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Recarrega todos os sabores e itens oficiais conforme os PDFs de cardápios"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
            <span>Restaurar Cardápio Oficial</span>
          </button>

          <button
            onClick={openNewModal}
            className="px-4 py-2.5 rounded-xl bg-[#3D1F0D] hover:bg-[#2C1407] text-[#FAF7F3] text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Opção / Sabor</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E8D5C4]">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.type;
          const count = customOptions.filter((o) => o.type === tab.type).length;

          return (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-[#3D1F0D] text-[#FAF7F3] shadow-xs'
                  : 'bg-white hover:bg-[#FAF7F3] text-[#5A3821] border border-[#D5BFA8]'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-[#FAF7F3] text-[#7A5A43]'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOptions.map((opt) => (
          <div
            key={opt.id}
            className="p-5 rounded-2xl bg-white border border-[#E8D5C4] shadow-2xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif text-sm sm:text-base font-bold text-[#3D1F0D]">
                  {opt.name}
                </h3>
                <span className="text-xs font-bold text-[#C69255] font-sans shrink-0">
                  {opt.extraPrice > 0 ? `+ ${formatCurrency(opt.extraPrice)}` : 'Incluso'}
                </span>
              </div>
              {opt.description && (
                <p className="text-xs text-[#7A5A43] mt-1.5 leading-relaxed">
                  {opt.description}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-[#F2E8DF] flex items-center justify-between">
              <button
                onClick={() => updateCustomOption(opt.id, { isAvailable: !opt.isAvailable })}
                className={`text-xs font-semibold ${
                  opt.isAvailable ? 'text-[#3D1F0D]' : 'text-stone-400'
                }`}
              >
                {opt.isAvailable ? '● Disponível para Pedidos' : '○ Pausado / Esgotado'}
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(opt)}
                  className="p-1.5 rounded-lg bg-[#FAF7F3] hover:bg-[#EFE4D8] text-[#3D1F0D]"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Excluir opção "${opt.name}"?`)) deleteCustomOption(opt.id);
                  }}
                  className="p-1.5 rounded-lg bg-[#FAF7F3] hover:bg-rose-100 text-[#7A5A43] hover:text-rose-600"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1108]/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4 border border-[#E8D5C4]">
            <div className="flex items-center justify-between border-b border-[#E8D5C4] pb-3">
              <h3 className="font-serif text-base font-bold text-[#3D1F0D]">
                {editingOption ? 'Editar Opção / Sabor' : `Novo Item em ${tabs.find((t) => t.type === activeTab)?.label}`}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-[#7A5A43]" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#3D1F0D] mb-1">Nome do Sabor ou Opção *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Brigadeiro de Pistache com Crocante"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5BFA8] text-xs sm:text-sm focus:outline-hidden focus:border-[#3D1F0D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#3D1F0D] mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Feito com pasta pura italiana de pistache"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5BFA8] text-xs sm:text-sm focus:outline-hidden focus:border-[#3D1F0D]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#3D1F0D] mb-1">
                  Acréscimo no Valor (R$)
                </label>
                <input
                  type="text"
                  placeholder="0.00"
                  value={extraPrice}
                  onChange={(e) => setExtraPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5BFA8] text-xs sm:text-sm focus:outline-hidden focus:border-[#3D1F0D]"
                />
                <span className="text-[10px] text-[#A68F7B] mt-1 block">
                  Coloque 0 se este sabor já fizer parte do valor padrão do pacote.
                </span>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#3D1F0D] hover:bg-[#2C1407] text-[#FAF7F3] font-semibold text-xs sm:text-sm shadow-xs"
                >
                  {editingOption ? 'Salvar Alteração' : 'Criar Opção'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#FAF7F3] text-[#5A3821] font-semibold text-xs"
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
