'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { formatCurrency, createWhatsAppLink } from '@/lib/utils';
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
  Sparkles,
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

  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryNeighborhood, setDeliveryNeighborhood] = useState('');
  const [scheduledDate, setScheduledDate] = useState('2026-11-18');
  const [scheduledTime, setScheduledTime] = useState('15:00');
  const [notes, setNotes] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompletedNumber, setOrderCompletedNumber] = useState<string | null>(null);

  if (!isCartOpen) return null;

  const deliveryFee =
    deliveryType === 'delivery'
      ? cartTotal >= settings.freeDeliveryMinAmount
        ? 0
        : settings.defaultDeliveryFee
      : 0;

  const finalTotal = cartTotal + deliveryFee;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(settings.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleCheckout = () => {
    if (!customerName.trim()) {
      alert('Por favor, informe seu nome completo.');
      return;
    }
    if (!customerPhone.trim()) {
      alert('Por favor, informe seu WhatsApp para contato.');
      return;
    }
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      alert('Por favor, informe o endereço de entrega completo.');
      return;
    }

    setIsSubmitting(true);

    // Criar o pedido no sistema
    const createdOrder = addOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryType,
      deliveryAddress: deliveryType === 'delivery' ? deliveryAddress.trim() : undefined,
      deliveryNeighborhood: deliveryType === 'delivery' ? deliveryNeighborhood.trim() : undefined,
      deliveryFee,
      scheduledDate,
      scheduledTime,
      items: cart,
      totalAmount: finalTotal,
      paymentMethod: 'pix',
      paymentStatus: 'pending',
      orderStatus: 'received',
      notes: notes.trim() || undefined,
    });

    setOrderCompletedNumber(createdOrder.orderNumber);

    // Montar mensagem para o WhatsApp da Doceria
    let msg = `🍰 *NOVO PEDIDO - ${settings.storeName.toUpperCase()}*\n`;
    msg += `📋 *Pedido:* ${createdOrder.orderNumber}\n`;
    msg += `👤 *Cliente:* ${customerName}\n`;
    msg += `📱 *WhatsApp:* ${customerPhone}\n`;
    msg += `📅 *Agendado para:* ${scheduledDate.split('-').reverse().join('/')} às ${scheduledTime}\n`;
    msg += `🚚 *Tipo:* ${deliveryType === 'delivery' ? `Entrega (${deliveryAddress} - ${deliveryNeighborhood})` : 'Retirada no Ateliê'}\n\n`;

    msg += `🧁 *ITENS DO PEDIDO:*\n`;
    cart.forEach((item, idx) => {
      msg += `${idx + 1}. *${item.quantity}x ${item.productName}* - ${formatCurrency(item.totalPrice)}\n`;
      if (item.customDetails) {
        if (item.customDetails.size) msg += `   • Tamanho: ${item.customDetails.size}\n`;
        if (item.customDetails.dough) msg += `   • Massa: ${item.customDetails.dough}\n`;
        if (item.customDetails.fillings?.length) msg += `   • Recheios: ${item.customDetails.fillings.join(' + ')}\n`;
        if (item.customDetails.topping) msg += `   • Cobertura: ${item.customDetails.topping}\n`;
        if (item.customDetails.extras?.length) msg += `   • Adicionais: ${item.customDetails.extras.join(', ')}\n`;
        if (item.customDetails.cakeMessage) msg += `   • Frase/Mensagem: "${item.customDetails.cakeMessage}"\n`;
      }
    });

    msg += `\n💰 *Subtotal:* ${formatCurrency(cartTotal)}\n`;
    msg += `🛵 *Taxa de Entrega:* ${deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}\n`;
    msg += `✨ *TOTAL A PAGAR:* ${formatCurrency(finalTotal)}\n`;
    msg += `💳 *Forma de Pagamento:* Pix (Chave: ${settings.pixKey})\n`;

    if (notes.trim()) {
      msg += `📝 *Observações:* ${notes}\n`;
    }

    // Abrir o WhatsApp
    const waLink = createWhatsAppLink(settings.whatsapp, msg);
    window.open(waLink, '_blank');

    clearCart();
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-rose-100 flex items-center justify-between bg-rose-50/70 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-rose-500" />
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Minha Sacola de Doces
            </h2>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setOrderCompletedNumber(null);
            }}
            className="w-8 h-8 rounded-full bg-white hover:bg-rose-100 flex items-center justify-center text-stone-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success screen after order is submitted */}
        {orderCompletedNumber ? (
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-stone-900">
              Pedido Enviado com Sucesso!
            </h3>
            <p className="text-sm text-stone-600 max-w-xs">
              Seu pedido <span className="font-bold text-rose-600">{orderCompletedNumber}</span> foi registrado no ateliê e enviado no WhatsApp da Ana Melo!
            </p>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-stone-700 w-full space-y-2">
              <div className="font-semibold text-rose-800">Pagamento via Pix:</div>
              <div className="font-mono bg-white p-2 rounded-lg border border-rose-200 select-all">
                {settings.pixKey}
              </div>
              <button
                onClick={handleCopyPix}
                className="w-full py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPix ? 'Chave Copiada!' : 'Copiar Chave Pix'}</span>
              </button>
            </div>
            <button
              onClick={() => {
                setIsCartOpen(false);
                setOrderCompletedNumber(null);
              }}
              className="mt-4 px-6 py-2.5 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800"
            >
              Voltar ao Cardápio
            </button>
          </div>
        ) : cart.length === 0 ? (
          /* Empty Cart */
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-800">
              Sua sacola está vazia
            </h3>
            <p className="text-xs text-stone-500 max-w-xs">
              Escolha entre nossos bolos festivos, fatias gourmet ou caixas de brigadeiros para começar!
            </p>
            <button
              onClick={() => setIsCartOpen(false)}
              className="mt-2 px-5 py-2 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold"
            >
              Explorar Cardápio
            </button>
          </div>
        ) : (
          /* Cart List & Checkout Form */
          <div className="p-5 overflow-y-auto space-y-6 flex-1">
            {/* Items List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
                <span>ITENS SELECIONADOS ({cart.length})</span>
                <button
                  onClick={clearCart}
                  className="text-stone-400 hover:text-rose-500 flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Limpar</span>
                </button>
              </div>

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-stone-200/80 bg-white space-y-2 shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-stone-900">
                        {item.productName}
                      </h4>
                      <span className="text-xs font-semibold text-rose-600">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-stone-300 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Custom Details if any */}
                  {item.customDetails && (
                    <div className="p-2 rounded-lg bg-rose-50/70 border border-rose-100 text-[11px] text-stone-600 space-y-0.5">
                      {item.customDetails.size && <div>• <strong>Tamanho:</strong> {item.customDetails.size}</div>}
                      {item.customDetails.dough && <div>• <strong>Massa:</strong> {item.customDetails.dough}</div>}
                      {item.customDetails.fillings?.length && (
                        <div>• <strong>Recheios:</strong> {item.customDetails.fillings.join(' + ')}</div>
                      )}
                      {item.customDetails.topping && <div>• <strong>Cobertura:</strong> {item.customDetails.topping}</div>}
                      {item.customDetails.extras?.length && (
                        <div>• <strong>Adicionais:</strong> {item.customDetails.extras.join(', ')}</div>
                      )}
                      {item.customDetails.cakeMessage && (
                        <div>• <strong>Frase:</strong> "{item.customDetails.cakeMessage}"</div>
                      )}
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-stone-800 w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery or Pickup */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <span className="text-xs font-semibold text-stone-700 block">
                FORMA DE ENTREGA / RETIRADA
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType('delivery')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    deliveryType === 'delivery'
                      ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-2xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Entrega Delivery</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    deliveryType === 'pickup'
                      ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-2xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Retirar no Ateliê (Grátis)</span>
                </button>
              </div>
            </div>

            {/* Customer Details Form */}
            <div className="space-y-3 pt-3 border-t border-stone-100">
              <span className="text-xs font-semibold text-stone-700 block">
                SEUS DADOS PARA O PEDIDO
              </span>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Seu nome completo *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-rose-500"
                />

                <input
                  type="tel"
                  placeholder="Seu WhatsApp (ex: 11 99999-9999) *"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-rose-500"
                />

                {deliveryType === 'delivery' && (
                  <div className="space-y-2 pt-1 animate-in fade-in">
                    <input
                      type="text"
                      placeholder="Endereço de entrega (Rua, Número, Apto) *"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-rose-500"
                    />
                    <input
                      type="text"
                      placeholder="Bairro *"
                      value={deliveryNeighborhood}
                      onChange={(e) => setDeliveryNeighborhood(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-rose-500"
                    />
                  </div>
                )}

                {/* Agendamento */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] text-stone-500 flex items-center gap-1 mb-1 font-medium">
                      <Calendar className="w-3 h-3 text-rose-500" />
                      <span>Data</span>
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 flex items-center gap-1 mb-1 font-medium">
                      <Clock className="w-3 h-3 text-rose-500" />
                      <span>Horário Aprox.</span>
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                    />
                  </div>
                </div>

                <textarea
                  placeholder="Alguma observação especial? (ex: ponto de referência, restrição alimentar...)"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            {/* Pix Instructions Box */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Pagamento Direto via Pix (Sem taxas)
                </span>
                <span className="text-[11px] text-stone-500">Chave {settings.pixKeyType.toUpperCase()}</span>
              </div>
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-200 font-mono text-[11px] text-stone-700">
                <span className="truncate">{settings.pixKey}</span>
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="ml-2 text-rose-600 hover:text-rose-700 shrink-0 flex items-center gap-1"
                >
                  {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPix ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[11px] text-stone-500">
                Favorecido: <strong>{settings.pixReceiverName}</strong>. O comprovante é enviado junto com o pedido no WhatsApp.
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {!orderCompletedNumber && cart.length > 0 && (
          <div className="p-5 bg-stone-50 border-t border-stone-200 space-y-3 shrink-0">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal dos doces</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Taxa de entrega</span>
                <span>{deliveryFee === 0 ? 'Grátis' : formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-stone-900 font-bold text-base pt-1 border-t border-stone-200">
                <span>Total a Pagar</span>
                <span className="text-rose-600 font-sans">{formatCurrency(finalTotal)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-98 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-200 transition-all disabled:opacity-70"
            >
              <Send className="w-4 h-4" />
              <span>Confirmar Pedido & Enviar no WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
