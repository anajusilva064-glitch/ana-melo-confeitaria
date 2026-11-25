'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency } from '@/lib/utils';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  listAdminUsers,
  approveUserAccess,
  rejectUserAccess,
  deleteUserAccess,
  updateAdminPassword,
  AdminUserProfile,
} from '@/lib/supabase-auth';
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
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  KeyRound,
  Phone,
  Smartphone,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function AdminConfiguracoesPage() {
  const { settings, updateSettings, addBlockedDate, removeBlockedDate } = useStore();

  const [formData, setFormData] = useState(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Estado para gestão de usuários Supabase
  const [adminUsers, setAdminUsers] = useState<AdminUserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userActionMessage, setUserActionMessage] = useState<string | null>(null);

  // Estado para redefinição de senha pelo próprio administrador
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput || newPasswordInput.length < 6) {
      setPasswordStatus({ success: false, message: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordStatus({ success: false, message: 'As senhas não coincidem. Digite a mesma senha nos dois campos.' });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordStatus(null);
    const res = await updateAdminPassword(newPasswordInput);
    setIsUpdatingPassword(false);
    setPasswordStatus(res);
    if (res.success) {
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setTimeout(() => setPasswordStatus(null), 4000);
    }
  };

  // Estados para Conexão Direta WhatsApp (QR Code Nativo)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'checking'>('checking');
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState<boolean>(false);
  const [connectedPhone, setConnectedPhone] = useState<string | null>(null);
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>('');
  const [testSendStatus, setTestSendStatus] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  const checkWhatsAppStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      if (data.connected) {
        setConnectionStatus('connected');
        setConnectedPhone(data.numeroConectado || 'WhatsApp Conectado');
        setQrCodeImage(null);
      } else if (data.status === 'QR_PRONTO' && data.qrCode) {
        setConnectionStatus('connecting');
        setQrCodeImage(data.qrCode);
      } else if (connectionStatus !== 'connecting') {
        setConnectionStatus('disconnected');
      }
    } catch {
      if (connectionStatus !== 'connecting') {
        setConnectionStatus('disconnected');
      }
    }
  };

  useEffect(() => {
    checkWhatsAppStatus();
    const interval = setInterval(() => {
      checkWhatsAppStatus();
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateQrCode = async (forcarNovo = false) => {
    setIsLoadingQr(true);
    setConnectionStatus('connecting');
    try {
      const res = await fetch('/api/whatsapp/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forcarNovoQr: forcarNovo }),
      });
      const data = await res.json();
      if (data.qrCode) {
        setQrCodeImage(data.qrCode);
        setConnectionStatus('connecting');
      } else if (data.connected) {
        setConnectionStatus('connected');
        setConnectedPhone(data.numeroConectado);
      } else if (data.ultimoErro || data.status === 'ERRO') {
        alert(data.ultimoErro || 'Erro ao gerar QR Code do WhatsApp. Tente novamente.');
        setConnectionStatus('disconnected');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro na requisição';
      alert(msg);
      setConnectionStatus('disconnected');
    } finally {
      setIsLoadingQr(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!confirm('Deseja realmente desconectar o WhatsApp do ateliê?')) return;
    try {
      await fetch('/api/whatsapp/disconnect', { method: 'POST' });
      setConnectionStatus('disconnected');
      setQrCodeImage(null);
      setConnectedPhone(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao desconectar';
      alert(msg);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testPhoneNumber.trim()) {
      alert('Informe um número de WhatsApp com DDD para testar (ex: 44999739472).');
      return;
    }
    setIsSendingTest(true);
    setTestSendStatus(null);
    try {
      const res = await fetch('/api/whatsapp/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhoneNumber,
          message: '🎂 *Ana Melo Confeitaria*: Teste de conexão direta do WhatsApp realizado com sucesso! O sistema está pronto para disparar notificações automáticas.',
          orderNumber: '#TESTE',
          status: 'ready',
          customerName: 'Cliente Teste',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestSendStatus('Mensagem de teste enviada com sucesso no WhatsApp!');
      } else {
        setTestSendStatus(`Falha no envio: ${data.error || 'Verifique se o número possui WhatsApp'}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro';
      setTestSendStatus(`Erro: ${msg}`);
    } finally {
      setIsSendingTest(false);
      setTimeout(() => setTestSendStatus(null), 5000);
    }
  };

  const fetchUsers = async () => {
    if (!isSupabaseConfigured) return;
    setIsLoadingUsers(true);
    const users = await listAdminUsers();
    setAdminUsers(users);
    setIsLoadingUsers(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    setUserActionMessage(null);
    const ok = await approveUserAccess(userId, 'current-admin');
    if (ok) {
      setUserActionMessage('Usuário aprovado com sucesso!');
      await fetchUsers();
    } else {
      setUserActionMessage('Erro ao aprovar usuário.');
    }
    setTimeout(() => setUserActionMessage(null), 3500);
  };

  const handleReject = async (userId: string) => {
    setUserActionMessage(null);
    const ok = await rejectUserAccess(userId);
    if (ok) {
      setUserActionMessage('Acesso do usuário recusado/revogado.');
      await fetchUsers();
    } else {
      setUserActionMessage('Erro ao alterar status do usuário.');
    }
    setTimeout(() => setUserActionMessage(null), 3500);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Deseja realmente remover o registro deste usuário da lista de autorizações?')) {
      return;
    }
    setUserActionMessage(null);
    const ok = await deleteUserAccess(userId);
    if (ok) {
      setUserActionMessage('Usuário removido da lista.');
      await fetchUsers();
    } else {
      setUserActionMessage('Erro ao excluir usuário.');
    }
    setTimeout(() => setUserActionMessage(null), 3500);
  };

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
                    placeholder="Ateliê em Umuarama - PR (Endereço enviado na confirmação)"
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
                  value={formData.pixCity || 'UMUARAMA'}
                  onChange={(e) => setFormData({ ...formData, pixCity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs focus:outline-hidden focus:border-[#2E1609]"
                  placeholder="UMUARAMA"
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
            O seletor de data da sacola desabilitará datas anteriores a esse prazo automaticamente. O fechamento e bloqueio de datas da agenda agora é gerenciado diretamente na tela de <strong>Agenda & Calendário de Encomendas</strong>.
          </p>
        </div>

        {/* Central de Conexão WhatsApp (QR Code / API Cotafacil) */}
        <div className="p-6 rounded-2xl bg-white border border-[#D5BFA8] shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EFE4D8] pb-4 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                <QrCode className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="font-serif text-base font-bold text-[#2E1609] flex items-center gap-2">
                  <span>Conexão Direta WhatsApp (QR Code)</span>
                  {connectionStatus === 'connected' ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Conectado
                    </span>
                  ) : connectionStatus === 'connecting' ? (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                      Aguardando Leitura
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-300">
                      Desconectado
                    </span>
                  )}
                </h2>
                <p className="text-xs text-[#7A5A43]">
                  Conecte o WhatsApp do ateliê diretamente pelo sistema lendo o QR Code com a câmera do WhatsApp.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer self-start sm:self-auto">
              <input
                type="checkbox"
                checked={formData.whatsappAutoNotify}
                onChange={(e) => setFormData({ ...formData, whatsappAutoNotify: e.target.checked })}
                className="rounded-sm border-[#D5BFA8] text-[#2E1609]"
              />
              <span className="text-xs font-semibold text-[#2E1609]">
                Disparo Automático Ativo
              </span>
            </label>
          </div>

          {/* STATUS: CONECTADO */}
          {connectionStatus === 'connected' && (
            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp Pareado e Operando</span>
                    </h3>
                    <p className="text-[11px] text-emerald-800">
                      Dispositivo: <strong>{connectedPhone}</strong> • Instância: <code>{formData.whatsappInstanceName || 'anamelo'}</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={checkWhatsAppStatus}
                    className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-100 text-emerald-900 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Verificar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnectWhatsApp}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    Desconectar
                  </button>
                </div>
              </div>

              {/* Teste de Disparo Real */}
              <div className="pt-3 border-t border-emerald-200/70 space-y-2">
                <span className="text-xs font-bold text-emerald-950 block">
                  Testar Envio de Mensagem Direta:
                </span>
                <div className="flex flex-col sm:flex-row gap-2 max-w-md">
                  <input
                    type="tel"
                    placeholder="DDD + Telefone (ex: 44999739472)"
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-emerald-300 bg-white text-xs text-[#2E1609] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleSendTestMessage}
                    disabled={isSendingTest}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{isSendingTest ? 'Enviando...' : 'Testar Mensagem'}</span>
                  </button>
                </div>
                {testSendStatus && (
                  <p className="text-[11px] font-semibold text-emerald-900">
                    {testSendStatus}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STATUS: CONECTANDO / EXIBINDO QR CODE */}
          {connectionStatus === 'connecting' && (
            <div className="p-6 rounded-2xl bg-[#FAF7F3] border border-[#E8D5C4] text-center space-y-4">
              <div className="max-w-md mx-auto space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                  <span>Escaneie com seu WhatsApp</span>
                </div>

                <h3 className="font-serif text-base font-bold text-[#2E1609]">
                  Aponte a câmera do WhatsApp para conectar
                </h3>

                {/* Box do QR Code */}
                <div className="w-64 h-64 mx-auto p-3 bg-white rounded-2xl border-2 border-[#D5BFA8] shadow-md flex items-center justify-center relative">
                  {isLoadingQr ? (
                    <div className="space-y-2 text-center text-xs text-[#7A5A43]">
                      <RefreshCw className="w-8 h-8 mx-auto animate-spin text-[#C69255]" />
                      <p>Gerando QR Code...</p>
                    </div>
                  ) : qrCodeImage ? (
                    <img
                      src={qrCodeImage}
                      alt="QR Code WhatsApp"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <p className="text-xs text-[#7A5A43]">Carregando...</p>
                  )}
                </div>

                {/* Instruções passo a passo */}
                <div className="text-left bg-white p-4 rounded-xl border border-[#E8D5C4] text-xs space-y-1.5 text-[#5A3821]">
                  <p className="font-bold text-[#2E1609]">Como conectar no seu celular:</p>
                  <p>1. Abra o <strong>WhatsApp</strong> no seu smartphone.</p>
                  <p>2. Toque em <strong>Configurações</strong> (iPhone) ou nos <strong>3 pontinhos</strong> (Android).</p>
                  <p>3. Selecione <strong>Aparelhos Conectados</strong> ➔ <strong>Conectar um aparelho</strong>.</p>
                  <p>4. Aponte a câmera para o QR Code acima. O sistema conectará automaticamente!</p>
                </div>

                <div className="flex justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleGenerateQrCode(true)}
                    disabled={isLoadingQr}
                    className="px-4 py-2 rounded-xl bg-white border border-[#D5BFA8] hover:bg-[#EFE4D8] text-xs font-semibold text-[#2E1609] flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQr ? 'animate-spin' : ''}`} />
                    <span>Recarregar QR Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setConnectionStatus('disconnected');
                      setQrCodeImage(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-xs font-semibold text-stone-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STATUS: DESCONECTADO OU CHECANDO */}
          {connectionStatus === 'disconnected' && (
            <div className="p-6 rounded-2xl bg-[#FAF7F3] border border-[#E8D5C4] text-center space-y-3">
              <div className="w-14 h-14 rounded-3xl bg-white border border-[#D5BFA8] flex items-center justify-center text-[#2E1609] mx-auto shadow-2xs">
                <QrCode className="w-7 h-7 text-[#C69255]" />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-base font-bold text-[#2E1609]">
                  Nenhum WhatsApp Conectado no Momento
                </h3>
                <p className="text-xs text-[#7A5A43] max-w-md mx-auto">
                  Clique no botão abaixo para gerar o QR Code na tela. Basta escanear com seu celular para o sistema começar a enviar as mensagens automáticas.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleGenerateQrCode(true)}
                  disabled={isLoadingQr}
                  className="px-6 py-3 rounded-xl bg-[#2E1609] hover:bg-[#1F1108] text-white text-xs font-bold flex items-center justify-center gap-2 mx-auto shadow-sm transition-all cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-[#C69255]" />
                  <span>{isLoadingQr ? 'Gerando QR Code...' : 'Gerar QR Code para Conectar WhatsApp'}</span>
                </button>
              </div>
            </div>
          )}
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

        {/* Alterar Senha de Acesso do Administrador */}
        <div className="p-6 rounded-2xl bg-white border border-[#D5BFA8] shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#EFE4D8] pb-4">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F3] border border-[#D5BFA8] flex items-center justify-center text-[#2E1609]">
              <KeyRound className="w-5 h-5 text-[#C69255]" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#2E1609]">
                Minha Senha de Acesso (Supabase)
              </h2>
              <p className="text-xs text-[#7A5A43]">
                Defina ou altere sua senha de login a qualquer momento diretamente por aqui.
              </p>
            </div>
          </div>

          {passwordStatus && (
            <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              passwordStatus.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}>
              {passwordStatus.success ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{passwordStatus.message}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#2E1609] mb-1.5">
                  Nova Senha (Mín. 6 caracteres)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] bg-[#FAF7F3] text-xs text-[#2E1609] focus:outline-hidden focus:border-[#C69255]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2E1609] mb-1.5">
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] bg-[#FAF7F3] text-xs text-[#2E1609] focus:outline-hidden focus:border-[#C69255]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="px-5 py-2.5 rounded-xl bg-[#2E1609] hover:bg-[#3D1F0D] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#C69255]" />
              <span>{isUpdatingPassword ? 'Salvando nova senha...' : 'Atualizar Minha Senha'}</span>
            </button>
          </form>
        </div>

        {/* Gestão de Usuários e Autorizações (Supabase Auth) */}
        <div className="p-6 rounded-2xl bg-white border border-[#D5BFA8] shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EFE4D8] pb-4 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF7F3] border border-[#D5BFA8] flex items-center justify-center text-[#2E1609]">
                <Users className="w-5 h-5 text-[#C69255]" />
              </div>
              <div>
                <h2 className="font-serif text-base font-bold text-[#2E1609] flex items-center gap-2">
                  <span>Controle de Acesso e Usuários (Supabase Auth)</span>
                  <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Aprovação Obrigatória
                  </span>
                </h2>
                <p className="text-xs text-[#7A5A43]">
                  Apenas usuários aprovados pelo administrador conseguem entrar no sistema.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              disabled={isLoadingUsers}
              className="px-3 py-1.5 rounded-xl border border-[#D5BFA8] hover:bg-[#FAF7F3] text-xs font-semibold text-[#2E1609] flex items-center gap-1.5 self-start sm:self-auto transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
              <span>Atualizar Lista</span>
            </button>
          </div>

          {userActionMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{userActionMessage}</span>
            </div>
          )}

          {!isSupabaseConfigured ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
              <p className="font-semibold text-amber-950 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Supabase ainda não configurado no .env.local
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Para ativar a listagem e aprovação em tempo real pelo banco de dados, insira suas credenciais do Supabase no arquivo <code>.env.local</code> e execute o script <code>supabase_setup.sql</code> no seu SQL Editor do Supabase.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {adminUsers.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-[#D5BFA8] rounded-xl text-xs text-[#7A5A43] space-y-1">
                  <p className="font-medium text-[#2E1609]">Nenhum usuário cadastrado na tabela de autorização ainda.</p>
                  <p className="text-[11px]">Quando novos colaboradores solicitarem acesso na tela de login, eles aparecerão aqui para sua aprovação.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#EFE4D8] text-[#7A5A43] font-semibold">
                        <th className="pb-2.5">Nome / Colaborador</th>
                        <th className="pb-2.5">E-mail</th>
                        <th className="pb-2.5">Status de Acesso</th>
                        <th className="pb-2.5">Data Solicitação</th>
                        <th className="pb-2.5 text-right">Ações do Administrador</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5ECE1]">
                      {adminUsers.map((user) => {
                        const isApproved = user.is_approved && user.role === 'admin';
                        const isPending = user.role === 'pending' || (!user.is_approved && user.role !== 'rejected');
                        const isRejected = user.role === 'rejected';

                        return (
                          <tr key={user.id} className="hover:bg-[#FAF7F3]/60 transition-colors">
                            <td className="py-3 font-medium text-[#2E1609]">
                              {user.full_name || 'Sem nome informado'}
                            </td>
                            <td className="py-3 text-[#5A3825] font-mono text-[11px]">
                              {user.email}
                            </td>
                            <td className="py-3">
                              {isApproved && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <UserCheck className="w-3 h-3 text-emerald-600" />
                                  Aprovado (Admin)
                                </span>
                              )}
                              {isPending && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                  <Clock className="w-3 h-3 text-amber-600" />
                                  Pendente Aprovação
                                </span>
                              )}
                              {isRejected && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                  <UserX className="w-3 h-3 text-rose-600" />
                                  Acesso Recusado
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-[#7A5A43] text-[11px]">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                            </td>
                            <td className="py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {isPending && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleApprove(user.id)}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
                                      title="Autorizar este usuário a acessar o painel"
                                    >
                                      <UserCheck className="w-3 h-3" />
                                      <span>Aprovar</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleReject(user.id)}
                                      className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                                      title="Recusar solicitação de acesso"
                                    >
                                      <UserX className="w-3 h-3" />
                                      <span>Recusar</span>
                                    </button>
                                  </>
                                )}

                                {isApproved && (
                                  <button
                                    type="button"
                                    onClick={() => handleReject(user.id)}
                                    className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-rose-50 text-[#7A5A43] hover:text-rose-700 border border-[#D5BFA8] font-semibold text-[11px] flex items-center gap-1 transition-colors"
                                    title="Revogar acesso deste administrador"
                                  >
                                    <Ban className="w-3 h-3" />
                                    <span>Revogar Acesso</span>
                                  </button>
                                )}

                                {isRejected && (
                                  <button
                                    type="button"
                                    onClick={() => handleApprove(user.id)}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                                    title="Reativar e aprovar acesso"
                                  >
                                    <UserCheck className="w-3 h-3" />
                                    <span>Reaprovar</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="p-1 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                                  title="Excluir da lista"
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
              )}

              <div className="p-3 rounded-xl bg-[#FAF7F3] border border-[#EFE4D8] text-[11px] text-[#7A5A43] flex items-center justify-between">
                <span>💡 <strong>Dica de Segurança:</strong> Você também pode aprovar usuários manualmente no SQL Editor do Supabase usando o arquivo <code>supabase_setup.sql</code>.</span>
              </div>
            </div>
          )}
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