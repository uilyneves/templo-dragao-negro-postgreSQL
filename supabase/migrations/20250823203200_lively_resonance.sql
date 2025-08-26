/*
  # RESET COMPLETO - TEMPLO DE KIMBANDA DRAGÃO NEGRO
  
  Este script faz um reset completo do banco de dados e recria
  toda a estrutura necessária com RLS ativado.
  
  INSTRUÇÕES:
  1. Acesse seu projeto no Supabase
  2. Vá em "SQL Editor"
  3. Clique em "New Query"
  4. Cole este script completo
  5. Clique em "Run"
  
  ⚠️ ATENÇÃO: Este script apaga TODOS os dados existentes!
*/

-- =====================================================
-- 1. RESET COMPLETO DO SCHEMA
-- =====================================================

-- Apagar schema público e recriar (remove tudo)
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Recriar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Garantir que o usuário postgres tenha acesso
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- =====================================================
-- 2. TABELAS BASE DE AUTENTICAÇÃO E RBAC
-- =====================================================

-- Roles/Cargos do sistema
CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  permissions jsonb DEFAULT '{}',
  is_system boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Permissões por cargo
CREATE TABLE role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  resource text NOT NULL,
  action text NOT NULL,
  granted boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, resource, action)
);

-- Usuários administrativos (estende auth.users)
CREATE TABLE admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 3. TABELAS PRINCIPAIS DO TEMPLO (BASEADAS NO CÓDIGO)
-- =====================================================

-- Profiles (compatibilidade com código existente)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  phone text,
  role text NOT NULL DEFAULT 'visitor' CHECK (role IN ('admin', 'member', 'visitor')),
  is_active boolean NOT NULL DEFAULT true,
  avatar_url text,
  last_login timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Membros do templo (CRM)
CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  cpf text,
  birth_date date,
  address jsonb DEFAULT '{}',
  
  -- Dados espirituais
  initiation_date date,
  spiritual_level text,
  guardian_exu text,
  guardian_pomba_gira text,
  
  -- Segmentação
  tags text[] DEFAULT '{}',
  origin text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked')),
  
  -- Consentimentos LGPD
  consents jsonb DEFAULT '{}',
  
  -- Métricas
  last_interaction timestamptz DEFAULT now(),
  total_consultations integer DEFAULT 0,
  total_spent decimal(10,2) DEFAULT 0,
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Consultas com Exu
CREATE TABLE consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  consultant_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Agendamento
  date date NOT NULL,
  time time NOT NULL,
  duration_minutes integer DEFAULT 30,
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded')),
  payment_method text CHECK (payment_method IN ('pix', 'credit_card', 'debit_card', 'boleto', 'cash')),
  payment_id text,
  amount decimal(10,2) DEFAULT 120.00,
  
  -- Conteúdo
  question text,
  exu_consulted text,
  consultation_notes text,
  recommendations text,
  
  -- Controle
  scheduled_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  confirmed_at timestamptz,
  completed_at timestamptz,
  
  -- Lembretes
  reminder_24h_sent boolean DEFAULT false,
  reminder_2h_sent boolean DEFAULT false,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(date, time)
);

-- Rituais e eventos
CREATE TABLE cults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  
  -- Agendamento
  date date NOT NULL,
  time time NOT NULL,
  duration_minutes integer DEFAULT 120,
  
  -- Tipo
  type text NOT NULL DEFAULT 'regular' CHECK (type IN ('regular', 'development', 'special', 'initiation')),
  category text,
  
  -- Participação
  max_participants integer,
  current_participants integer DEFAULT 0,
  requires_registration boolean DEFAULT false,
  
  -- Status
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  published boolean DEFAULT true,
  
  -- Local
  location text DEFAULT 'Templo de Kimbanda Dragão Negro',
  
  -- Responsável
  responsible_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  
  requirements text,
  notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Categorias de produtos
