'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Category,
  Product,
  CustomOrderOption,
  Ingredient,
  Order,
  OrderItem,
  OrderStatus,
  FinancialTransaction,
  StoreSettings,
  BlockedDate,
} from '@/types';
import {
  initialCategories,
  initialProducts,
  initialCustomOptions,
  initialIngredients,
  initialOrders,
  initialTransactions,
  initialSettings,
} from '@/lib/mock-data';

type StoreContextType = {
  // Dados do Cardápio & Loja
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  // Opções de Encomenda Personalizada
  customOptions: CustomOrderOption[];
  addCustomOption: (opt: Omit<CustomOrderOption, 'id'>) => void;
  updateCustomOption: (id: string, updates: Partial<CustomOrderOption>) => void;
  deleteCustomOption: (id: string) => void;

  // Estoque & Insumos
  ingredients: Ingredient[];
  addIngredient: (ing: Omit<Ingredient, 'id' | 'costPerUnit'>) => void;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  adjustStock: (id: string, deltaQuantity: number, reason: string) => void;

  // Pedidos & Kanban & Calendário
  orders: Order[];
  addOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
  markOrderDepositPaid: (id: string, depositPaid: boolean) => void;
  markOrderRemainingPaid: (id: string, remainingPaid: boolean) => void;
  syncPartnerSpreadsheet: () => Promise<{ success: boolean; count: number; message: string }>;

  // Prazos e Bloqueios de Calendário
  addBlockedDate: (date: string, reason?: string) => void;
  removeBlockedDate: (id: string) => void;

  // Financeiro
  transactions: FinancialTransaction[];
  addTransaction: (tx: Omit<FinancialTransaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;

  // Carrinho do Cliente
  cart: OrderItem[];
  addToCart: (item: Omit<OrderItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Modal de Montador de Encomenda
  isCustomModalOpen: boolean;
  setIsCustomModalOpen: (open: boolean) => void;
  customizingProduct: Product | null;
  openCustomizer: (product: Product) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  // Carregar do localStorage ou usar mock inicial
  const [isClient, setIsClient] = useState(false);

  const [settings, setSettings] = useState<StoreSettings>(initialSettings);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [customOptions, setCustomOptions] = useState<CustomOrderOption[]>(initialCustomOptions);
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialIngredients);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(initialTransactions);

  // Carrinho e Modais
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);

  useEffect(() => {
    setIsClient(true);
    try {
      // Limpeza de cache antigo para garantir que os dados reais da Ana Melo Confeitaria sejam aplicados
      ['ana_melo_settings', 'ana_melo_orders', 'ana_melo_products', 'ana_melo_categories',
       'ana_melo_settings_v3', 'ana_melo_products_v3', 'ana_melo_categories_v3', 'ana_melo_custom_options_v3'].forEach(k => {
        try { localStorage.removeItem(k); } catch {}
      });

      const savedSettings = localStorage.getItem('ana_melo_settings_v7') || localStorage.getItem('ana_melo_settings_v6') || localStorage.getItem('ana_melo_settings_v5');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.publicAddressText && parsed.publicAddressText.includes('Maringá')) {
          parsed.publicAddressText = initialSettings.publicAddressText;
        }
        if (parsed.pixCity === 'MARINGA') {
          parsed.pixCity = 'UMUARAMA';
        }
        if (parsed.businessHours && parsed.businessHours.includes('Maringá')) {
          parsed.businessHours = initialSettings.businessHours;
        }
        setSettings({
          ...initialSettings,
          ...parsed,
          blockedDates: parsed.blockedDates || initialSettings.blockedDates,
        });
      } else {
        setSettings(initialSettings);
      }

      const savedCategories = localStorage.getItem('ana_melo_categories_v5');
      if (savedCategories) {
        setCategories(JSON.parse(savedCategories));
      } else {
        setCategories(initialCategories);
      }

      const savedProducts = localStorage.getItem('ana_melo_products_v5');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts(initialProducts);
      }

      const savedCustomOptions = localStorage.getItem('ana_melo_custom_options_v5');
      if (savedCustomOptions) {
        setCustomOptions(JSON.parse(savedCustomOptions));
      } else {
        setCustomOptions(initialCustomOptions);
      }

      const savedIngredients = localStorage.getItem('ana_melo_ingredients_v5');
      if (savedIngredients) {
        setIngredients(JSON.parse(savedIngredients));
      } else {
        setIngredients(initialIngredients);
      }

      const savedOrders = localStorage.getItem('ana_melo_orders_v5');
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders));
      } else {
        setOrders(initialOrders);
      }

      const savedTransactions = localStorage.getItem('ana_melo_transactions_v5');
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      } else {
        setTransactions(initialTransactions);
      }

      const savedCart = localStorage.getItem('ana_melo_cart');
      if (savedCart) setCart(JSON.parse(savedCart));
    } catch (e) {
      console.warn('Erro ao carregar localStorage:', e);
    }
  }, []);

  // Salvar no localStorage sempre que houver alterações
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('ana_melo_settings_v7', JSON.stringify(settings));
  }, [settings, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('ana_melo_categories_v5', JSON.stringify(categories));
  }, [categories, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('ana_melo_products_v5', JSON.stringify(products));
  }, [products, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('ana_melo_custom_options_v5', JSON.stringify(customOptions));
  }, [customOptions, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('ana_melo_ingredients_v5', JSON.stringify(ingredients));
  }, [ingredients, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('ana_melo_orders_v5', JSON.stringify(orders));
  }, [orders, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('ana_melo_transactions_v5', JSON.stringify(transactions));
  }, [transactions, isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('ana_melo_cart', JSON.stringify(cart));
  }, [cart, isClient]);

  // Funções de Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Funções de Categorias
  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCat: Category = { ...category, id: `cat-${Date.now()}` };
    setCategories((prev) => [...prev, newCat]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  };

  // Funções de Produtos
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProd: Product = { ...product, id: `prod-${Date.now()}` };
    setProducts((prev) => [newProd, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // Funções de Opções de Encomenda
  const addCustomOption = (opt: Omit<CustomOrderOption, 'id'>) => {
    const newOpt: CustomOrderOption = { ...opt, id: `opt-${Date.now()}` };
    setCustomOptions((prev) => [...prev, newOpt]);
  };

  const updateCustomOption = (id: string, updates: Partial<CustomOrderOption>) => {
    setCustomOptions((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates } : o)));
  };

  const deleteCustomOption = (id: string) => {
    setCustomOptions((prev) => prev.filter((o) => o.id !== id));
  };

  // Funções de Insumos & Estoque
  const addIngredient = (ing: Omit<Ingredient, 'id' | 'costPerUnit'>) => {
    const costPerUnit = ing.packageQuantity > 0 ? ing.packageCost / ing.packageQuantity : 0;
    const newIng: Ingredient = { ...ing, id: `ing-${Date.now()}`, costPerUnit };
    setIngredients((prev) => [...prev, newIng]);
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const updated = { ...i, ...updates };
        updated.costPerUnit = updated.packageQuantity > 0 ? updated.packageCost / updated.packageQuantity : 0;
        return updated;
      })
    );
  };

  const deleteIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  const adjustStock = (id: string, deltaQuantity: number, reason: string) => {
    setIngredients((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const newStock = Math.max(0, i.currentStock + deltaQuantity);
        return { ...i, currentStock: newStock };
      })
    );

    // Se for compra de reposição (delta positivo), registra despesa financeira automática
    if (deltaQuantity > 0) {
      const ing = ingredients.find((i) => i.id === id);
      if (ing) {
        const cost = deltaQuantity * ing.costPerUnit;
        addTransaction({
          type: 'expense',
          category: 'Insumos & Reposição',
          description: `Reposição de ${deltaQuantity}${ing.unit} de ${ing.name} (${reason})`,
          amount: cost,
          date: new Date().toISOString(),
        });
      }
    }
  };

  // Funções de Pedidos (Kanban)
  const addOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order => {
    const nextNumber = orders.length > 0 ? Math.max(...orders.map((o) => parseInt(o.orderNumber.replace(/\D/g, '') || '100', 10))) + 1 : 101;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `#${nextNumber}`,
      isPreOrder: orderData.isPreOrder ?? true,
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);

    // Registrar no financeiro se já estiver pago
    if (newOrder.paymentStatus === 'paid') {
      addTransaction({
        type: 'income',
        category: 'Vendas de Pedidos',
        description: `Pedido ${newOrder.orderNumber} - ${newOrder.customerName}`,
        amount: newOrder.totalAmount,
        date: new Date().toISOString(),
        relatedOrderId: newOrder.id,
      });
    }

    return newOrder;
  };

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    const targetOrder = orders.find((o) => o.id === id);

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        return { ...o, orderStatus: status };
      })
    );

    // Se a automação de WhatsApp estiver ativada, envia notificação automática via API
    if (targetOrder && settings.whatsappAutoNotify) {
      import('@/lib/whatsapp').then(({ sendAutomaticWhatsAppNotification }) => {
        sendAutomaticWhatsAppNotification(
          targetOrder,
          status,
          settings.storeName,
          settings.address,
          settings.instagram
        );
      });
    }
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const markOrderDepositPaid = (id: string, depositPaid: boolean) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const bothPaid = depositPaid && (o.remainingPaid ?? false);
        return {
          ...o,
          depositPaid,
          paymentStatus: bothPaid ? 'paid' : 'pending',
        };
      })
    );
  };

  const markOrderRemainingPaid = (id: string, remainingPaid: boolean) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const bothPaid = (o.depositPaid ?? true) && remainingPaid;
        return {
          ...o,
          remainingPaid,
          paymentStatus: bothPaid ? 'paid' : 'pending',
        };
      })
    );
  };

  const addBlockedDate = (date: string, reason?: string) => {
    const newBlocked: BlockedDate = {
      id: `blk-${Date.now()}`,
      date,
      reason: reason?.trim() || 'Capacidade Esgotada',
    };
    setSettings((prev) => ({
      ...prev,
      blockedDates: [...(prev.blockedDates || []), newBlocked],
    }));
  };

  const removeBlockedDate = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      blockedDates: (prev.blockedDates || []).filter((b) => b.id !== id),
    }));
  };

  const syncPartnerSpreadsheet = async (): Promise<{ success: boolean; count: number; message: string }> => {
    try {
      const res = await fetch('/api/partner/sync-onedrive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetUrl: settings.partnerSpreadsheetUrl }),
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.orders)) {
        const liveOrders: Order[] = data.orders;
        const liveIds = new Set(liveOrders.map((o) => o.id));

        setOrders((prev) => {
          const nonPartnerOrders = prev.filter((o) => !liveIds.has(o.id) && o.source !== 'partner_excel');
          return [...liveOrders, ...nonPartnerOrders];
        });

        return {
          success: true,
          count: liveOrders.length,
          message: `${liveOrders.length} encomendas sincronizadas diretamente do link do OneDrive!`,
        };
      }
    } catch (e) {
      console.warn('Erro ao chamar API do OneDrive:', e);
    }

    // Fallback com as encomendas iniciais caso o OneDrive oscile
    const partnerOrders = initialOrders.filter((o) => o.source === 'partner_excel');
    const partnerIds = new Set(partnerOrders.map((o) => o.id));

    setOrders((prev) => {
      const nonPartnerOrders = prev.filter((o) => !partnerIds.has(o.id) && o.source !== 'partner_excel');
      return [...partnerOrders, ...nonPartnerOrders];
    });

    return {
      success: true,
      count: partnerOrders.length,
      message: `${partnerOrders.length} encomendas sincronizadas com o calendário!`,
    };
  };

  // Funções de Transações Financeiras
  const addTransaction = (tx: Omit<FinancialTransaction, 'id'>) => {
    const newTx: FinancialTransaction = { ...tx, id: `tr-${Date.now()}` };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Funções do Carrinho
  const addToCart = (item: Omit<OrderItem, 'id'>) => {
    const newItem: OrderItem = { ...item, id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` };
    setCart((prev) => [...prev, newItem]);
    setIsCartOpen(true);
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => {
        if (i.id !== itemId) return i;
        return { ...i, quantity: qty, totalPrice: i.unitPrice * qty };
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  // Modal Customizador
  const openCustomizer = (product: Product) => {
    setCustomizingProduct(product);
    setIsCustomModalOpen(true);
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        updateSettings,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        customOptions,
        addCustomOption,
        updateCustomOption,
        deleteCustomOption,
        ingredients,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        adjustStock,
        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        markOrderDepositPaid,
        markOrderRemainingPaid,
        syncPartnerSpreadsheet,
        addBlockedDate,
        removeBlockedDate,
        transactions,
        addTransaction,
        deleteTransaction,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        isCustomModalOpen,
        setIsCustomModalOpen,
        customizingProduct,
        openCustomizer,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore deve ser usado dentro de um StoreProvider');
  }
  return context;
}
