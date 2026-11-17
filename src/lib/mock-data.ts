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
  tagline: 'Doces gourmet de festa, doces tradicionais e bolos artesanais sob encomenda.',
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
  businessHours: 'Produções sob encomenda com retirada agendada no ateliê em Maringá - PR.',
  isOpen: true,
};

export const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Doces Gourmet de Festa', slug: 'doces-gourmet-festa', sortOrder: 1, isActive: true },
  { id: 'cat-2', name: 'Doces Tradicionais de Festa', slug: 'doces-tradicionais-festa', sortOrder: 2, isActive: true },
  { id: 'cat-3', name: 'Bolos Sob Encomenda', slug: 'bolos-encomenda', sortOrder: 3, isActive: true },
  { id: 'cat-4', name: 'Sobremesas e Fatias', slug: 'sobremesas-fatias', sortOrder: 4, isActive: true },
  { id: 'cat-5', name: 'Caixas de Presente', slug: 'caixas-presente', sortOrder: 5, isActive: true },
];

export const initialProducts: Product[] = [
  // DOCES GOURMET DE FESTA (O CARRO-CHEFE)
  {
    id: 'prod-cento-gourmet',
    categoryId: 'cat-1',
    name: 'Cento de Doces Gourmet de Festa (100 unidades)',
    description: '100 doces finos artesanais enrolados à mão com confeitos especiais. Escolha até 4 sabores para compor seu cento (25 de cada).',
    price: 190.00,
    imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&auto=format&fit=crop&q=80',
    isAvailable: true,
    isCustomOrder: true,
    productType: 'sweets',
    prepTimeMinutes: 2880,
    highlightBadge: 'Carro-Chefe',
  },
  {
    id: 'prod-meio-gourmet',
    categoryId: 'cat-1',
    name: 'Meio Cento Gourmet de Festa (50 unidades)',
    description: '50 doces finos artesanais gourmet. Escolha até 2 sabores (25 de cada) para comemorações menores e reuniões familiares.',
    price: 100.00,
    imageUrl: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?w=800&auto=format&fit=crop&q=80',
    isAvailable: true,
    isCustomOrder: true,
    productType: 'sweets',
    prepTimeMinutes: 1440,
    highlightBadge: '50 Unidades',
  },

  // DOCES TRADICIONAIS DE FESTA
  {
    id: 'prod-cento-tradicional',
    categoryId: 'cat-2',
    name: 'Cento de Doces Tradicionais de Festa (100 unidades)',
    description: 'Os clássicos inesquecíveis de aniversário infantil e eventos: brigadeiro ao leite, beijinho de coco, bicho de pé, dois amores e cajuzinho. Escolha até 4 sabores.',
    price: 150.00,
    imageUrl: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&auto=format&fit=crop&q=80',
    isAvailable: true,
    isCustomOrder: true,
    productType: 'sweets',
    prepTimeMinutes: 2880,
    highlightBadge: 'Clássico de Aniversário',
  },
  {
    id: 'prod-meio-tradicional',
    categoryId: 'cat-2',
    name: 'Meio Cento Tradicional de Festa (50 unidades)',
    description: '50 doces tradicionais de festa. Escolha até 2 sabores clássicos para festas infantis e celebrações.',
    price: 80.00,
    imageUrl: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?w=800&auto=format&fit=crop&q=80',
    isAvailable: true,
    isCustomOrder: true,
    productType: 'sweets',
    prepTimeMinutes: 1440,
  },
  {
    id: 'prod-caixa-25',
    categoryId: 'cat-2',
    name: 'Caixa de Doces Sortidos (25 unidades)',
    description: 'Caixa com 25 docinhos artesanais (escolha 1 ou 2 sabores). Perfeito para confraternizações, aniversários de escritório ou lanches especiais.',
    price: 45.00,
    imageUrl: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?w=800&auto=format&fit=crop&q=80',
    isAvailable: true,
    isCustomOrder: true,
    productType: 'sweets',
    prepTimeMinutes: 1440,
  },

  // BOLOS SOB ENCOMENDA
  {
    id: 'prod-bolo-festivo',
    categoryId: 'cat-3',
    name: 'Bolo Decorado Personalizado',
    description: 'Bolo comemorativo artesanal. Escolha o número de fatias, massa fofinha amanteigada, dois recheios e acabamento espatulado.',
    price: 140.00,
    imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80',
    isAvailable: true,
    isCustomOrder: true,
    productType: 'cake',
    prepTimeMinutes: 2880,
    highlightBadge: 'Sob Encomenda',
  },
  {
    id: 'prod-bento',
    categoryId: 'cat-3',
    name: 'Bento Cake Personalizado',
    description: 'Mini bolo decorado de 400g na caixinha com frase ou desenho à sua escolha.',
    price: 50.00,
    imageUrl: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&auto=format&fit=crop&q=80',
    isAvailable: true,
    isCustomOrder: true,
    productType: 'cake',
    prepTimeMinutes: 1440,
  },

  // SOBREMESAS & CAIXAS
  {
    id: 'prod-fatia',
    categoryId: 'cat-4',
    name: 'Fatia Suprema Red Velvet',
    description: 'Fatia individual com massa veludo vermelho e recheio tradicional de cream cheese artesanal.',
    price: 22.00,
    imageUrl: 'https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?w=800&auto=format&fit=crop&q=80',
    isAvailable: true,
    isCustomOrder: false,
    stock: 8,
  },
  {
    id: 'prod-banoffee',
    categoryId: 'cat-4',
    name: 'Torta Banoffee no Pote',
    description: 'Massa crocante amanteigada, doce de leite artesanal, bananas selecionadas e cobertura leve com canela.',
    price: 20.00,
    imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop&q=80',
    isAvailable: true,
    isCustomOrder: false,
    stock: 10,
  },
  {
    id: 'prod-caixa-presente',
    categoryId: 'cat-5',
    name: 'Caixa Presente com 12 Brigadeiros Finos',
    description: 'Caixa rígida para presente com laço e seleção de 12 doces gourmet sortidos.',
    price: 52.00,
    imageUrl: 'https://images.unsplash.com/photo-1548848221-0c2e497ed557?w=800&auto=format&fit=crop&q=80',
    isAvailable: true,
    isCustomOrder: false,
    stock: 6,
  },
];