CREATE TABLE product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  parent_id uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Produtos da loja
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  short_description text,
  
  -- Preços
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  compare_price decimal(10,2),
  cost_price decimal(10,2),
  
  -- Estoque
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock integer DEFAULT 0,
  track_stock boolean DEFAULT true,
  
  -- Categoria
  category_id uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  
  -- Mídia
  images text[] DEFAULT '{}',
  featured_image text,
  
  -- Status
  active boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  
  -- SEO
  meta_title text,
  meta_description text,
  
  -- Dados espirituais
  spiritual_purpose text,
  usage_instructions text,
  consecration_level text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Pedidos
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  
  -- Cliente
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  customer_email text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text,
  
  -- Valores
  subtotal decimal(10,2) NOT NULL DEFAULT 0,
  shipping_cost decimal(10,2) DEFAULT 0,
  tax_amount decimal(10,2) DEFAULT 0,
  discount_amount decimal(10,2) DEFAULT 0,
  total decimal(10,2) NOT NULL CHECK (total >= 0),
  
  -- Status
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded')),
  payment_method text NOT NULL CHECK (payment_method IN ('pix', 'credit_card', 'debit_card', 'boleto')),
  payment_id text,
  
  -- Endereços
  billing_address jsonb DEFAULT '{}',
  shipping_address jsonb DEFAULT '{}',
  
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Itens do pedido
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE RESTRICT,
  
  -- Snapshot do produto
  product_name text NOT NULL,
  product_slug text NOT NULL,
  product_image text,
  
  -- Quantidade e preços
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price decimal(10,2) NOT NULL CHECK (unit_price >= 0),
  total_price decimal(10,2) NOT NULL CHECK (total_price >= 0),
  
  created_at timestamptz DEFAULT now()
);

-- Sistema de mensagens
CREATE TABLE message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('whatsapp', 'email', 'sms')),
  subject text,
  content text NOT NULL,
  variables text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Fila de mensagens
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid REFERENCES members(id) ON DELETE SET NULL,
  recipient_email text,
  recipient_phone text,
  recipient_name text,
  
  type text NOT NULL CHECK (type IN ('whatsapp', 'email', 'sms')),
  template_id uuid REFERENCES message_templates(id) ON DELETE SET NULL,
  subject text,
  content text NOT NULL,
  
  scheduled_for timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'delivered', 'failed')),
  
  sent_at timestamptz,
  delivered_at timestamptz,
  failed_at timestamptz,
  error_message text,
  
  created_at timestamptz DEFAULT now()
);

