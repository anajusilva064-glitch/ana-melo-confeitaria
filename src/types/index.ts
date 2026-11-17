export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isCustomOrder: boolean; // se é produto pronta entrega ou requer encomenda
  prepTimeMinutes?: number;
  stock?: number; // unidades prontas em estoque
  highlightBadge?: string; // ex: "Mais Vendido", "Novidade", "Gourmet"
};

export type CustomOptionType = 'size' | 'dough' | 'filling' | 'topping' | 'extra';

export type CustomOrderOption = {
  id: string;
  type: CustomOptionType;
  name: string;
  description?: string;
  extraPrice: number;
  isAvailable: boolean;
  maxSelections?: number; // para recheios: ex: até 2 escolhas
};

export type Ingredient = {
  id: string;
  name: string;
  unit: 'g' | 'kg' | 'ml' | 'l' | 'un';
  packageQuantity: number; // ex: 395 (gramas na lata)
  packageCost: number; // ex: 6.50 (reais pagos)
  currentStock: number; // estoque em gramas/unidades
  minStockAlert: number;
  costPerUnit: number; // calculado: packageCost / packageQuantity
};

export type RecipeItem = {
  ingredientId: string;
  quantityNeeded: number; // quantidade em gramas/ml/unidades
};

export type ProductRecipe = {
  productId: string;
  batchYield: number; // rendimento da receita (ex: rende 40 brigadeiros)
  items: RecipeItem[];
};

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'finished' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid';
export type DeliveryType = 'pickup' | 'delivery';

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customDetails?: {
    size?: string;
    dough?: string;
    fillings?: string[];
    topping?: string;
    extras?: string[];
    cakeMessage?: string; // mensagem do topo / velinha
  };
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  deliveryNeighborhood?: string;
  deliveryFee: number;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: 'pix' | 'cash' | 'card';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  notes?: string;
  createdAt: string;
};

export type TransactionType = 'income' | 'expense';

export type FinancialTransaction = {
  id: string;
  type: TransactionType;
  category: string; // ex: "Venda de Pedido", "Insumos", "Embalagens", "Gás/Energia", "Marketing"
  description: string;
  amount: number;
  date: string;
  relatedOrderId?: string;
};

export type StoreSettings = {
  storeName: string;
  tagline: string;
  whatsapp: string;
  instagram: string;
  instagramUrl: string;
  address: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  pixReceiverName: string;
  defaultDeliveryFee: number;
  freeDeliveryMinAmount: number;
  minNoticeHoursReady: number;
  minNoticeHoursCustom: number;
  businessHours: string;
  isOpen: boolean;
};
