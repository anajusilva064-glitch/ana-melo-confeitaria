'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { Settings, Save, Check, Sparkles, Store, ShieldCheck } from 'lucide-react';

export default function AdminConfiguracoesPage() {
  const { settings, updateSettings } = useStore();

  const [formData, setFormData] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
          Configurações da Doceria
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1">
          Ajuste as informações da empresa, dados de pagamento Pix, taxas de entrega e horários de atendimento.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identidade do Ateliê */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Store className="w-4 h-4 text-rose-500" />
            <h2 className="font-serif text-base font-bold text-stone-900">
              Dados do Ateliê & Contato
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nome Fantasia</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Slogan / Frase de Destaque</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                WhatsApp de Vendas (receberá os pedidos formatados)
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500 font-medium text-emerald-700"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Instagram</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">Endereço do Ateliê (Para retiradas)</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">Horários de Atendimento</label>
              <input
                type="text"
                value={formData.businessHours}
                onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Chave Pix */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h2 className="font-serif text-base font-bold text-stone-900">
              Pagamento via Pix Direto (Sem Intermediários)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Tipo de Chave</label>
              <select
                value={formData.pixKeyType}
                onChange={(e) => setFormData({ ...formData, pixKeyType: e.target.value as any })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm"
              >
                <option value="email">E-mail</option>
                <option value="cpf">CPF</option>
                <option value="cnpj">CNPJ</option>
                <option value="phone">Telefone</option>
                <option value="random">Chave Aleatória</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Chave Pix</label>
              <input
                type="text"
                value={formData.pixKey}
                onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-mono focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">Nome do Titular da Conta</label>
              <input
                type="text"
                value={formData.pixReceiverName}
                onChange={(e) => setFormData({ ...formData, pixReceiverName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Taxas & Entrega */}
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="font-serif text-base font-bold text-stone-900">
              Taxa de Entrega & Política de Encomendas
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Taxa de Entrega Padrão (R$)
              </label>
              <input
                type="number"
                step="any"
                value={formData.defaultDeliveryFee}
                onChange={(e) =>
                  setFormData({ ...formData, defaultDeliveryFee: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Valor Mínimo para Frete Grátis (R$)
              </label>
              <input
                type="number"
                step="any"
                value={formData.freeDeliveryMinAmount}
                onChange={(e) =>
                  setFormData({ ...formData, freeDeliveryMinAmount: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-stone-200 bg-stone-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isOpen}
                  onChange={(e) => setFormData({ ...formData, isOpen: e.target.checked })}
                  className="rounded-sm border-stone-300 text-rose-500 focus:ring-rose-400"
                />
                <span className="text-xs text-stone-800 font-semibold">
                  Loja aberta recebendo pedidos online no site neste momento
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Configurações da API de WhatsApp */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8D5C4] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F2E8DF] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C69255]" />
              <h2 className="font-serif text-base font-bold text-[#3D1F0D]">
                Automação e API de Notificações WhatsApp
              </h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.whatsappAutoNotify}
                onChange={(e) => setFormData({ ...formData, whatsappAutoNotify: e.target.checked })}
                className="rounded-sm border-[#D5BFA8] text-[#3D1F0D]"
              />
              <span className="text-xs font-semibold text-[#3D1F0D]">
                Disparo Automático Ativado
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#3D1F0D] mb-1">
                URL da API (Evolution API / Z-API)
              </label>
              <input
                type="text"
                placeholder="https://api.evolution.com"
                value={formData.whatsappApiUrl || ''}
                onChange={(e) => setFormData({ ...formData, whatsappApiUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs font-mono focus:outline-hidden focus:border-[#3D1F0D]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#3D1F0D] mb-1">
                Chave da API (ApiKey / Token)
              </label>
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={formData.whatsappApiKey || ''}
                onChange={(e) => setFormData({ ...formData, whatsappApiKey: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs font-mono focus:outline-hidden focus:border-[#3D1F0D]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#3D1F0D] mb-1">
                Nome da Instância
              </label>
              <input
                type="text"
                placeholder="anamelo"
                value={formData.whatsappInstanceName || ''}
                onChange={(e) => setFormData({ ...formData, whatsappInstanceName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs focus:outline-hidden focus:border-[#3D1F0D]"
              />
            </div>
          </div>
          <p className="text-[11px] text-[#7A5A43] leading-relaxed">
            Quando ativado, cada vez que o status de uma encomenda for alterado no Kanban (ex: "Pronto para Retirada"), uma mensagem padronizada com o endereço do ateliê é enviada automaticamente para o cliente.
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3">
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-[#3D1F0D] hover:bg-[#2C1407] text-white font-semibold text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Configurações Salvas!' : 'Salvar Alterações'}</span>
        </button>
        </div>
      </form>
    </div>
  );
}
