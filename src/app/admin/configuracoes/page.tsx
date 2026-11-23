'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import {
  Settings,
  Save,
  Check,
  Sparkles,
  Store,
  ShieldCheck,
  Calendar,
  ExternalLink,
  CreditCard,
  QrCode,
  Clock,
  Ban,
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export default function AdminConfiguracoesPage() {
  const { settings, updateSettings, addBlockedDate, removeBlockedDate } = useStore();

  const [formData, setFormData] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Estado para novo bloqueio de data
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('Capacidade Esgotada');

  React.useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddBlockedDate = () => {
    if (!newBlockDate) {
      alert('Por favor, selecione uma data para bloquear.');
      return;
    }
    const exists = formData.blockedDates?.some((b) => b.date === newBlockDate);
    if (exists) {
      alert('Esta data já está na lista de bloqueios.');
      return;
    }

    const updated = [
      ...(formData.blockedDates || []),
      {
        id: `blk-${Date.now()}`,
        date: newBlockDate,
        reason: newBlockReason.trim() || 'Capacidade Esgotada',
      },
    ];

    setFormData({ ...formData, blockedDates: updated });
    updateSettings({ blockedDates: updated });
    setNewBlockDate('');
  };

  const handleRemoveBlockedDate = (id: string) => {
    const updated = (formData.blockedDates || []).filter((b) => b.id !== id);
    setFormData({ ...formData, blockedDates: updated });
    updateSettings({ blockedDates: updated });
  };

  return (
    <div className="space-y-6 max-w-4xl pb-16">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2E1609]">
          Configurações da Confeitaria
        </h1>
        <p className="text-xs sm:text-sm text-[#7A5A43] mt-1">
          Ajuste as informações da empresa, formas de pagamento direto (Pix e Cartão), regras de sinal de 50%, prazos de produção e bloqueio de agenda por capacidade esgotada.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identidade do Ateliê & Privacidade */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8D5C4] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#F2E8DF] pb-3">
            <Store className="w-4 h-4 text-[#C69255]" />
            <h2 className="font-serif text-base font-bold text-[#2E1609]">
              Dados do Ateliê & Contato
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#2E1609] mb-1">Nome Fantasia</label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs sm:text-sm focus:outline-hidden focus:border-[#2E1609] font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2E1609] mb-1">Slogan / Frase de Destaque</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs sm:text-sm focus:outline-hidden focus:border-[#2E1609]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2E1609] mb-1">
                WhatsApp de Vendas (receberá os pedidos formatados)
              </label>
              <input
                type="text"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs sm:text-sm focus:outline-hidden focus:border-[#2E1609] font-medium text-emerald-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2E1609] mb-1">Instagram (@)</label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs sm:text-sm focus:outline-hidden focus:border-[#2E1609]"
              />
            </div>

            <div className="sm:col-span-2 space-y-3 p-4 rounded-xl bg-[#FAF7F3] border border-[#E8D5C4]">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-semibold text-[#2E1609] text-xs block">
                    Modo Residencial (Privacidade de Endereço)
                  </label>
                  <p className="text-[11px] text-[#7A5A43]">
                    Oculte a rua e número na loja pública para proteger a residência. O endereço completo só é enviado privadamente na confirmação do pedido pelo WhatsApp.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!formData.showExactAddressPublicly}
                    onChange={(e) => setFormData({ ...formData, showExactAddressPublicly: !e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E1609]"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#E8D5C4]">
                <div>
                  <label className="block font-semibold text-[#2E1609] mb-1">
                    Endereço Real Completo (Privado / Confirmação)
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D5BFA8] bg-white text-xs font-medium focus:outline-hidden focus:border-[#2E1609]"
                    placeholder="Rua Marcio Bacaraim Possebom 2082"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2E1609] mb-1">
                    Texto Exibido no Site Público
                  </label>
                  <input
                    type="text"
                    value={formData.publicAddressText || ''}
                    onChange={(e) => setFormData({ ...formData, publicAddressText: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D5BFA8] bg-white text-xs focus:outline-hidden focus:border-[#2E1609]"
                    placeholder="Ateliê em Maringá - PR (Endereço enviado na confirmação)"
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#2E1609] mb-1">Horários de Atendimento & Produção</label>
              <input
                type="text"
                value={formData.businessHours}
                onChange={(e) => setFormData({ ...formData, businessHours: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs sm:text-sm focus:outline-hidden focus:border-[#2E1609]"
              />
            </div>
          </div>
        </div>

        {/* FORMAS DE PAGAMENTO: PIX E CARTÃO DIRETO */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8D5C4] shadow-2xs space-y-5">
          <div className="flex items-center gap-2 border-b border-[#F2E8DF] pb-3">
            <QrCode className="w-4 h-4 text-[#C69255]" />
            <h2 className="font-serif text-base font-bold text-[#2E1609]">
              Formas de Pagamento Direto (Pix & Cartão)
            </h2>
          </div>

          {/* Pix Oficial */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-[#2E1609] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Pagamento via Pix (QR Code Automático + Copia e Cola)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-[#7A5A43] mb-1">Tipo de Chave</label>
                <select
                  value={formData.pixKeyType}
                  onChange={(e) => setFormData({ ...formData, pixKeyType: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] bg-white text-xs"
                >
                  <option value="phone">Telefone</option>
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="random">Chave Aleatória</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#7A5A43] mb-1">Chave Pix</label>
                <input
                  type="text"
                  value={formData.pixKey}
                  onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs font-mono focus:outline-hidden focus:border-[#2E1609]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#7A5A43] mb-1">Nome do Titular</label>
                <input
                  type="text"
                  value={formData.pixReceiverName}
                  onChange={(e) => setFormData({ ...formData, pixReceiverName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs focus:outline-hidden focus:border-[#2E1609]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#7A5A43] mb-1">Cidade do Titular</label>
                <input
                  type="text"
                  value={formData.pixCity || 'MARINGA'}
                  onChange={(e) => setFormData({ ...formData, pixCity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs focus:outline-hidden focus:border-[#2E1609]"
                  placeholder="MARINGA"
                />
              </div>
            </div>
            <p className="text-[11px] text-[#7A5A43]">
              O sistema gera automaticamente o QR Code padrão Banco Central (EMVCo) e o código Pix Copia e Cola com o valor exato da encomenda.
            </p>
          </div>

          {/* Cartão de Crédito / Link Direto */}
          <div className="pt-4 border-t border-[#F2E8DF] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2E1609] flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-[#C69255]" />
                Pagamento no Cartão (Link de Pagamento Direto)
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enableCardPayment}
                  onChange={(e) => setFormData({ ...formData, enableCardPayment: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E1609]"></div>
              </label>
            </div>

            <div className="text-xs space-y-1">
              <label className="block font-semibold text-[#7A5A43]">
                Link de Checkout de Cartão (Mercado Pago / InfinitePay / Stone / PagBank)
              </label>
              <input
                type="url"
                placeholder="https://link.mercadopago.com.br/anameloconfeitaria"
                value={formData.cardPaymentLink || ''}
                onChange={(e) => setFormData({ ...formData, cardPaymentLink: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs font-mono focus:outline-hidden focus:border-[#2E1609]"
              />
              <p className="text-[11px] text-[#7A5A43]">
                Ao selecionar "Cartão", o cliente é redirecionado diretamente para este link oficial para parcelar ou pagar no débito/crédito.
              </p>
            </div>
          </div>
        </div>

        {/* REGRA DE ENCOMENDAS: SINAL 50% + 50% NA VÉSPERA */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8D5C4] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F2E8DF] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C69255]" />
              <h2 className="font-serif text-base font-bold text-[#2E1609]">
                Regra de Sinal (50% no Pedido + 50% na Véspera)
              </h2>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableHalfDepositForPreOrders}
                onChange={(e) => setFormData({ ...formData, enableHalfDepositForPreOrders: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E1609]"></div>
            </label>
          </div>

          <p className="text-xs text-[#7A5A43] leading-relaxed">
            Quando ativado, o cliente pode optar na sacola entre pagar um <strong>sinal de 50%</strong> para reserva da data de produção ou <strong>100% à vista</strong>. No Calendário & Kanban de Encomendas, o status de pagamento exibirá separadamente o Sinal e o Restante.
          </p>
        </div>

        {/* PRAZOS MÍNIMOS DE ANTECEDÊNCIA */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8D5C4] shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#F2E8DF] pb-3">
            <Clock className="w-4 h-4 text-[#C69255]" />
            <h2 className="font-serif text-base font-bold text-[#2E1609]">
              Prazos Mínimos de Antecedência para Encomendas
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#2E1609] mb-1">
                Doces de Festa (Gourmet e Tradicionais)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={formData.minNoticeDaysSweets ?? 2}
                  onChange={(e) =>
                    setFormData({ ...formData, minNoticeDaysSweets: parseInt(e.target.value, 10) || 2 })
                  }
                  className="w-24 px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs sm:text-sm focus:outline-hidden focus:border-[#2E1609] font-bold text-center"
                />
                <span className="text-[#7A5A43]">dias de antecedência mínima</span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#2E1609] mb-1">
                Bolos Artesanais & Decorados
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={formData.minNoticeDaysCakes ?? 3}
                  onChange={(e) =>
                    setFormData({ ...formData, minNoticeDaysCakes: parseInt(e.target.value, 10) || 3 })
                  }
                  className="w-24 px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs sm:text-sm focus:outline-hidden focus:border-[#2E1609] font-bold text-center"
                />
                <span className="text-[#7A5A43]">dias de antecedência mínima</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-[#7A5A43]">
            O seletor de data da sacola desabilitará datas anteriores a esse prazo automaticamente.
          </p>
        </div>

        {/* BLOQUEIO DE DATAS / CAPACIDADE ESGOTADA / FÉRIAS */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8D5C4] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F2E8DF] pb-3">
            <div className="flex items-center gap-2">
              <Ban className="w-4 h-4 text-red-600" />
              <h2 className="font-serif text-base font-bold text-[#2E1609]">
                Bloqueio de Datas & Fechamento de Agenda
              </h2>
            </div>
            <span className="text-[11px] text-[#7A5A43]">
              {formData.blockedDates?.length || 0} datas bloqueadas
            </span>
          </div>

          <p className="text-xs text-[#7A5A43] leading-relaxed">
            Feche dias ou semanas específicas quando a capacidade de produção do ateliê estiver esgotada, feriados ou férias. Os clientes não conseguirão agendar pedidos para as datas bloqueadas.
          </p>

          {/* Adicionar Bloqueio */}
          <div className="p-4 rounded-xl bg-[#FAF7F3] border border-[#E8D5C4] space-y-3">
            <span className="text-xs font-semibold text-[#2E1609] block">
              Adicionar Nova Data para Bloqueio:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <input
                  type="date"
                  value={newBlockDate}
                  onChange={(e) => setNewBlockDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5BFA8] text-xs bg-white focus:outline-hidden"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Motivo (ex: Capacidade Esgotada, Férias)"
                  value={newBlockReason}
                  onChange={(e) => setNewBlockReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#D5BFA8] text-xs bg-white focus:outline-hidden"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleAddBlockedDate}
                  className="w-full py-2 bg-[#2E1609] hover:bg-[#1F1108] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Bloquear Data</span>
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Datas Bloqueadas */}
          {formData.blockedDates && formData.blockedDates.length > 0 ? (
            <div className="space-y-2">
              {formData.blockedDates.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-red-200 bg-red-50/60 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-red-900 bg-red-100 px-2.5 py-1 rounded-md">
                      {item.date.split('-').reverse().join('/')}
                    </span>
                    <span className="text-red-800 font-medium">
                      {item.reason || 'Capacidade Esgotada'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveBlockedDate(item.id)}
                    className="p-1.5 text-red-600 hover:text-red-900 rounded-lg hover:bg-red-100 transition-colors"
                    title="Desbloquear data"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-[#7A5A43] bg-[#FAF7F3] rounded-xl border border-[#E8D5C4]">
              Nenhuma data bloqueada no momento. Todas as datas respeitando o prazo mínimo estão liberadas para encomendas.
            </div>
          )}
        </div>

        {/* Configurações da API de WhatsApp */}
        <div className="p-6 rounded-2xl bg-white border border-[#E8D5C4] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F2E8DF] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C69255]" />
              <h2 className="font-serif text-base font-bold text-[#2E1609]">
                Automação e API de Notificações WhatsApp
              </h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.whatsappAutoNotify}
                onChange={(e) => setFormData({ ...formData, whatsappAutoNotify: e.target.checked })}
                className="rounded-sm border-[#D5BFA8] text-[#2E1609]"
              />
              <span className="text-xs font-semibold text-[#2E1609]">
                Disparo Automático Ativado
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#2E1609] mb-1">
                URL da API (Evolution API / Z-API)
              </label>
              <input
                type="text"
                placeholder="https://api.evolution.com"
                value={formData.whatsappApiUrl || ''}
                onChange={(e) => setFormData({ ...formData, whatsappApiUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs font-mono focus:outline-hidden focus:border-[#2E1609]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2E1609] mb-1">
                Chave da API (ApiKey / Token)
              </label>
              <input
                type="password"
                placeholder="••••••••••••••••"
                value={formData.whatsappApiKey || ''}
                onChange={(e) => setFormData({ ...formData, whatsappApiKey: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs font-mono focus:outline-hidden focus:border-[#2E1609]"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#2E1609] mb-1">
                Nome da Instância
              </label>
              <input
                type="text"
                placeholder="anamelo"
                value={formData.whatsappInstanceName || ''}
                onChange={(e) => setFormData({ ...formData, whatsappInstanceName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs focus:outline-hidden focus:border-[#2E1609]"
              />
            </div>
          </div>
          <p className="text-[11px] text-[#7A5A43] leading-relaxed">
            Quando ativado, cada vez que o status de uma encomenda for alterado no Kanban (ex: "Pronto para Retirada"), uma mensagem padronizada com o endereço do ateliê é enviada automaticamente para o WhatsApp do cliente.
          </p>
        </div>

        {/* Integração com Planilha do Parceiro (OneDrive / Excel) */}
        <div className="p-6 rounded-2xl bg-white border border-[#D5BFA8] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EFE4D8] pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C69255]" />
              <h2 className="font-serif text-base font-bold text-[#2E1609]">
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
              <div className="w-11 h-6 bg-stone-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E1609]"></div>
            </label>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-[#2E1609] mb-1">
                Link de Compartilhamento da Planilha (OneDrive / Excel Online)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://1drv.ms/x/..."
                  value={formData.partnerSpreadsheetUrl || ''}
                  onChange={(e) => setFormData({ ...formData, partnerSpreadsheetUrl: e.target.value })}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs font-mono focus:outline-hidden focus:border-[#2E1609]"
                />
                {formData.partnerSpreadsheetUrl && (
                  <a
                    href={formData.partnerSpreadsheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-[#FAF7F3] border border-[#D5BFA8] hover:bg-[#EFE4D8] text-[#2E1609] font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>Abrir Planilha</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <p className="text-[11px] text-[#7A5A43] leading-relaxed">
              As encomendas preenchidas pelo parceiro nas abas mensais do Excel (como Vanessa, Mariana, Fabio, Amanda) são lidas em tempo real e convertidas em pedidos com data, quantidade e valores no <strong>Calendário & Kanban de Encomendas</strong>.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#2E1609] hover:bg-[#1F1108] text-white font-semibold text-sm flex items-center gap-2 shadow-sm transition-all active:scale-95"
          >
            {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{savedSuccess ? 'Configurações Salvas!' : 'Salvar Alterações'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}