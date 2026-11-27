'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, createWhatsAppLink } from '@/lib/utils';
import { generatePixPayload } from '@/lib/pix';
import QRCode from 'qrcode';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Calendar,
  Clock,
  MapPin,
  Copy,
  Check,
  Send,
  AlertTriangle,
  CreditCard,
  QrCode,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Bike,
  Store,
  MessageCircle,
} from 'lucide-react';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartTotal,
    settings,
    addOrder,
  } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Entrega vs Retirada Balcão (para Pronta Entrega)
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNeighborhood, setDeliveryNeighborhood] = useState('');

  // Identifica se o carrinho contém itens de encomenda agendada (bolos comemorativos ou doces de festa)
  const isPreOrderCart = useMemo(() => {
    return cart.some(
      (item) =>
        Boolean(item.customDetails) ||
        item.productId.includes('bolo') ||
        item.productName.toLowerCase().includes('bolo') ||
        item.productName.toLowerCase().includes('cento') ||
        item.productName.toLowerCase().includes('meio cento') ||
        item.productName.toLowerCase().includes('pacote') ||
        item.productName.toLowerCase().includes('festa')
    );
  }, [cart]);

  // Regras de Prazos e Antecedência (aplicáveis somente para encomendas)
  const hasCakesInCart = useMemo(() => {
    return cart.some(
      (item) =>
        item.productId.includes('bolo') ||
        item.productName.toLowerCase().includes('bolo') ||
        item.customDetails?.dough !== undefined
    );
  }, [cart]);

  const requiredNoticeDays = useMemo(() => {
    return hasCakesInCart
      ? (settings.minNoticeDaysCakes ?? 3)
      : (settings.minNoticeDaysSweets ?? 2);
  }, [hasCakesInCart, settings.minNoticeDaysCakes, settings.minNoticeDaysSweets]);

  // Data mínima calculada a partir de hoje + dias de antecedência (em useEffect para compatibilidade com static prerender)
  const [minDateStr, setMinDateStr] = useState('2026-11-20');
  const [scheduledDate, setScheduledDate] = useState('2026-11-20');
  const [scheduledTime, setScheduledTime] = useState('15:00');
  const [notes, setNotes] = useState('');

  // Atualizar data mínima dinamicamente no client-side
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + requiredNoticeDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const computedMin = `${year}-${month}-${day}`;
    setMinDateStr(computedMin);
    setScheduledDate((prev) => (prev < computedMin ? computedMin : prev));
  }, [requiredNoticeDays]);

  // Checagem de Data Bloqueada / Esgotada (apenas para encomendas)
  const blockedDateInfo = useMemo(() => {
    if (!isPreOrderCart || !settings.blockedDates || !scheduledDate) return null;
    return settings.blockedDates.find((b) => b.date === scheduledDate) || null;
  }, [isPreOrderCart, settings.blockedDates, scheduledDate]);

  // Taxa de entrega se for pronta entrega com delivery
  const deliveryFee = !isPreOrderCart && deliveryType === 'delivery' ? (settings.defaultDeliveryFee || 0) : 0;
  const grandTotal = cartTotal + deliveryFee;

  // Esquema de Pagamento: 50% de Sinal vs 100% Total (sinal exclusivo para encomendas de festa)
  const [paymentScheme, setPaymentScheme] = useState<'half_deposit' | 'full'>('half_deposit');

  // Método de Pagamento: Pix vs Cartão (Link Direto)
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card_link'>('pix');

  // Valores calculados
  const isHalfDeposit = isPreOrderCart && settings.enableHalfDepositForPreOrders && paymentScheme === 'half_deposit';
  const amountToPayNow = isHalfDeposit ? Math.round((grandTotal / 2) * 100) / 100 : grandTotal;
  const remainingAmount = isHalfDeposit ? Math.round((grandTotal - amountToPayNow) * 100) / 100 : 0;

  // Estado de Sucesso / Checkout Concluído
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{
    orderNumber: string;
    totalAmount: number;
    amountToPayNow: number;
    remainingAmount: number;
    paymentScheme: 'half_deposit' | 'full';
    paymentMethod: 'pix' | 'card_link';
    pixPayload?: string;
    pixQrCodeUrl?: string;
    cardPaymentUrl?: string;
    whatsappUrl: string;
  } | null>(null);

  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedRawKey, setCopiedRawKey] = useState(false);

  if (!isCartOpen) return null;

  const handleCopyPix = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleCopyRawKey = (keyToCopy: string) => {
    navigator.clipboard.writeText(keyToCopy);
    setCopiedRawKey(true);
    setTimeout(() => setCopiedRawKey(false), 2500);
  };

  const handleCheckout = async () => {
    if (!customerName.trim()) {
      alert('Por favor, informe seu nome completo.');
      return;
    }
    if (!customerPhone.trim()) {
      alert('Por favor, informe seu WhatsApp para confirmação do pedido.');
      return;
    }

    if (isPreOrderCart) {
      if (blockedDateInfo) {
        alert(`A data escolhida está indisponível (${blockedDateInfo.reason || 'Capacidade Esgotada'}). Por favor, selecione outra data.`);
        return;
      }
      if (scheduledDate < minDateStr) {
        alert(`O prazo mínimo para esta encomenda é de ${requiredNoticeDays} dias. Por favor, selecione uma data a partir de ${minDateStr.split('-').reverse().join('/')}.`);
        return;
      }
    } else {
      if (deliveryType === 'delivery') {
        if (!deliveryAddress.trim()) {
          alert('Por favor, informe seu endereço de entrega (Rua, Número e Complemento).');
          return;
        }
        if (!deliveryNeighborhood.trim()) {
          alert('Por favor, informe o bairro para entrega em Umuarama.');
          return;
        }
      }
    }

    setIsSubmitting(true);

    try {
      // 1. Gera o payload oficial EMV Pix se for Pix
      let pixPayload = '';
      let pixQrCodeUrl = '';

      const tempOrderNum = isPreOrderCart
        ? `ENC-${Date.now().toString().slice(-4)}`
        : `PR-${Date.now().toString().slice(-4)}`;

      if (paymentMethod === 'pix') {
        pixPayload = generatePixPayload({
          pixKey: settings.pixKey,
          keyType: settings.pixKeyType,
          merchantName: settings.pixReceiverName || 'Ana Melo',
          merchantCity: settings.pixCity || 'UMUARAMA',
          amount: amountToPayNow,
          txId: '***',
        });

        try {
          pixQrCodeUrl = await QRCode.toDataURL(pixPayload, {
            width: 280,
            margin: 1,
            color: {
              dark: '#2E1609',
              light: '#FFFFFF',
            },
          });
        } catch (err) {
          console.warn('Erro ao gerar imagem de QR code:', err);
        }
      }

      // 2. Registra o pedido no StoreContext
      const createdOrder = addOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        isPreOrder: isPreOrderCart,
        source: 'storefront',
        deliveryType: isPreOrderCart ? 'pickup' : deliveryType,
        deliveryAddress: !isPreOrderCart && deliveryType === 'delivery' ? deliveryAddress.trim() : undefined,
        deliveryNeighborhood: !isPreOrderCart && deliveryType === 'delivery' ? deliveryNeighborhood.trim() : undefined,
        deliveryFee,
        scheduledDate: isPreOrderCart ? scheduledDate : new Date().toISOString().split('T')[0],
        scheduledTime: isPreOrderCart ? scheduledTime : 'Imediato (30-50 min)',
        items: cart,
        totalAmount: grandTotal,
        paymentMethod: paymentMethod === 'card_link' ? 'card_link' : 'pix',
        paymentStatus: 'pending',
        orderStatus: 'received',
        notes: notes.trim() || undefined,
        paymentScheme: isHalfDeposit ? 'half_deposit' : 'full',
        depositAmount: isHalfDeposit ? amountToPayNow : undefined,
        depositPaid: false,
        remainingAmount: isHalfDeposit ? remainingAmount : undefined,
        remainingPaid: false,
        pixPayload: pixPayload || undefined,
        cardPaymentUrl: paymentMethod === 'card_link' ? settings.cardPaymentLink : undefined,
      });

      // 3. Monta a mensagem profissional do WhatsApp
      let msg = isPreOrderCart
        ? `*NOVA ENCOMENDA AGENDADA ${createdOrder.orderNumber} - ${settings.storeName.toUpperCase()}*\n\n`
        : `*NOVO PEDIDO PRONTA ENTREGA ${createdOrder.orderNumber} - ${settings.storeName.toUpperCase()}*\n\n`;

      msg += `*Cliente:* ${customerName.trim()}\n`;
      msg += `*Telefone:* ${customerPhone.trim()}\n`;

      if (isPreOrderCart) {
        msg += `*Data de Retirada Agendada:* ${scheduledDate.split('-').reverse().join('/')} às ${scheduledTime}\n`;
        const pickupLocation = settings.showExactAddressPublicly
          ? settings.address
          : (settings.publicAddressText || 'Ateliê em Umuarama - PR (Endereço para retirada enviado na confirmação)');
        msg += `*Local de Retirada:* ${pickupLocation}\n\n`;
      } else {
        if (deliveryType === 'delivery') {
          msg += `*Modalidade:* Delivery Imediato (Moto-Entrega)\n`;
          msg += `*Endereço de Entrega:* ${deliveryAddress.trim()}, ${deliveryNeighborhood.trim()} - Umuarama\n\n`;
        } else {
          msg += `*Modalidade:* Retirada Imediata no Ateliê (~30 min)\n\n`;
        }
      }

      msg += `*ITENS DO PEDIDO:*\n`;
      cart.forEach((item, idx) => {
        msg += `${idx + 1}. ${item.quantity}x ${item.productName} - ${formatCurrency(item.totalPrice)}\n`;
        if (item.customDetails) {
          if (item.customDetails.size) msg += `   - Tamanho: ${item.customDetails.size}\n`;
          if (item.customDetails.dough) msg += `   - Massa: ${item.customDetails.dough}\n`;
          if (item.customDetails.fillings?.length) msg += `   - Recheios: ${item.customDetails.fillings.join(' + ')}\n`;
          if (item.customDetails.topping) msg += `   - Cobertura: ${item.customDetails.topping}\n`;
          if (item.customDetails.sweetPackageSize) msg += `   - Quantidade: ${item.customDetails.sweetPackageSize}\n`;
          if (item.customDetails.selectedFlavors?.length) msg += `   - Sabores: ${item.customDetails.selectedFlavors.join(', ')}\n`;
          if (item.customDetails.wrapperType) msg += `   - Forminha: ${item.customDetails.wrapperType}\n`;
          if (item.customDetails.extras?.length) msg += `   - Adicionais: ${item.customDetails.extras.join(', ')}\n`;
          if (item.customDetails.cakeMessage) msg += `   - Topo/Escrita: "${item.customDetails.cakeMessage}"\n`;
        }
      });

      if (deliveryFee > 0) {
        msg += `\n*Subtotal:* ${formatCurrency(cartTotal)}`;
        msg += `\n*Taxa de Entrega:* ${formatCurrency(deliveryFee)}`;
      }

      msg += `\n*VALOR TOTAL:* ${formatCurrency(grandTotal)}\n`;

      if (isHalfDeposit) {
        msg += `*CONDIÇÃO:* Sinal de 50% (${formatCurrency(amountToPayNow)}) agora + 50% restante (${formatCurrency(remainingAmount)}) na véspera da entrega.\n`;
      } else {
        msg += `*CONDIÇÃO:* Pagamento Integral 100% (${formatCurrency(grandTotal)}).\n`;
      }

      if (paymentMethod === 'pix') {
        msg += `*Forma de Pagamento:* Pix\n`;
        msg += `*Chave Pix:* ${settings.pixKey} (${settings.pixReceiverName})\n`;
        if (pixPayload) {
          msg += `*Pix Copia e Cola:* \n${pixPayload}\n`;
        }
      } else {
        msg += `*Forma de Pagamento:* Cartão de Crédito/Débito\n`;
        if (settings.cardPaymentLink) {
          msg += `*Link de Pagamento no Cartão:* ${settings.cardPaymentLink}\n`;
        }
      }

      if (notes.trim()) {
        msg += `\n*Observações:* ${notes.trim()}\n`;
      }

      const waLink = createWhatsAppLink(settings.whatsapp, msg);

      setCompletedOrder({
        orderNumber: createdOrder.orderNumber,
        totalAmount: cartTotal,
        amountToPayNow,
        remainingAmount,
        paymentScheme: isHalfDeposit ? 'half_deposit' : 'full',
        paymentMethod,
        pixPayload,
        pixQrCodeUrl,
        cardPaymentUrl: settings.cardPaymentLink,
        whatsappUrl: waLink,
      });

      // Disparo automático em background para o WhatsApp da Confeitaria (sem abrir tela pro cliente)
      fetch('/api/whatsapp/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: settings.whatsapp,
          message: msg,
          orderNumber: createdOrder.orderNumber,
          customerName: customerName.trim(),
          status: 'received',
          customerPhone: customerPhone.trim(),
          customerMessage: `Olá, *${customerName.trim()}*! Recebemos sua encomenda *${createdOrder.orderNumber}* no ateliê da *${settings.storeName}*.\n\n` +
            `*Valor:* ${formatCurrency(amountToPayNow)}${isHalfDeposit ? ' (Sinal de 50%)' : ''}\n` +
            (paymentMethod === 'pix' && pixPayload ? `*Pix Copia e Cola:* \n${pixPayload}\n\n` : '') +
            `Em breve entraremos em contato para confirmar todos os detalhes! ❤️`,
        }),
      }).catch((err) => {
        console.warn('[WhatsApp Automático] Aviso ao disparar notificação em background:', err);
      });

      clearCart();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#1F1108]/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-[#E8D5C4]">
        {/* Header */}
        <div className="p-5 border-b border-[#E8D5C4] flex items-center justify-between bg-[#FAF7F3] shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#2E1609]" />
            <div>
              <h2 className="font-serif text-base font-bold text-[#2E1609]">
                Sua Sacola de Encomendas
              </h2>
              <span className="text-[11px] text-[#7A5A43]">
                {cart.length} {cart.length === 1 ? 'item selecionado' : 'itens selecionados'}
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setCompletedOrder(null);
            }}
            className="w-8 h-8 rounded-full hover:bg-[#EFE4D8] flex items-center justify-center text-[#7A5A43] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TELA DE SUCESSO / PAGAMENTO DIRETO */}
        {completedOrder ? (
          <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-start space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-[#FAF7F3] border border-[#C69255] text-[#2E1609] flex items-center justify-center shadow-xs">
              <Check className="w-7 h-7 text-[#2E1609]" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#C69255]">
                Encomenda Registrada com Sucesso
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#2E1609]">
                Pedido {completedOrder.orderNumber}
              </h3>
              <p className="text-xs text-[#7A5A43] max-w-sm">
                Enviamos os detalhes da sua encomenda para o WhatsApp do ateliê. Conclua o pagamento abaixo para confirmar sua reserva.
              </p>
            </div>

            {/* Resumo do Pagamento / Sinal */}
            <div className="w-full p-4 rounded-2xl bg-[#FAF7F3] border border-[#E8D5C4] text-left space-y-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-[#E8D5C4]">
                <span className="text-[#7A5A43]">Valor Total da Encomenda:</span>
                <span className="font-semibold text-[#2E1609]">{formatCurrency(completedOrder.totalAmount)}</span>
              </div>

              {completedOrder.paymentScheme === 'half_deposit' ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#2E1609] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#C69255]" />
                      Sinal de 50% (Agora):
                    </span>
                    <span className="font-bold text-base text-[#2E1609]">
                      {formatCurrency(completedOrder.amountToPayNow)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                    <strong>50% Restante ({formatCurrency(completedOrder.remainingAmount)}):</strong> Será acertado na véspera da data de retirada agendada.
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-[#2E1609]">Pagamento Total (100%):</span>
                  <span className="font-bold text-base text-[#2E1609]">
                    {formatCurrency(completedOrder.amountToPayNow)}
                  </span>
                </div>
              )}
            </div>

            {/* SELEÇÃO DO PAGAMENTO EFETUADO */}
            {completedOrder.paymentMethod === 'pix' ? (
              <div className="w-full p-5 rounded-2xl bg-white border border-[#C69255] shadow-xs space-y-4">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#2E1609]">
                  <QrCode className="w-4 h-4 text-[#C69255]" />
                  <span>Pagamento Instantâneo via Pix</span>
                </div>

                {completedOrder.pixQrCodeUrl && (
                  <div className="flex flex-col items-center justify-center p-3 bg-[#FAF7F3] rounded-xl border border-[#E8D5C4]">
                    <img
                      src={completedOrder.pixQrCodeUrl}
                      alt="QR Code Pix"
                      className="w-52 h-52 rounded-lg object-contain bg-white p-2 border border-[#E8D5C4]"
                    />
                    <span className="text-[10px] text-[#7A5A43] mt-2 font-medium">
                      Aponte a câmera do aplicativo do seu banco
                    </span>
                  </div>
                )}

                <div className="space-y-3 text-left">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-[#7A5A43] uppercase tracking-wider block">
                      Pix Copia e Cola (Valor Automático de {formatCurrency(completedOrder.amountToPayNow)})
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={completedOrder.pixPayload || settings.pixKey}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F3] border border-[#D5BFA8] text-[11px] font-mono text-[#2E1609] select-all truncate"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyPix(completedOrder.pixPayload || settings.pixKey)}
                        className="px-4 py-2 bg-[#2E1609] hover:bg-[#1F1108] text-white rounded-xl font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors"
                      >
                        {copiedPix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF7F3] border border-[#E8D5C4] flex items-center justify-between gap-2">
                    <div className="text-[11px] text-[#7A5A43]">
                      <span className="block font-semibold text-[#2E1609]">Ou pague pela Chave Direta:</span>
                      <span className="font-mono text-[10px] text-[#6E4F38]">{settings.pixKey} ({settings.pixKeyType === 'phone' ? 'Telefone' : settings.pixKeyType.toUpperCase()})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyRawKey(settings.pixKey)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#D5BFA8] text-[#2E1609] hover:bg-[#F2E8DF] text-[11px] font-medium flex items-center gap-1 transition-colors"
                    >
                      {copiedRawKey ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#C69255]" />}
                      <span>{copiedRawKey ? 'Copiada!' : 'Copiar Chave'}</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-[#7A5A43]">
                    Titular: <strong>{settings.pixReceiverName}</strong> • Umuarama - PR
                  </p>
                </div>
              </div>
            ) : (
              <div className="w-full p-5 rounded-2xl bg-white border border-[#C69255] shadow-xs space-y-4">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#2E1609]">
                  <CreditCard className="w-4 h-4 text-[#C69255]" />
                  <span>Pagamento com Cartão de Crédito ou Débito</span>
                </div>

                <p className="text-xs text-[#7A5A43] leading-relaxed">
                  Clique no botão abaixo para abrir o checkout seguro e efetuar o pagamento do valor de{' '}
                  <strong className="text-[#2E1609]">{formatCurrency(completedOrder.amountToPayNow)}</strong>.
                </p>

                {completedOrder.cardPaymentUrl && (
                  <a
                    href={completedOrder.cardPaymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-xl bg-[#2E1609] hover:bg-[#1F1108] text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span>Ir para Checkout de Cartão</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}

                <p className="text-[11px] text-[#7A5A43]">
                  Aceitamos as principais bandeiras (Visa, Mastercard, Elo, Hipercard).
                </p>
              </div>
            )}

            {/* Ações Finais */}
            <div className="w-full flex flex-col gap-2.5 pt-2">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pedido Enviado com Sucesso!</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  O ateliê recebeu os dados da sua encomenda automaticamente. Após o pagamento via Pix acima, sua reserva estará confirmada.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  setCompletedOrder(null);
                }}
                className="w-full py-3.5 rounded-xl bg-[#2E1609] hover:bg-[#1F1108] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Concluir e Fechar Sacola</span>
              </button>

              <a
                href={completedOrder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#7A5A43] hover:text-[#2E1609] hover:underline flex items-center justify-center gap-1.5 py-1 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#C69255]" />
                <span>Dúvidas? Falar com nosso atendimento pelo WhatsApp</span>
              </a>
            </div>
          </div>
        ) : cart.length === 0 ? (
          /* Empty Cart */
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F3] border border-[#E8D5C4] text-[#7A5A43] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#2E1609]">
              Sua sacola está vazia
            </h3>
            <p className="text-xs text-[#7A5A43] max-w-xs">
              Explore nossos doces gourmet de festa, tradicionais e bolos artesanais sob encomenda.
            </p>
          </div>
        ) : (
          /* LISTA DE ITENS & FORMULÁRIO COMPLETO */
          <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
            {/* Lista de Itens */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#7A5A43] uppercase tracking-wider">
                <span>Itens da Encomenda ({cart.length})</span>
                <button
                  onClick={clearCart}
                  className="text-[#A68F7B] hover:text-[#2E1609] flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Limpar Tudo</span>
                </button>
              </div>

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-[#E8D5C4] bg-white space-y-2 hover:border-[#D5BFA8] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-serif text-xs sm:text-sm font-bold text-[#2E1609]">
                        {item.productName}
                      </h4>
                      <span className="text-xs font-semibold text-[#C69255]">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#A68F7B] hover:text-[#2E1609] p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.customDetails && (
                    <div className="p-2.5 rounded-lg bg-[#FAF7F3] border border-[#E8D5C4] text-[11px] text-[#7A5A43] space-y-0.5">
                      {item.customDetails.size && <div>• <strong>Tamanho:</strong> {item.customDetails.size}</div>}
                      {item.customDetails.dough && <div>• <strong>Massa:</strong> {item.customDetails.dough}</div>}
                      {item.customDetails.fillings?.length && (
                        <div>• <strong>Recheios:</strong> {item.customDetails.fillings.join(' + ')}</div>
                      )}
                      {item.customDetails.topping && <div>• <strong>Cobertura:</strong> {item.customDetails.topping}</div>}
                      {item.customDetails.sweetPackageSize && (
                        <div>• <strong>Pacote:</strong> {item.customDetails.sweetPackageSize}</div>
                      )}
                      {item.customDetails.selectedFlavors?.length && (
                        <div>• <strong>Sabores Selecionados:</strong> {item.customDetails.selectedFlavors.join(', ')}</div>
                      )}
                      {item.customDetails.wrapperType && (
                        <div>• <strong>Forminhas:</strong> {item.customDetails.wrapperType}</div>
                      )}
                      {item.customDetails.extras?.length && (
                        <div>• <strong>Adicionais:</strong> {item.customDetails.extras.join(', ')}</div>
                      )}
                      {item.customDetails.cakeMessage && (
                        <div>• <strong>Topo/Escrita:</strong> "{item.customDetails.cakeMessage}"</div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-[#FAF7F3] border border-[#E8D5C4] flex items-center justify-center text-[#2E1609] hover:bg-[#EFE4D8]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-[#2E1609] w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-[#FAF7F3] border border-[#E8D5C4] flex items-center justify-center text-[#2E1609] hover:bg-[#EFE4D8]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* FORMULÁRIO DE FINALIZAÇÃO */}
            <div className="space-y-3 pt-2 border-t border-[#E8D5C4]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#7A5A43] uppercase tracking-wider block">
                  {isPreOrderCart ? 'Agendamento da Encomenda (Festa)' : 'Pedido Pronta Entrega (Cozinha)'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isPreOrderCart
                    ? 'bg-[#FAF7F3] text-[#C69255] border-[#E8D5C4]'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {isPreOrderCart ? 'Data Antecipada' : 'Preparo Imediato'}
                </span>
              </div>

              <div className="space-y-2.5">
                <input
                  type="text"
                  placeholder="Seu nome completo *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs focus:outline-hidden focus:border-[#2E1609]"
                />

                <input
                  type="tel"
                  placeholder="Seu WhatsApp para contato e confirmação *"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs focus:outline-hidden focus:border-[#2E1609]"
                />

                {/* CENÁRIO 1: ENCOMENDA DE FESTA (AGENDADA) */}
                {isPreOrderCart ? (
                  <>
                    {/* Aviso de Retirada */}
                    <div className="p-3.5 rounded-xl bg-[#FAF7F3] border border-[#E8D5C4] flex items-start gap-2.5">
                      <MapPin className="w-4 h-4 text-[#C69255] shrink-0 mt-0.5" />
                      <div className="text-[11px] text-[#5A3821] leading-relaxed">
                        <strong>Retirada no Ateliê:</strong>{' '}
                        {settings.showExactAddressPublicly
                          ? settings.address
                          : (settings.publicAddressText || 'Umuarama - PR (Endereço completo enviado na confirmação)')}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[10px] text-[#7A5A43] font-semibold block mb-1">
                          Data da Retirada *
                        </label>
                        <input
                          type="date"
                          min={minDateStr}
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl border text-xs focus:outline-hidden ${
                            blockedDateInfo
                              ? 'border-red-400 bg-red-50 text-red-900'
                              : 'border-[#D5BFA8] bg-white'
                          }`}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-[#7A5A43] font-semibold block mb-1">
                          Horário Aprox. *
                        </label>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-[#D5BFA8] text-xs bg-white focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Aviso de Prazo Mínimo */}
                    <div className="text-[10px] text-[#7A5A43] flex items-center gap-1.5 px-1">
                      <Clock className="w-3.5 h-3.5 text-[#C69255] shrink-0" />
                      <span>
                        Prazo de produção:{' '}
                        <strong>{requiredNoticeDays} dias de antecedência</strong>{' '}
                        {hasCakesInCart ? '(para bolos artesanais)' : '(para doces de festa)'}.
                      </span>
                    </div>

                    {/* Alerta de Data Bloqueada / Capacidade Esgotada */}
                    {blockedDateInfo && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-[11px] flex items-start gap-2 animate-in fade-in">
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Data Indisponível:</strong> {blockedDateInfo.reason || 'Capacidade Esgotada'}.
                          <p className="text-[10px] text-red-700 mt-0.5">
                            Já atingimos o limite de produções para este dia. Escolha outra data.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  /* CENÁRIO 2: PRONTA ENTREGA (COZINHA IMEDIATA / DELIVERY) */
                  <div className="space-y-3 pt-1">
                    <label className="text-[10px] text-[#7A5A43] font-semibold block">
                      Como deseja receber seu pedido? *
                    </label>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryType('pickup')}
                        className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                          deliveryType === 'pickup'
                            ? 'border-[#2E1609] bg-[#FAF7F3] shadow-xs'
                            : 'border-[#E8D5C4] bg-white hover:border-[#D5BFA8]'
                        }`}
                      >
                        <Store className="w-4 h-4 text-[#C69255]" />
                        <span className="font-bold text-xs text-[#2E1609]">Retirada Balcão</span>
                        <span className="text-[10px] text-[#7A5A43]">Grátis • Pronto em ~30 min</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryType('delivery')}
                        className={`p-3 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all ${
                          deliveryType === 'delivery'
                            ? 'border-[#2E1609] bg-[#FAF7F3] shadow-xs'
                            : 'border-[#E8D5C4] bg-white hover:border-[#D5BFA8]'
                        }`}
                      >
                        <Bike className="w-4 h-4 text-[#C69255]" />
                        <span className="font-bold text-xs text-[#2E1609]">Delivery (Moto)</span>
                        <span className="text-[10px] text-[#7A5A43]">
                          {settings.defaultDeliveryFee ? `+ ${formatCurrency(settings.defaultDeliveryFee)}` : 'Entrega em Umuarama'}
                        </span>
                      </button>
                    </div>

                    {deliveryType === 'delivery' ? (
                      <div className="space-y-2 pt-1 animate-in fade-in">
                        <input
                          type="text"
                          placeholder="Endereço de Entrega (Rua, Número e Apto) *"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs focus:outline-hidden focus:border-[#2E1609]"
                        />
                        <input
                          type="text"
                          placeholder="Bairro em Umuarama *"
                          value={deliveryNeighborhood}
                          onChange={(e) => setDeliveryNeighborhood(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs focus:outline-hidden focus:border-[#2E1609]"
                        />
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-[#FAF7F3] border border-[#E8D5C4] text-[11px] text-[#5A3821] flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#C69255] shrink-0" />
                        <span>Retirada no ateliê em Umuarama após confirmação de preparo.</span>
                      </div>
                    )}
                  </div>
                )}

                <textarea
                  placeholder="Observações do pedido ou ponto de referência?"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5BFA8] text-xs focus:outline-hidden focus:border-[#2E1609]"
                />
              </div>
            </div>

            {/* ESQUEMA DE PAGAMENTO: 50% SINAL OU 100% TOTAL (APENAS PARA ENCOMENDAS) */}
            {isPreOrderCart && settings.enableHalfDepositForPreOrders && (
              <div className="space-y-2.5 pt-2 border-t border-[#E8D5C4]">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#7A5A43] uppercase tracking-wider">
                    Condição de Pagamento da Encomenda
                  </span>
                  <span className="text-[10px] font-bold text-[#C69255] bg-[#FAF7F3] px-2 py-0.5 rounded-full border border-[#E8D5C4]">
                    Flexibilidade
                  </span>
                </div>

                <div className="space-y-2">
                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentScheme === 'half_deposit'
                        ? 'border-[#2E1609] bg-[#FAF7F3] shadow-xs'
                        : 'border-[#E8D5C4] bg-white hover:border-[#D5BFA8]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentScheme"
                      checked={paymentScheme === 'half_deposit'}
                      onChange={() => setPaymentScheme('half_deposit')}
                      className="mt-0.5 text-[#2E1609] focus:ring-[#2E1609]"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between text-xs font-bold text-[#2E1609]">
                        <span>Pagar Sinal de 50% agora</span>
                        <span className="text-[#C69255]">{formatCurrency(cartTotal * 0.5)}</span>
                      </div>
                      <p className="text-[11px] text-[#7A5A43] leading-relaxed">
                        Garante o agendamento da sua data. O restante de{' '}
                        <strong>{formatCurrency(cartTotal * 0.5)}</strong> é acertado na véspera da entrega.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      paymentScheme === 'full'
                        ? 'border-[#2E1609] bg-[#FAF7F3] shadow-xs'
                        : 'border-[#E8D5C4] bg-white hover:border-[#D5BFA8]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentScheme"
                      checked={paymentScheme === 'full'}
                      onChange={() => setPaymentScheme('full')}
                      className="mt-0.5 text-[#2E1609] focus:ring-[#2E1609]"
                    />
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between text-xs font-bold text-[#2E1609]">
                        <span>Pagar Valor Total (100% à vista)</span>
                        <span className="text-[#2E1609]">{formatCurrency(cartTotal)}</span>
                      </div>
                      <p className="text-[11px] text-[#7A5A43] leading-relaxed">
                        Quitação total antecipada da sua encomenda no momento do pedido.
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* FORMA DE PAGAMENTO DIRETO: PIX OU CARTÃO */}
            <div className="space-y-2.5 pt-2 border-t border-[#E8D5C4]">
              <span className="text-[11px] font-semibold text-[#7A5A43] uppercase tracking-wider block">
                Forma de Pagamento
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                    paymentMethod === 'pix'
                      ? 'border-[#2E1609] bg-[#FAF7F3] shadow-xs ring-1 ring-[#2E1609]'
                      : 'border-[#E8D5C4] bg-white hover:border-[#D5BFA8]'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-[#2E1609]">Pix Direto</div>
                    <div className="text-[10px] text-[#7A5A43]">QR Code & Copia e Cola</div>
                  </div>
                </button>

                {settings.enableCardPayment && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card_link')}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                      paymentMethod === 'card_link'
                        ? 'border-[#2E1609] bg-[#FAF7F3] shadow-xs ring-1 ring-[#2E1609]'
                        : 'border-[#E8D5C4] bg-white hover:border-[#D5BFA8]'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#2E1609]">Cartão de Crédito</div>
                      <div className="text-[10px] text-[#7A5A43]">Link de Pagamento Seguro</div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FOOTER FIXO COM AÇÃO DE FINALIZAR */}
        {!completedOrder && cart.length > 0 && (
          <div className="p-5 bg-[#FAF7F3] border-t border-[#E8D5C4] space-y-3 shrink-0">
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-[#7A5A43]">
                <span>Total dos Produtos</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>

              {deliveryFee > 0 && (
                <div className="flex justify-between text-xs text-[#7A5A43]">
                  <span>Taxa de Entrega (Delivery)</span>
                  <span className="font-semibold text-[#2E1609]">{formatCurrency(deliveryFee)}</span>
                </div>
              )}

              {isHalfDeposit && (
                <div className="flex justify-between text-xs text-amber-900 font-medium">
                  <span>Sinal de 50% a pagar agora</span>
                  <span className="font-bold">{formatCurrency(amountToPayNow)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#2E1609] font-bold text-base pt-1 border-t border-[#E8D5C4]">
                <span>{isHalfDeposit ? 'Valor a Pagar Agora' : 'Total do Pedido'}</span>
                <span className="font-sans text-lg">{formatCurrency(amountToPayNow)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSubmitting || !!blockedDateInfo}
              className="w-full py-3.5 rounded-xl bg-[#2E1609] hover:bg-[#1F1108] active:scale-98 text-[#FAF7F3] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Processando Pedido...'
                  : blockedDateInfo
                  ? 'Data Indisponível (Selecione Outra)'
                  : isHalfDeposit
                  ? `Confirmar Encomenda com Sinal (${formatCurrency(amountToPayNow)})`
                  : isPreOrderCart
                  ? `Confirmar Encomenda (${formatCurrency(grandTotal)})`
                  : `Confirmar Pedido Pronta Entrega (${formatCurrency(grandTotal)})`}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}