export const initialCustomOptions: CustomOrderOption[] = [
  // --- SABORES DE DOCES GOURMET DE FESTA ---
  { id: 'opt-sw-g1', type: 'sweet_gourmet', name: 'Brigadeiro Belga 54% Callebaut', description: 'Chocolate nobre meio amargo', extraPrice: 0, isAvailable: true },
  { id: 'opt-sw-g2', type: 'sweet_gourmet', name: 'Ninho Trufado com Nutella Pura', description: 'Brigadeiro de leite Ninho com gota generosa de Nutella', extraPrice: 0, isAvailable: true },
  { id: 'opt-sw-g3', type: 'sweet_gourmet', name: 'Pistache Supremo', description: 'Brigadeiro com pasta pura de pistache e pedacinhos crocantes', extraPrice: 15.00, isAvailable: true },
  { id: 'opt-sw-g4', type: 'sweet_gourmet', name: 'Churros com Doce de Leite', description: 'Massa aromatizada com canela e bico de doce de leite', extraPrice: 0, isAvailable: true },
  { id: 'opt-sw-g5', type: 'sweet_gourmet', name: 'Frutas Vermelhas com Chocolate Branco', description: 'Massa suave com toque de calda caseira de frutas vermelhas', extraPrice: 5.00, isAvailable: true },
  { id: 'opt-sw-g6', type: 'sweet_gourmet', name: 'Surpresa de Uva Thompson', description: 'Uva verde sem semente envolta em brigadeiro branco suave', extraPrice: 10.00, isAvailable: true },
  { id: 'opt-sw-g7', type: 'sweet_gourmet', name: 'Camafeu Nobre de Nozes', description: 'Doce fino com nozes chilenas e banho de fondant', extraPrice: 20.00, isAvailable: true },

  // --- SABORES DE DOCES TRADICIONAIS DE FESTA ---
  { id: 'opt-sw-t1', type: 'sweet_traditional', name: 'Brigadeiro Tradicional ao Leite', description: 'O clássico de festa com granulado macio', extraPrice: 0, isAvailable: true },
  { id: 'opt-sw-t2', type: 'sweet_traditional', name: 'Beijinho de Coco Artesanal', description: 'Feito com coco fresco e cravo tradicional', extraPrice: 0, isAvailable: true },
  { id: 'opt-sw-t3', type: 'sweet_traditional', name: 'Bicho de Pé (Moranguinho)', description: 'O clássico docinho rosa de infância', extraPrice: 0, isAvailable: true },
  { id: 'opt-sw-t4', type: 'sweet_traditional', name: 'Dois Amores (Casadinho Preto e Branco)', description: 'Metade brigadeiro preto, metade brigadeiro branco', extraPrice: 0, isAvailable: true },
  { id: 'opt-sw-t5', type: 'sweet_traditional', name: 'Cajuzinho de Amendoim', description: 'Massa cremosa de amendoim com açúcar cristal', extraPrice: 0, isAvailable: true },
  { id: 'opt-sw-t6', type: 'sweet_traditional', name: 'Olho de Sogra', description: 'Beijinho cremoso recheado na ameixa preta', extraPrice: 5.00, isAvailable: true },

  // --- EMBALAGENS E FORMINHAS DE DOCE ---
  { id: 'opt-wrap-1', type: 'wrapper', name: 'Forminha 4 Pétalas Kraft / Bege (Padrão)', extraPrice: 0, isAvailable: true },
  { id: 'opt-wrap-2', type: 'wrapper', name: 'Forminha 4 Pétalas Marrom Chocolate', extraPrice: 0, isAvailable: true },
  { id: 'opt-wrap-3', type: 'wrapper', name: 'Forminha 4 Pétalas Rosa Bebê', extraPrice: 0, isAvailable: true },
  { id: 'opt-wrap-4', type: 'wrapper', name: 'Forminha de Tecido em Tela Especial', extraPrice: 25.00, isAvailable: true },

  // --- OPÇÕES DE BOLO ---
  { id: 'opt-size-1', type: 'size', name: 'Aro 15 (10 a 12 fatias)', description: 'Aproximadamente 1,2 kg', extraPrice: 0, isAvailable: true },
  { id: 'opt-size-2', type: 'size', name: 'Aro 20 (20 a 25 fatias)', description: 'Aproximadamente 2,2 kg', extraPrice: 70.00, isAvailable: true },
  { id: 'opt-size-3', type: 'size', name: 'Aro 25 (35 a 40 fatias)', description: 'Aproximadamente 3,5 kg', extraPrice: 140.00, isAvailable: true },

  { id: 'opt-dough-1', type: 'dough', name: 'Massa de Baunilha Amanteigada', description: 'Leve e estruturada', extraPrice: 0, isAvailable: true },
  { id: 'opt-dough-2', type: 'dough', name: 'Massa de Cacau 100%', description: 'Sabor marcante de chocolate', extraPrice: 5.00, isAvailable: true },
  { id: 'opt-dough-3', type: 'dough', name: 'Massa Red Velvet Tradicional', description: 'Aveludada e macia', extraPrice: 10.00, isAvailable: true },

  { id: 'opt-fill-1', type: 'filling', name: 'Brigadeiro Belga ao Leite', extraPrice: 0, isAvailable: true, maxSelections: 2 },
  { id: 'opt-fill-2', type: 'filling', name: 'Ninho Trufado', extraPrice: 0, isAvailable: true, maxSelections: 2 },
  { id: 'opt-fill-3', type: 'filling', name: 'Geleia Artesanal de Frutas Vermelhas', extraPrice: 10.00, isAvailable: true, maxSelections: 2 },
  { id: 'opt-fill-4', type: 'filling', name: 'Doce de Leite com Nozes', extraPrice: 10.00, isAvailable: true, maxSelections: 2 },
  { id: 'opt-fill-5', type: 'filling', name: 'Quatro Leites', extraPrice: 0, isAvailable: true, maxSelections: 2 },
  { id: 'opt-fill-6', type: 'filling', name: 'Nutella Pura', extraPrice: 15.00, isAvailable: true, maxSelections: 2 },

  { id: 'opt-top-1', type: 'topping', name: 'Chantininho Espatulado Liso', extraPrice: 0, isAvailable: true },
  { id: 'opt-top-2', type: 'topping', name: 'Ganache de Chocolate Nobre', extraPrice: 15.00, isAvailable: true },

  { id: 'opt-ext-1', type: 'extra', name: 'Topo de Bolo Personalizado (Nome e Idade)', extraPrice: 25.00, isAvailable: true },
  { id: 'opt-ext-2', type: 'extra', name: 'Vela Faísca Estrela', extraPrice: 8.00, isAvailable: true },
];

