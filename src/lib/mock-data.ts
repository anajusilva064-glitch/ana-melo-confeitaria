import {
  Category,
  Product,
  CustomOrderOption,
  Ingredient,
  Order,
  FinancialTransaction,
  StoreSettings,
} from '@/types';

export const initialSettings: StoreSettings = {
  storeName: 'Ana Melo Confeitaria',
  tagline: 'Confeitaria artesanal. Produções sob encomenda e momentos especiais.',
  whatsapp: '(44) 99973-9472',
  instagram: '@anameloconfeitaria__',
  instagramUrl: 'https://www.instagram.com/anameloconfeitaria__?dlrf=MTQ0end1MjMyaDIydw%3D%3D&utm_source=qr',
  address: 'Rua Marcio Bacaraim Possebom 2082',
  pixKey: '44999739472',
  pixKeyType: 'phone',
  pixReceiverName: 'Ana Melo',
  defaultDeliveryFee: 0,
  freeDeliveryMinAmount: 0,
  minNoticeHoursReady: 2,
  minNoticeHoursCustom: 48,
  businessHours: 'Atendimento sob encomenda com retirada agendada no ateliê.',
  isOpen: true,
};

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Bolos Sob Encomenda', slug: 'bolos-encomenda', sortOrder: 1, isActive: true },
  { id: 'cat-2', name: 'Doces Finos e Brigadeiros', slug: 'doces-finos', sortOrder: 2, isActive: true },
  { id: 'cat-3', name: 'Sobremesas e Fatias', slug: 'sobremesas-fatias', sortOrder: 3, isActive: true },
  { id: 'cat-4', name: 'Caixas de Presente', slug: 'caixas-presente', sortOrder: 4, isActive: true },
];

export const initialProducts: Product[] = [
  {
    id: 'prod-1',
    categoryId: 'cat-1',
    name: 'Bolo Decorado Personalizado',
    description: 'Bolo artesanal sob encomenda. Escolha o tamanho em fatias, tipo de massa, recheios e decoração para sua comemoração.',
    price: 140.00,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80',
    isAvailable: true,
    isCustomOrder: true,
    prepTimeMinutes: 2880,
    highlightBadge: 'Mais Solicitado',
  },
  {
    id: 'prod-2',
    categoryId: 'cat-1',
    name: 'Bento Cake Personalizado',
    description: 'Mini bolo individual decorado na caixinha com escrita personalizada à sua escolha. Ideal para pequenos presentes e homenagens.',
    price: 50.00,
    imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&auto=format&fit=crop&q=80',
    isAvailable: true,
    isCustomOrder: true,
    prepTimeMinutes: 1440,
    highlightBadge: 'Individual',
  },
  {
    id: 'prod-3',
    categoryId: 'cat-2',
    name: 'Cento de Brigadeiros Nobres',
    description: '100 unidades enroladas à mão com confeitos especiais: Belga ao Leite, Ninho Trufado, Pistache e Meio Amargo.',
    price: 190.00,
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=80',
    isAvailable: true,
    isCustomOrder: true,
    prepTimeMinutes: 1440,
    highlightBadge: 'Festas',
  },
  {
    id: 'prod-4',
    categoryId: 'cat-4',
    name: 'Caixa Presente com 12 Brigadeiros',
    description: 'Embalagem rígida especial para presente, com visor transparente e seleção de 12 doces finos artesanais sortidos.',
    price: 52.00,
    imageUrl: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?w=800&auto=format&fit=crop&q=80',
    isAvailable: true,
    isCustomOrder: false,
    stock: 6,
    highlightBadge: 'Presente',
  },
  {
    id: 'prod-5',
    categoryId: 'cat-3',
    name: 'Fatia de Red Velvet',
    description: 'Fatia individual de massa veludo vermelho com recheio tradicional de cream cheese e leve toque cítrico de frutas vermelhas.',
    price: 22.00,
    imageUrl: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=800&auto=format&fit=crop&q=80',
    isAvailable: true,
    isCustomOrder: false,
    stock: 8,
  },
  {
    id: 'prod-6',
    categoryId: 'cat-3',
    name: 'Torta Banoffee no Pote',
    description: 'Massa crocante de biscoito, doce de leite artesanal, bananas selecionadas e cobertura leve polvilhada com canela.',
    price: 20.00,
    imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop&q=80',
    isAvailable: true,
    isCustomOrder: false,
    stock: 10,
  },
];

