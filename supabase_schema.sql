-- ========================================================
-- ANA MELO DOCES GOURMET - SCHEMA DO BANCO DE DADOS (SUPABASE)
-- Execute este script no SQL Editor do seu painel Supabase
-- ========================================================

-- 1. Tabela de Configurações da Loja
CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_name TEXT NOT NULL DEFAULT 'Ana Melo Doces Gourmet',
  tagline TEXT,
  whatsapp TEXT,
  instagram TEXT,
  address TEXT,
  pix_key TEXT,
  pix_key_type TEXT DEFAULT 'email',
  pix_receiver_name TEXT,
  default_delivery_fee NUMERIC(10, 2) DEFAULT 12.00,
  free_delivery_min_amount NUMERIC(10, 2) DEFAULT 150.00,
  min_notice_hours_ready INT DEFAULT 1,
  min_notice_hours_custom INT DEFAULT 48,
  business_hours TEXT,
  is_open BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Produtos (Cardápio & Encomendas)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  is_custom_order BOOLEAN DEFAULT false,
  prep_time_minutes INT DEFAULT 0,
  stock INT DEFAULT 10,
  highlight_badge TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Opções de Encomenda Personalizada (Aros, Massas, Recheios, Coberturas)
CREATE TABLE IF NOT EXISTS custom_order_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'size', 'dough', 'filling', 'topping', 'extra'
  name TEXT NOT NULL,
  description TEXT,
  extra_price NUMERIC(10, 2) DEFAULT 0.00,
  is_available BOOLEAN DEFAULT true,
  max_selections INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de Insumos & Embalagens (Estoque)
CREATE TABLE IF NOT EXISTS ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL, -- 'g', 'kg', 'ml', 'l', 'un'
  package_quantity NUMERIC(10, 2) NOT NULL,
  package_cost NUMERIC(10, 2) NOT NULL,
  current_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
  min_stock_alert NUMERIC(10, 2) NOT NULL DEFAULT 0,
  cost_per_unit NUMERIC(10, 4) GENERATED ALWAYS AS (package_cost / NULLIF(package_quantity, 0)) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  delivery_type TEXT NOT NULL, -- 'delivery', 'pickup'
  delivery_address TEXT,
  delivery_neighborhood TEXT,
  delivery_fee NUMERIC(10, 2) DEFAULT 0.00,
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_method TEXT DEFAULT 'pix',
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid'
  order_status TEXT DEFAULT 'received', -- 'received', 'preparing', 'ready', 'finished', 'cancelled'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  custom_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de Transações Financeiras (Fluxo de Caixa)
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'income', 'expense'
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================================
-- Políticas de Segurança (Row Level Security - RLS)
-- ========================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_order_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Leitura pública para catálogo do cliente
CREATE POLICY "Permitir leitura pública de categorias ativas" ON categories FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de produtos ativos" ON products FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de opções de encomenda" ON custom_order_options FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de dados da loja" ON store_settings FOR SELECT USING (true);

-- Clientes podem criar pedidos
CREATE POLICY "Permitir criação pública de pedidos" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir criação pública de itens do pedido" ON order_items FOR INSERT WITH CHECK (true);

-- Permissões totais para gerenciamento
CREATE POLICY "Permitir gerenciamento total de categorias" ON categories FOR ALL USING (true);
CREATE POLICY "Permitir gerenciamento total de produtos" ON products FOR ALL USING (true);
CREATE POLICY "Permitir gerenciamento total de pedidos" ON orders FOR ALL USING (true);
CREATE POLICY "Permitir gerenciamento total de itens" ON order_items FOR ALL USING (true);
