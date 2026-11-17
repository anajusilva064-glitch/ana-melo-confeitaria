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
  const [scheduledDate, setScheduledDate] = useState('2026-11-18');
  const [scheduledTime, setScheduledTime] = useState('15:00');
  const [notes, setNotes] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompletedNumber, setOrderCompletedNumber] = useState<string | null>(null);

  if (!isCartOpen) return null;

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
      alert('Por favor, informe seu telefone de contato.');
      return;
    }

    setIsSubmitting(true);

    const createdOrder = addOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryType: 'pickup',
      deliveryFee: 0,
      scheduledDate,
      scheduledTime,
      items: cart,
      totalAmount: cartTotal,
      paymentMethod: 'pix',
      paymentStatus: 'pending',
      orderStatus: 'received',
      notes: notes.trim() || undefined,
    });

    setOrderCompletedNumber(createdOrder.orderNumber);

    // Mensagem profissional no WhatsApp
    let msg = `*PEDIDO ${createdOrder.orderNumber} - ${settings.storeName.toUpperCase()}*\n\n`;
    msg += `*Cliente:* ${customerName}\n`;
    msg += `*Telefone:* ${customerPhone}\n`;
    msg += `*Data de Retirada:* ${scheduledDate.split('-').reverse().join('/')} às ${scheduledTime}\n`;
    msg += `*Local de Retirada:* ${settings.address}\n\n`;

    msg += `*ITENS DA ENCOMENDA:*\n`;
    cart.forEach((item, idx) => {
      msg += `${idx + 1}. ${item.quantity}x ${item.productName} - ${formatCurrency(item.totalPrice)}\n`;
      if (item.customDetails) {
        if (item.customDetails.size) msg += `   - Tamanho: ${item.customDetails.size}\n`;
        if (item.customDetails.dough) msg += `   - Massa: ${item.customDetails.dough}\n`;
        if (item.customDetails.fillings?.length) msg += `   - Recheios: ${item.customDetails.fillings.join(' + ')}\n`;
        if (item.customDetails.topping) msg += `   - Cobertura: ${item.customDetails.topping}\n`;
        if (item.customDetails.extras?.length) msg += `   - Adicionais: ${item.customDetails.extras.join(', ')}\n`;
        if (item.customDetails.cakeMessage) msg += `   - Escrita/Topo: "${item.customDetails.cakeMessage}"\n`;
      }
    });

    msg += `\n*VALOR TOTAL:* ${formatCurrency(cartTotal)}\n`;
    msg += `*Forma de Pagamento:* Pix (Chave: ${settings.pixKey})\n`;

    if (notes.trim()) {
      msg += `\n*Observações:* ${notes}\n`;
    }

    const waLink = createWhatsAppLink(settings.whatsapp, msg);
    window.open(waLink, '_blank');

    clearCart();
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#1F1108]/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-[#E8D5C4]">
        {/* Header */}
        <div className="p-5 border-b border-[#E8D5C4] flex items-center justify-between bg-[#FAF7F3] shrink-0">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#3D1F0D]" />
            <h2 className="font-serif text-base font-bold text-[#3D1F0D]">
              Sua Sacola
            </h2>
          </div>
          <button
            onClick={() => {
              setIsCartOpen(false);
              setOrderCompletedNumber(null);
            }}
            className="w-8 h-8 rounded-full hover:bg-[#EFE4D8] flex items-center justify-center text-[#7A5A43] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Success Screen */}
        {orderCompletedNumber ? (
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#FAF7F3] border border-[#D5BFA8] text-[#3D1F0D] flex items-center justify-center">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#3D1F0D]">
              Pedido Registrado
            </h3>
            <p className="text-xs text-[#7A5A43] max-w-xs leading-relaxed">
              O pedido <span className="font-bold text-[#3D1F0D]">{orderCompletedNumber}</span> foi enviado para o WhatsApp da Ana Melo Confeitaria.
            </p>

            <div className="p-4 rounded-xl bg-[#FAF7F3] border border-[#E8D5C4] text-xs text-[#5A3821] w-full space-y-2 text-left">
              <div className="font-semibold text-[#3D1F0D]">Pagamento via Pix:</div>
              <div className="font-mono bg-white p-2 rounded-lg border border-[#D5BFA8] text-[11px] select-all">
                {settings.pixKey}
              </div>
              <button
                onClick={handleCopyPix}
                className="w-full py-2 bg-[#3D1F0D] hover:bg-[#2C1407] text-[#FAF7F3] rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPix ? 'Chave Copiada' : 'Copiar Chave Pix'}</span>
              </button>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setOrderCompletedNumber(null);
              }}
              className="px-6 py-2.5 rounded-full bg-[#3D1F0D] text-white text-xs font-semibold hover:bg-[#2C1407]"
            >
              Concluir
            </button>
          </div>
        ) : cart.length === 0 ? (
          /* Empty Cart */
          <div className="p-8 text-center flex-1 flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F3] border border-[#E8D5C4] text-[#7A5A43] flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-base font-bold text-[#3D1F0D]">
              Sua sacola está vazia
            </h3>
            <p className="text-xs text-[#7A5A43] max-w-xs">
              Selecione bolos ou doces no cardápio para fazer sua encomenda.
            </p>
          </div>
        ) : (
          /* Cart List & Checkout Form */
          <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
            {/* List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#7A5A43] uppercase tracking-wider">
                <span>Itens Selecionados ({cart.length})</span>
                <button
                  onClick={clearCart}
                  className="text-[#A68F7B] hover:text-[#3D1F0D] flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Limpar</span>
                </button>
              </div>

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-[#E8D5C4] bg-white space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-serif text-xs sm:text-sm font-bold text-[#3D1F0D]">
                        {item.productName}
                      </h4>
                      <span className="text-xs font-semibold text-[#C69255]">
                        {formatCurrency(item.totalPrice)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#A68F7B] hover:text-[#3D1F0D] p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.customDetails && (
                    <div className="p-2 rounded-lg bg-[#FAF7F3] border border-[#E8D5C4] text-[11px] text-[#7A5A43] space-y-0.5">
                      {item.customDetails.size && <div>• Tamanho: {item.customDetails.size}</div>}
                      {item.customDetails.dough && <div>• Massa: {item.customDetails.dough}</div>}
                      {item.customDetails.fillings?.length && (
                        <div>• Recheios: {item.customDetails.fillings.join(' + ')}</div>
                      )}
                      {item.customDetails.topping && <div>• Cobertura: {item.customDetails.topping}</div>}
                      {item.customDetails.extras?.length && (
                        <div>• Adicionais: {item.customDetails.extras.join(', ')}</div>
                      )}
                      {item.customDetails.cakeMessage && (
                        <div>• Topo: "{item.customDetails.cakeMessage}"</div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-[#FAF7F3] border border-[#E8D5C4] flex items-center justify-center text-[#3D1F0D]"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-[#3D1F0D] w-5 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-[#FAF7F3] border border-[#E8D5C4] flex items-center justify-center text-[#3D1F0D]"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Retirada Notice */}
            <div className="p-3.5 rounded-xl bg-[#FAF7F3] border border-[#E8D5C4] flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#C69255] shrink-0 mt-0.5" />
              <div className="text-[11px] text-[#5A3821] leading-relaxed">
                <strong>Retirada no Ateliê:</strong> {settings.address}
              </div>
            </div>

            {/* Form */}
            <div className="space-y-3 pt-2 border-t border-[#E8D5C4]">
              <span className="text-[11px] font-semibold text-[#7A5A43] uppercase tracking-wider block">
                Dados do Responsável
              </span>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Seu nome completo *"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs focus:outline-hidden focus:border-[#3D1F0D]"
                />

                <input
                  type="tel"
                  placeholder="Seu WhatsApp para confirmação *"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5BFA8] text-xs focus:outline-hidden focus:border-[#3D1F0D]"
                />

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-[#7A5A43] font-medium block mb-1">
                      Data da Retirada
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5BFA8] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#7A5A43] font-medium block mb-1">
                      Horário Aprox.
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#D5BFA8] text-xs"
                    />
                  </div>
                </div>

                <textarea
                  placeholder="Alguma observação especial para a encomenda?"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D5BFA8] text-xs focus:outline-hidden focus:border-[#3D1F0D]"
                />
              </div>
            </div>

            {/* Pix Info */}
            <div className="p-3.5 rounded-xl bg-[#FAF7F3] border border-[#E8D5C4] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#3D1F0D]">Pagamento via Pix</span>
                <span className="text-[10px] text-[#7A5A43]">Chave Telefone</span>
              </div>
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-[#D5BFA8] font-mono text-[11px]">
                <span>{settings.pixKey}</span>
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="text-[#3D1F0D] hover:underline flex items-center gap-1 font-sans text-xs"
                >
                  {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPix ? 'Copiado' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[10px] text-[#7A5A43]">
                Titular: {settings.pixReceiverName}.
              </p>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        {!orderCompletedNumber && cart.length > 0 && (
          <div className="p-5 bg-[#FAF7F3] border-t border-[#E8D5C4] space-y-3 shrink-0">
            <div className="flex justify-between text-[#3D1F0D] font-bold text-base">
              <span>Total da Encomenda</span>
              <span className="font-sans">{formatCurrency(cartTotal)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-[#3D1F0D] hover:bg-[#2C1407] active:scale-98 text-[#FAF7F3] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-70"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Pedido pelo WhatsApp</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