export const initialCustomOptions: CustomOrderOption[] = [
  // Tamanhos
  { id: 'opt-size-1', type: 'size', name: 'Aro 15 (10 a 12 fatias)', description: 'Aproximadamente 1,2 kg', extraPrice: 0, isAvailable: true },
  { id: 'opt-size-2', type: 'size', name: 'Aro 20 (20 a 25 fatias)', description: 'Aproximadamente 2,2 kg', extraPrice: 70.00, isAvailable: true },
  { id: 'opt-size-3', type: 'size', name: 'Aro 25 (35 a 40 fatias)', description: 'Aproximadamente 3,5 kg', extraPrice: 140.00, isAvailable: true },

  // Massas
  { id: 'opt-dough-1', type: 'dough', name: 'Massa de Baunilha Amanteigada', description: 'Massa leve e fofinha com fava de baunilha', extraPrice: 0, isAvailable: true },
  { id: 'opt-dough-2', type: 'dough', name: 'Massa de Cacau 100%', description: 'Sabor acentuado de chocolate nobre', extraPrice: 5.00, isAvailable: true },
  { id: 'opt-dough-3', type: 'dough', name: 'Massa Red Velvet Tradicional', description: 'Massa aveludada e macia', extraPrice: 10.00, isAvailable: true },

  // Recheios
  { id: 'opt-fill-1', type: 'filling', name: 'Brigadeiro Belga ao Leite', description: 'Cremoso, feito com chocolate nobre', extraPrice: 0, isAvailable: true, maxSelections: 2 },
  { id: 'opt-fill-2', type: 'filling', name: 'Ninho Trufado', description: 'Recheio aveludado e suave', extraPrice: 0, isAvailable: true, maxSelections: 2 },
  { id: 'opt-fill-3', type: 'filling', name: 'Geleia Artesanal de Frutas Vermelhas', description: 'Preparo caseiro com morangos e amoras', extraPrice: 10.00, isAvailable: true, maxSelections: 2 },
  { id: 'opt-fill-4', type: 'filling', name: 'Doce de Leite com Nozes', description: 'Doce de leite cozido com nozes selecionadas', extraPrice: 10.00, isAvailable: true, maxSelections: 2 },
  { id: 'opt-fill-5', type: 'filling', name: 'Creme Quatro Leites', description: 'Textura consistente e sabor suave', extraPrice: 0, isAvailable: true, maxSelections: 2 },
  { id: 'opt-fill-6', type: 'filling', name: 'Nutella Pura', description: 'Camada generosa de Nutella', extraPrice: 15.00, isAvailable: true, maxSelections: 2 },

  // Coberturas
  { id: 'opt-top-1', type: 'topping', name: 'Chantininho Espatulado Liso', description: 'Acabamento delicado e acabamento neutro', extraPrice: 0, isAvailable: true },
  { id: 'opt-top-2', type: 'topping', name: 'Ganache de Chocolate Nobre', description: 'Bordas retas e estrutura firme', extraPrice: 15.00, isAvailable: true },
  { id: 'opt-top-3', type: 'topping', name: 'Drip Cake Decorado', description: 'Gotas escorrendo com docinhos finos no topo', extraPrice: 20.00, isAvailable: true },

  // Adicionais
  { id: 'opt-ext-1', type: 'extra', name: 'Topo de Bolo Personalizado (Nome e Idade)', extraPrice: 25.00, isAvailable: true },
  { id: 'opt-ext-2', type: 'extra', name: 'Vela Faísca Estrela', extraPrice: 8.00, isAvailable: true },
  { id: 'opt-ext-3', type: 'extra', name: 'Caixa de Transporte Rígida com Fita', extraPrice: 18.00, isAvailable: true },
];

export const initialIngredients: Ingredient[] = [
  { id: 'ing-1', name: 'Leite Condensado Moça', unit: 'g', packageQuantity: 395, packageCost: 7.50, currentStock: 7900, minStockAlert: 3950, costPerUnit: 7.50 / 395 },
  { id: 'ing-2', name: 'Creme de Leite', unit: 'g', packageQuantity: 200, packageCost: 4.20, currentStock: 4000, minStockAlert: 2000, costPerUnit: 4.20 / 200 },
  { id: 'ing-3', name: 'Chocolate Nobre 54%', unit: 'g', packageQuantity: 1000, packageCost: 98.00, currentStock: 3500, minStockAlert: 2000, costPerUnit: 98.00 / 1000 },
  { id: 'ing-4', name: 'Leite em Pó Ninho', unit: 'g', packageQuantity: 400, packageCost: 21.90, currentStock: 1600, minStockAlert: 800, costPerUnit: 21.90 / 400 },
  { id: 'ing-5', name: 'Morangos Selecionados', unit: 'g', packageQuantity: 250, packageCost: 12.00, currentStock: 1250, minStockAlert: 500, costPerUnit: 12.00 / 250 },
  { id: 'ing-6', name: 'Manteiga Extra', unit: 'g', packageQuantity: 200, packageCost: 11.50, currentStock: 1400, minStockAlert: 600, costPerUnit: 11.50 / 200 },
  { id: 'ing-7', name: 'Farinha de Trigo Especial', unit: 'g', packageQuantity: 1000, packageCost: 5.80, currentStock: 8000, minStockAlert: 3000, costPerUnit: 5.80 / 1000 },
  { id: 'ing-8', name: 'Caixa de Transporte Aro 20', unit: 'un', packageQuantity: 1, packageCost: 8.90, currentStock: 18, minStockAlert: 10, costPerUnit: 8.90 },
];

export const initialOrders: Order[] = [
  {
    id: 'ord-101',
    orderNumber: '#101',
    customerName: 'Mariana Costa',
    customerPhone: '(44) 99812-3456',
    deliveryType: 'pickup',
    deliveryFee: 0,
    scheduledDate: '2026-11-18',
    scheduledTime: '15:30',
    items: [
      {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Bolo Decorado Personalizado',
        quantity: 1,
        unitPrice: 210.00,
        totalPrice: 210.00,
        customDetails: {
          size: 'Aro 20 (20 a 25 fatias)',
          dough: 'Massa de Cacau 100%',
          fillings: ['Brigadeiro Belga ao Leite', 'Ninho Trufado'],
          topping: 'Chantininho Espatulado Liso',
          cakeMessage: 'Parabéns Helena',
        },
      },
    ],
    totalAmount: 210.00,
    paymentMethod: 'pix',
    paymentStatus: 'paid',
    orderStatus: 'preparing',
    createdAt: '2026-11-17T09:00:00Z',
  },
];

export const initialTransactions: FinancialTransaction[] = [
  { id: 'tr-1', type: 'income', category: 'Vendas de Encomendas', description: 'Pedido #101 - Bolo Decorado', amount: 210.00, date: '2026-11-17T09:00:00Z', relatedOrderId: 'ord-101' },
  { id: 'tr-2', type: 'expense', category: 'Insumos', description: 'Compra de Chocolate Nobre e Embalagens', amount: 180.00, date: '2026-11-16T14:00:00Z' },
];