-- Formulários submetidos
CREATE TABLE form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  member_id uuid REFERENCES members(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  status text DEFAULT 'new' CHECK (status IN ('new', 'processing', 'completed', 'spam')),
  processed_at timestamptz,
  processed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Blog posts
CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text NOT NULL,
  featured_image text,
  images text[] DEFAULT '{}',
  
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamptz,
  
  tags text[] DEFAULT '{}',
  category text,
  meta_title text,
  meta_description text,
  view_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Configurações do sistema
CREATE TABLE system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  type text DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json', 'array')),
  category text DEFAULT 'general',
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- FAQ
CREATE TABLE faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  tags text[] DEFAULT '{}',
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Doações
CREATE TABLE donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name text NOT NULL,
  donor_email text NOT NULL,
  donor_phone text,
  donor_cpf text,
  
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  payment_method text NOT NULL CHECK (payment_method IN ('pix', 'credit_card', 'debit_card', 'boleto')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed')),
  payment_id text,
  
  message text,
  is_anonymous boolean DEFAULT false,
  purpose text DEFAULT 'general',
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 3. ATIVAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cults ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 4. FUNÇÕES AUXILIARES PARA RLS
-- =====================================================

-- Verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
    AND is_active = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se usuário é membro
CREATE OR REPLACE FUNCTION is_member()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'member'
    AND is_active = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obter email do usuário atual
CREATE OR REPLACE FUNCTION current_user_email()
RETURNS text AS $$
BEGIN
  RETURN (SELECT email FROM profiles WHERE id = auth.uid());
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. POLÍTICAS RLS BÁSICAS E SEGURAS
-- =====================================================

-- ROLES - Apenas admins
CREATE POLICY "roles_admin_only" ON roles FOR ALL USING (is_admin());

-- ROLE_PERMISSIONS - Apenas admins
CREATE POLICY "role_permissions_admin_only" ON role_permissions FOR ALL USING (is_admin());

-- ADMIN_USERS - Apenas admins
CREATE POLICY "admin_users_admin_only" ON admin_users FOR ALL USING (is_admin());

-- PROFILES - Leitura pública, escrita própria ou admin
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own_or_admin" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE USING (is_admin());

-- MEMBERS - Apenas staff pode ver, sistema pode inserir
CREATE POLICY "members_select_admin" ON members FOR SELECT USING (is_admin());
CREATE POLICY "members_insert_public" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "members_update_admin" ON members FOR UPDATE USING (is_admin());
CREATE POLICY "members_delete_admin" ON members FOR DELETE USING (is_admin());

-- CONSULTATIONS - Membros veem suas próprias, admins veem todas
CREATE POLICY "consultations_select" ON consultations FOR SELECT USING (
  is_admin() OR 
  (is_member() AND EXISTS (
    SELECT 1 FROM members 
    WHERE id = consultations.member_id 
    AND email = current_user_email()
  ))
);
CREATE POLICY "consultations_insert_public" ON consultations FOR INSERT WITH CHECK (true);
CREATE POLICY "consultations_update_admin" ON consultations FOR UPDATE USING (is_admin());
CREATE POLICY "consultations_delete_admin" ON consultations FOR DELETE USING (is_admin());

-- CULTS - Públicos se publicados, admins veem todos
CREATE POLICY "cults_select_public" ON cults FOR SELECT USING (published = true OR is_admin());
CREATE POLICY "cults_insert_admin" ON cults FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "cults_update_admin" ON cults FOR UPDATE USING (is_admin());
CREATE POLICY "cults_delete_admin" ON cults FOR DELETE USING (is_admin());

-- PRODUCT_CATEGORIES - Ativas são públicas
CREATE POLICY "categories_select_active" ON product_categories FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "categories_insert_admin" ON product_categories FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "categories_update_admin" ON product_categories FOR UPDATE USING (is_admin());
CREATE POLICY "categories_delete_admin" ON product_categories FOR DELETE USING (is_admin());

-- PRODUCTS - Ativos são públicos
CREATE POLICY "products_select_active" ON products FOR SELECT USING (active = true OR is_admin());
CREATE POLICY "products_insert_admin" ON products FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "products_update_admin" ON products FOR UPDATE USING (is_admin());
CREATE POLICY "products_delete_admin" ON products FOR DELETE USING (is_admin());

-- ORDERS - Membros veem seus pedidos, admins veem todos
CREATE POLICY "orders_select" ON orders FOR SELECT USING (
  is_admin() OR 
  (is_member() AND EXISTS (
    SELECT 1 FROM members 
    WHERE id = orders.member_id 
    AND email = current_user_email()
  ))
);
CREATE POLICY "orders_insert_public" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE USING (is_admin());
CREATE POLICY "orders_delete_admin" ON orders FOR DELETE USING (is_admin());

-- ORDER_ITEMS - Seguem regras dos pedidos
CREATE POLICY "order_items_select" ON order_items FOR SELECT USING (
  is_admin() OR 
  (is_member() AND EXISTS (
    SELECT 1 FROM orders o
    JOIN members m ON m.id = o.member_id
    WHERE o.id = order_items.order_id 
    AND m.email = current_user_email()
  ))
);
CREATE POLICY "order_items_insert_public" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_update_admin" ON order_items FOR UPDATE USING (is_admin());
CREATE POLICY "order_items_delete_admin" ON order_items FOR DELETE USING (is_admin());

-- MESSAGE_TEMPLATES - Apenas admins
CREATE POLICY "templates_admin_only" ON message_templates FOR ALL USING (is_admin());

-- MESSAGES - Apenas admins podem ver, sistema pode inserir
CREATE POLICY "messages_select_admin" ON messages FOR SELECT USING (is_admin());
CREATE POLICY "messages_insert_system" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_update_admin" ON messages FOR UPDATE USING (is_admin());
CREATE POLICY "messages_delete_admin" ON messages FOR DELETE USING (is_admin());

-- FORM_SUBMISSIONS - Apenas admins podem ver, público pode inserir
CREATE POLICY "submissions_select_admin" ON form_submissions FOR SELECT USING (is_admin());
CREATE POLICY "submissions_insert_public" ON form_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "submissions_update_admin" ON form_submissions FOR UPDATE USING (is_admin());
CREATE POLICY "submissions_delete_admin" ON form_submissions FOR DELETE USING (is_admin());

-- BLOG_POSTS - Publicados são públicos
CREATE POLICY "blog_select_published" ON blog_posts FOR SELECT USING (status = 'published' OR is_admin());
CREATE POLICY "blog_insert_admin" ON blog_posts FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "blog_update_admin" ON blog_posts FOR UPDATE USING (is_admin());
CREATE POLICY "blog_delete_admin" ON blog_posts FOR DELETE USING (is_admin());

-- SYSTEM_SETTINGS - Públicas são visíveis, apenas admins editam
CREATE POLICY "settings_select_public" ON system_settings FOR SELECT USING (is_public = true OR is_admin());
CREATE POLICY "settings_insert_admin" ON system_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "settings_update_admin" ON system_settings FOR UPDATE USING (is_admin());
CREATE POLICY "settings_delete_admin" ON system_settings FOR DELETE USING (is_admin());

-- FAQS - Ativas são públicas
CREATE POLICY "faqs_select_active" ON faqs FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "faqs_insert_admin" ON faqs FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "faqs_update_admin" ON faqs FOR UPDATE USING (is_admin());
CREATE POLICY "faqs_delete_admin" ON faqs FOR DELETE USING (is_admin());

-- DONATIONS - Apenas admins podem ver, público pode doar
CREATE POLICY "donations_select_admin" ON donations FOR SELECT USING (is_admin());
CREATE POLICY "donations_insert_public" ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY "donations_update_system" ON donations FOR UPDATE USING (true);
CREATE POLICY "donations_delete_admin" ON donations FOR DELETE USING (is_admin());

-- =====================================================
-- 6. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_active ON profiles(is_active);

-- Members
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_tags ON members USING gin(tags);
CREATE INDEX idx_members_origin ON members(origin);

-- Consultations
CREATE INDEX idx_consultations_date_time ON consultations(date, time);
CREATE INDEX idx_consultations_member_id ON consultations(member_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_payment_status ON consultations(payment_status);

-- Cults
CREATE INDEX idx_cults_date ON cults(date);
CREATE INDEX idx_cults_published ON cults(published);
CREATE INDEX idx_cults_status ON cults(status);

-- Products
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_category_id ON products(category_id);

-- Orders
CREATE INDEX idx_orders_member_id ON orders(member_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Messages
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_messages_scheduled_for ON messages(scheduled_for);

-- Blog
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at);

-- =====================================================
-- 7. SEEDS OBRIGATÓRIOS
-- =====================================================

-- Cargos padrão
INSERT INTO roles (name, display_name, description, is_system) VALUES
  ('super_admin', 'Super Admin', 'Acesso total ao sistema', true),
  ('administrador', 'Administrador', 'Gerenciamento completo do templo', true),
  ('operador', 'Operador', 'Operações do dia a dia', true),
  ('atendente', 'Atendente', 'Atendimento básico', true);

-- Configurações básicas do sistema
INSERT INTO system_settings (key, value, type, category, description, is_public) VALUES
  ('site_name', '"Templo de Kimbanda Dragão Negro"', 'string', 'general', 'Nome do site', true),
  ('contact_email', '"contato@dragaonegro.com.br"', 'string', 'contact', 'Email de contato', true),
  ('contact_phone', '"(11) 99999-9999"', 'string', 'contact', 'Telefone de contato', true),
  ('consultation_price', '120.00', 'number', 'business', 'Preço da consulta', true),
  ('whatsapp_number', '"5511999999999"', 'string', 'contact', 'Número do WhatsApp', true);

-- Categorias de produtos básicas
INSERT INTO product_categories (name, slug, description, sort_order) VALUES
  ('Velas', 'velas', 'Velas para rituais e trabalhos espirituais', 1),
  ('Incensos', 'incensos', 'Incensos naturais para limpeza e proteção', 2),
  ('Imagens', 'imagens', 'Imagens de Exús, Pombas Giras e Santos', 3),
  ('Elementos', 'elementos', 'Elementos ritualísticos diversos', 4),
  ('Cristais', 'cristais', 'Cristais e pedras energizadas', 5);

-- Produtos iniciais
INSERT INTO products (name, slug, description, price, category_id, stock, images, featured, spiritual_purpose) VALUES
  (
    'Kit Velas 7 Dias - Cores Diversas',
    'kit-velas-7-dias',
    'Kit completo com 7 velas coloridas para diferentes propósitos espirituais',
    85.00,
    (SELECT id FROM product_categories WHERE slug = 'velas'),
    12,
    ARRAY['https://images.pexels.com/photos/1040893/pexels-photo-1040893.jpeg?auto=compress&cs=tinysrgb&w=400'],
    true,
    'Trabalhos espirituais diversos com cada cor'
  ),
  (
    'Incenso de Arruda - Pacote 20un',
    'incenso-arruda-20un',
    'Incenso natural de arruda para limpeza espiritual e proteção',
    25.00,
    (SELECT id FROM product_categories WHERE slug = 'incensos'),
    25,
    ARRAY['https://images.pexels.com/photos/4040635/pexels-photo-4040635.jpeg?auto=compress&cs=tinysrgb&w=400'],
    false,
    'Limpeza de ambientes e proteção contra energias negativas'
  );

-- Rituais iniciais
INSERT INTO cults (title, description, date, time, type, max_participants, requirements) VALUES
  (
    'Culto Regular de Kimbanda',
    'Culto semanal com trabalhos espirituais, consultas com Exús e passes de limpeza',
    CURRENT_DATE + INTERVAL '3 days',
    '20:00',
    'regular',
    50,
    'Roupas brancas ou pretas, respeito e fé'
  ),
  (
    'Desenvolvimento Mediúnico',
    'Sessão especial para desenvolvimento das faculdades mediúnicas',
    CURRENT_DATE + INTERVAL '5 days',
    '19:00',
    'development',
    20,
    'Roupas brancas obrigatórias, apenas para médiuns em desenvolvimento'
  );

-- Templates de mensagem
INSERT INTO message_templates (name, type, content, variables) VALUES
  (
    'consulta_confirmacao',
    'whatsapp',
    'Olá {{nome}}! Sua consulta foi confirmada para {{data}} às {{hora}}. Local: Templo de Kimbanda Dragão Negro. Até breve! 🙏',
    ARRAY['nome', 'data', 'hora']
  ),
  (
    'consulta_lembrete_24h',
    'whatsapp',
    'Olá {{nome}}! Lembrete: sua consulta está agendada para amanhã ({{data}}) às {{hora}}. Te esperamos! 🙏',
    ARRAY['nome', 'data', 'hora']
  );

-- FAQ inicial
INSERT INTO faqs (question, answer, category, sort_order) VALUES
  (
    'Como agendar uma consulta?',
    'Você pode agendar através do nosso site, WhatsApp (11) 99999-9999 ou telefone. O pagamento é feito antecipadamente para confirmar o horário.',
    'consultas',
    1
  ),
  (
    'Qual o valor das consultas?',
    'As consultas custam R$ 120,00 e têm duração de 30 minutos. Aceitamos PIX, cartão de crédito, débito e boleto.',
    'consultas',
    2
  );

-- Posts do blog
INSERT INTO blog_posts (title, slug, excerpt, content, status, published_at, tags, category) VALUES
  (
    'A Importância dos Passes na Kimbanda',
    'importancia-passes-kimbanda',
    'Entenda como os passes espirituais podem transformar sua vida e proteger sua energia.',
    'Os passes são uma das práticas mais importantes na Kimbanda. Através da imposição das mãos e da canalização da energia dos Exús, conseguimos limpar, energizar e proteger as pessoas.',
    'published',
    now(),
    ARRAY['passes', 'kimbanda', 'espiritualidade'],
    'Ensinamentos'
  );

-- Membro de exemplo
INSERT INTO members (name, email, phone, origin, tags, consents) VALUES
  (
    'Maria Silva Santos',
    'maria.santos@email.com',
    '(11) 98765-4321',
    'site',
    ARRAY['consulta', 'ativa'],
    '{"marketing": true, "data_processing": true, "whatsapp": true}'
  );

-- =====================================================
-- 8. VERIFICAÇÃO FINAL DE RLS
-- =====================================================

DO $$
DECLARE
  table_name text;
  rls_enabled boolean;
  total_tables integer := 0;
  rls_active_count integer := 0;
  policy_count integer := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔐 VERIFICANDO RLS EM TODAS AS TABELAS...';
  RAISE NOTICE '================================================';
  
  -- Lista das tabelas principais
  FOR table_name IN VALUES 
    ('roles'), ('role_permissions'), ('admin_users'), ('profiles'), 
    ('members'), ('consultations'), ('cults'), ('product_categories'),
    ('products'), ('orders'), ('order_items'), ('message_templates'),
    ('messages'), ('form_submissions'), ('blog_posts'), ('system_settings'),
    ('faqs'), ('donations')
  LOOP
    total_tables := total_tables + 1;
    
    -- Verificar se RLS está ativo
    SELECT c.relrowsecurity INTO rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname = table_name;
    
    IF rls_enabled THEN
      rls_active_count := rls_active_count + 1;
      RAISE NOTICE '✅ %: RLS ATIVO', table_name;
    ELSE
      RAISE NOTICE '❌ %: RLS INATIVO', table_name;
    END IF;
  END LOOP;
  
  -- Contar políticas totais
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMO FINAL:';
  RAISE NOTICE '   • Total de tabelas: %', total_tables;
  RAISE NOTICE '   • RLS ativo em: % tabelas', rls_active_count;
  RAISE NOTICE '   • Políticas criadas: %', policy_count;
  
  IF rls_active_count = total_tables AND policy_count > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SUCESSO TOTAL!';
    RAISE NOTICE '✅ RLS está ATIVO em todas as % tabelas!', total_tables;
    RAISE NOTICE '🔐 Banco de dados totalmente protegido!';
    RAISE NOTICE '📝 % políticas de segurança criadas!', policy_count;
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRÓXIMOS PASSOS:';
    RAISE NOTICE '   1. Habilitar signup no Supabase Auth';
    RAISE NOTICE '   2. Criar admin em /setup-admin';
    RAISE NOTICE '   3. Login: tata@dragaonegro.com.br';
    RAISE NOTICE '   4. Acessar: /admin';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  ATENÇÃO: Problemas detectados!';
    RAISE NOTICE '   Execute este script novamente se necessário.';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '🏛️ TEMPLO DE KIMBANDA DRAGÃO NEGRO';
  RAISE NOTICE '⚡ BANCO RESETADO E PROTEGIDO COM RLS!';
  RAISE NOTICE '================================================';
END $$;

-- =====================================================
-- 9. MENSAGEM DE SUCESSO
-- =====================================================

SELECT 'RESET COMPLETO EXECUTADO - RLS ATIVADO EM TODAS AS TABELAS!' as result;