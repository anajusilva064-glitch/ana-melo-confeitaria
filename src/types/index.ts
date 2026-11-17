export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
};

export type ProductType = 'cake' | 'sweets' | 'dessert' | 'gift';

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isCustomOrder: boolean;
  productType?: ProductType; // 'sweets' | 'cake' | 'dessert' | 'gift'
  prepTimeMinutes?: number;
  stock?: number;
  highlightBadge?: string;
};

export type CustomOptionType =
  | 'size' // aros de bolo
  | 'dough' // massas de bolo
  | 'filling' // recheios de bolo
  | 'topping' // coberturas de bolo
  | 'extra' // adicionais gerais
  | 'sweet_size' // 25, 50, 100 unidades (cento)
  | 'sweet_traditional' // brigadeiro, beijinho, bicho de pé, cajuzinho, etc.
  | 'sweet_gourmet' // belga, ninho com nutella, pistache, etc.
  | 'wrapper'; // forminha 4 pétalas, tecido, etc.

export type CustomOrderOption = {
  id: string;
  type: CustomOptionType;
  name: string;
  description?: string;
  extraPrice: number;
  isAvailable: boolean;
  maxSelections?: number;
};

export type Ingredient = {
  id: string;
  name: string;
  unit: 'g' | 'kg' | 'ml' | 'l' | 'un';
  packageQuantity: number;
  packageCost: number;
  currentStock: number;
  minStockAlert: number;
  costPerUnit: number;
};

export type RecipeItem = {
  ingredientId: string;
  quantityNeeded: number;
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
    // Para Bolos
    size?: string;
    dough?: string;
    fillings?: string[];
    topping?: string;
    cakeMessage?: string;
    // Para Doces de Festa
    sweetPackageSize?: string; // ex: Cento (100 un), Meio Cento (50 un)
    selectedFlavors?: string[]; // ex: ['25x Brigadeiro Belga', '25x Ninho com Nutella', ...]
    wrapperType?: string; // ex: Forminhas 4 pétalas marrom
    extras?: string[];
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
  scheduledDate: string;
  scheduledTime: string;
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
  category: string;
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
