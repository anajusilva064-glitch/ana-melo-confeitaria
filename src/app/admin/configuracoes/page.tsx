'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { Settings, Save, Check, Sparkles, Store, ShieldCheck, Calendar, ExternalLink } from 'lucide-react';

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

            <div className="sm:col-span-2 space-y-3 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-semibold text-stone-900 text-xs block">
                    Privacidade de Endereço (Atendimento Residencial)
                  </label>
                  <p className="text-[11px] text-stone-500">
                    Oculte a rua e número na loja pública para proteger a residência. O endereço completo só é enviado privadamente na confirmação do pedido.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!formData.showExactAddressPublicly}
                    onChange={(e) => setFormData({ ...formData, showExactAddressPublicly: !e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/60">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Endereço Real Completo (Privado / Confirmação)
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-200 bg-white text-xs font-medium focus:outline-hidden focus:border-amber-600"
                    placeholder="Rua Marcio Bacaraim Possebom 2082"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Texto Exibido no Site Público
                  </label>
                  <input
                    type="text"
                    value={formData.publicAddressText || ''}
                    onChange={(e) => setFormData({ ...formData, publicAddressText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-stone-200 bg-white text-xs focus:outline-hidden focus:border-amber-600"
                    placeholder="Ateliê em Maringá - PR (Endereço enviado na confirmação)"
                  />
                </div>
              </div>
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

        {/* Integração com Planilha de Encomendas do Parceiro (Excel / OneDrive) */}
        <div className="p-6 rounded-2xl bg-white border border-[#D5BFA8] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFE4D8] pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C69255]" />
              <h2 className="font-serif text-base font-bold text-[#3D1F0D]">
                Sincronização com Planilha do Parceiro (Excel / OneDrive)
              </h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.partnerSyncEnabled}
                onChange={(e) => setFormData({ ...formData, partnerSyncEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3D1F0D]"></div>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#3D1F0D] mb-1">
                Link de Compartilhamento da Planilha (OneDrive / Excel Online)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://1drv.ms/x/..."
                  value={formData.partnerSpreadsheetUrl || ''}
                  onChange={(e) => setFormData({ ...formData, partnerSpreadsheetUrl: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs font-mono focus:outline-hidden focus:border-[#3D1F0D]"
                />
                {formData.partnerSpreadsheetUrl && (
                  <a
                    href={formData.partnerSpreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#FAF7F3] border border-[#D5BFA8] hover:bg-[#EFE4D8] text-[#3D1F0D] font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>Abrir Planilha</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <p className="text-[11px] text-[#7A5A43] leading-relaxed">
              As encomendas preenchidas pelo parceiro nas abas mensais do Excel (como Vanessa, Mariana, Fabio, Amanda) são lidas e convertidas diretamente em pedidos com data, quantidade e valores no <strong>Calendário & Kanban de Encomendas</strong>.
            </p>
          </div>
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