export const initialIngredients: Ingredient[] = [
  { id: 'ing-1', name: 'Leite Condensado Moça', unit: 'g', packageQuantity: 395, packageCost: 7.50, currentStock: 15800, minStockAlert: 3950, costPerUnit: 7.50 / 395 },
  { id: 'ing-2', name: 'Creme de Leite', unit: 'g', packageQuantity: 200, packageCost: 4.20, currentStock: 8000, minStockAlert: 2000, costPerUnit: 4.20 / 200 },
  { id: 'ing-3', name: 'Chocolate Nobre 54%', unit: 'g', packageQuantity: 1000, packageCost: 98.00, currentStock: 5000, minStockAlert: 2000, costPerUnit: 98.00 / 1000 },
  { id: 'ing-4', name: 'Leite em Pó Ninho', unit: 'g', packageQuantity: 400, packageCost: 21.90, currentStock: 3200, minStockAlert: 800, costPerUnit: 21.90 / 400 },
  { id: 'ing-5', name: 'Coco Ralado Fino sem Açúcar', unit: 'g', packageQuantity: 1000, packageCost: 32.00, currentStock: 3000, minStockAlert: 1000, costPerUnit: 0.032 },
  { id: 'ing-6', name: 'Pasta Pura de Pistache', unit: 'g', packageQuantity: 500, packageCost: 140.00, currentStock: 1000, minStockAlert: 500, costPerUnit: 0.28 },
  { id: 'ing-7', name: 'Nutella Pura (Balde 3kg)', unit: 'g', packageQuantity: 3000, packageCost: 165.00, currentStock: 6000, minStockAlert: 1500, costPerUnit: 165.00 / 3000 },
  { id: 'ing-8', name: 'Forminhas 4 Pétalas Marrom', unit: 'un', packageQuantity: 100, packageCost: 12.00, currentStock: 1500, minStockAlert: 500, costPerUnit: 0.12 },
  { id: 'ing-9', name: 'Forminhas 4 Pétalas Kraft', unit: 'un', packageQuantity: 100, packageCost: 12.00, currentStock: 1500, minStockAlert: 500, costPerUnit: 0.12 },
  { id: 'ing-10', name: 'Caixa de Transporte para Cento', unit: 'un', packageQuantity: 1, packageCost: 4.50, currentStock: 50, minStockAlert: 20, costPerUnit: 4.50 },
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
        productId: 'prod-cento-gourmet',
        productName: 'Cento de Doces Gourmet de Festa (100 unidades)',
        quantity: 1,
        unitPrice: 190.00,
        totalPrice: 190.00,
        customDetails: {
          sweetPackageSize: 'Cento (100 unidades)',
          selectedFlavors: [
            '25x Brigadeiro Belga 54% Callebaut',
            '25x Ninho Trufado com Nutella Pura',
            '25x Churros com Doce de Leite',
            '25x Frutas Vermelhas com Chocolate Branco',
          ],
          wrapperType: 'Forminha 4 Pétalas Kraft / Bege (Padrão)',
        },
      },
    ],
    totalAmount: 190.00,
    paymentMethod: 'pix',
    paymentStatus: 'paid',
    orderStatus: 'preparing',
    createdAt: '2026-11-17T09:00:00Z',
  },
];

export const initialTransactions: FinancialTransaction[] = [
  { id: 'tr-1', type: 'income', category: 'Vendas de Encomendas', description: 'Pedido #101 - Cento de Doces Gourmet', amount: 190.00, date: '2026-11-17T09:00:00Z', relatedOrderId: 'ord-101' },
  { id: 'tr-2', type: 'expense', category: 'Insumos', description: 'Compra de Chocolate Nobre, Leite Moça e Forminhas', amount: 220.00, date: '2026-11-16T14:00:00Z' },
];
