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
  productType?: ProductType;
  prepTimeMinutes?: number;
  stock?: number;
  highlightBadge?: string;
};

export type CustomOptionType =
  | 'size'
  | 'dough'
  | 'filling'
  | 'topping'
  | 'extra'
  | 'sweet_size'
  | 'sweet_traditional'
  | 'sweet_gourmet'
  | 'wrapper';

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
    size?: string;
    dough?: string;
    fillings?: string[];
    topping?: string;
    cakeMessage?: string;
    sweetPackageSize?: string;
    selectedFlavors?: string[];
    wrapperType?: string;
    extras?: string[];
  };
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  isPreOrder?: boolean; // se é encomenda agendada ou pronta entrega imediata
  source?: 'storefront' | 'partner_excel' | 'direct_whatsapp';
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
  partnerInfo?: {
    eventName?: string;
    packageType?: string;
    rawText?: string;
  };
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
  isResidential: boolean;
  showExactAddressPublicly: boolean;
  publicAddressText: string;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  pixReceiverName: string;
  defaultDeliveryFee: number;
  freeDeliveryMinAmount: number;
  minNoticeHoursReady: number;
  minNoticeHoursCustom: number;
  businessHours: string;
  isOpen: boolean;

  // Planilha de Encomendas do Parceiro (Excel / OneDrive)
  partnerSpreadsheetUrl: string;
  partnerSyncEnabled: boolean;

  // Integração com API do WhatsApp (Evolution API / Z-API / Baileys / Twilio)
  whatsappApiUrl?: string;
  whatsappApiKey?: string;
  whatsappInstanceName?: string;
  whatsappAutoNotify: boolean; // Disparar mensagem automaticamente ao mudar status
};
