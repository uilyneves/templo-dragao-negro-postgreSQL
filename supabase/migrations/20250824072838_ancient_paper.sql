/*
  # SETUP COMPLETO - Templo de Kimbanda Dragão Negro
  
  Este script cria toda a estrutura do banco de dados do zero.
  Execute APENAS após o script 00_reset_database.sql
  
  INSTRUÇÕES:
  1. Execute PRIMEIRO o script 00_reset_database.sql
  2. Acesse seu projeto no Supabase
  3. Vá em "SQL Editor"
  4. Clique em "New Query"
  5. Cole este script completo
  6. Clique em "Run"
*/

-- =====================================================
-- 1. SISTEMA DE PERMISSÕES E RBAC
-- =====================================================

-- Módulos do sistema
CREATE TABLE modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  icon text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Ações possíveis
CREATE TABLE actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Cargos/Roles do sistema
CREATE TABLE roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  level integer NOT NULL DEFAULT 0,
  is_system boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Permissões (módulo + ação + cargo)
CREATE TABLE permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
  module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
  action_id uuid REFERENCES actions(id) ON DELETE CASCADE,
  granted boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(role_id, module_id, action_id)
);

-- =====================================================
-- 2. USUÁRIOS E AUTENTICAÇÃO
-- =====================================================

-- Profiles (estende auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  phone text,
  role_id uuid REFERENCES roles(id) ON DELETE SET NULL,
  avatar_url text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 3. MEMBROS E CRM
-- =====================================================

-- Membros do templo
CREATE TABLE members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  cpf text,
  birth_date date,
  address jsonb DEFAULT '{}',
  emergency_contact jsonb DEFAULT '{}',
  
  -- Dados espirituais
  initiation_date date,
  spiritual_level text,
  guardian_exu text,
  guardian_pomba_gira text,
  
  -- Segmentação e origem
  tags text[] DEFAULT '{}',
  origin text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked', 'pending')),
  
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

-- =====================================================
-- 4. CONSULTAS E AGENDAMENTOS
-- =====================================================

-- Disponibilidade de horários
CREATE TABLE availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  time time NOT NULL,
  duration_minutes integer DEFAULT 30,
  is_available boolean DEFAULT true,
  consultant_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date, time)
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
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled')),
  payment_method text CHECK (payment_method IN ('pix', 'credit_card', 'debit_card', 'boleto', 'cash', 'transfer')),
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
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 5. RITUAIS E EVENTOS
-- =====================================================

-- Rituais e cultos
CREATE TABLE cults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  
  -- Agendamento
  date date NOT NULL,
  time time NOT NULL,
  duration_minutes integer DEFAULT 120,
  
  -- Tipo e categoria
  type text NOT NULL DEFAULT 'regular' CHECK (type IN ('regular', 'development', 'special', 'initiation', 'private')),
  category text,
  
  -- Participação
  max_participants integer,
  current_participants integer DEFAULT 0,
  requires_registration boolean DEFAULT false,
  registration_fee decimal(10,2) DEFAULT 0,
  
  -- Status
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  published boolean DEFAULT true,
  
  -- Local e responsável
  location text DEFAULT 'Templo de Kimbanda Dragão Negro',
  responsible_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  
  requirements text,
  notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Participantes dos rituais
CREATE TABLE cult_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cult_id uuid REFERENCES cults(id) ON DELETE CASCADE,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  registered_at timestamptz DEFAULT now(),
  attended boolean DEFAULT false,
  notes text,
  UNIQUE(cult_id, member_id)
);

-- =====================================================
-- 6. E-COMMERCE
-- =====================================================

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

-- Produtos
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  short_description text,
  
  -- Preços
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  compare_price decimal(10,2),
  cost_price decimal(10,2),
  
  -- Estoque
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  min_stock integer DEFAULT 0,
  track_stock boolean DEFAULT true,
  
  -- Categoria e tags
  category_id uuid REFERENCES product_categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  
  -- Mídia
  images text[] DEFAULT '{}',
  featured_image text,
  
  -- Status
  active boolean DEFAULT true,
  featured boolean DEFAULT false,
  
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
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled')),
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

-- =====================================================
-- 7. SISTEMA DE MENSAGENS
-- =====================================================

-- Templates de mensagem
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
  retry_count integer DEFAULT 0,
  
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 8. BLOG E CONTEÚDO
-- =====================================================

-- Posts do blog
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

-- =====================================================
-- 9. CONFIGURAÇÕES E SISTEMA
-- =====================================================

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

-- Logs do sistema
CREATE TABLE system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level text NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'fatal')),
  message text NOT NULL,
  context jsonb DEFAULT '{}',
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 10. FUNÇÕES AUXILIARES (SEM RLS AINDA)
-- =====================================================

-- Verificar se usuário tem permissão
CREATE OR REPLACE FUNCTION has_permission(p_module text, p_action text)
RETURNS boolean AS $$
DECLARE
  user_role_id uuid;
BEGIN
  -- Buscar role do usuário atual
  SELECT role_id INTO user_role_id
  FROM profiles 
  WHERE id = auth.uid() AND is_active = true;
  
  IF user_role_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se tem permissão
  RETURN EXISTS (
    SELECT 1 
    FROM permissions p
    JOIN modules m ON m.id = p.module_id
    JOIN actions a ON a.id = p.action_id
    WHERE p.role_id = user_role_id
    AND m.name = p_module
    AND a.name = p_action
    AND p.granted = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se é super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() 
    AND r.name = 'super_admin'
    AND p.is_active = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() 
    AND r.name IN ('super_admin', 'admin')
    AND p.is_active = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se é membro
CREATE OR REPLACE FUNCTION is_member()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON r.id = p.role_id
    WHERE p.id = auth.uid() 
    AND r.name = 'member'
    AND p.is_active = true
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar existência de tabela (para diagnósticos)
CREATE OR REPLACE FUNCTION check_table_exists(p_table_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = p_table_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 11. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role_id ON profiles(role_id);
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

-- Availability
CREATE INDEX idx_availability_date ON availability(date);
CREATE INDEX idx_availability_available ON availability(is_available);

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

-- System Logs
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);

-- =====================================================
-- 12. SEEDS OBRIGATÓRIOS
-- =====================================================

-- Módulos do sistema
INSERT INTO modules (name, display_name, description, icon, sort_order) VALUES
  ('dashboard', 'Dashboard', 'Painel principal com métricas', 'BarChart3', 1),
  ('members', 'Membros', 'Gestão de membros e CRM', 'Users', 2),
  ('consultations', 'Consultas', 'Agendamentos e consultas com Exú', 'Heart', 3),
  ('cults', 'Rituais', 'Rituais e eventos do templo', 'Calendar', 4),
  ('products', 'Produtos', 'Catálogo de produtos', 'Package', 5),
  ('orders', 'Pedidos', 'Gestão de pedidos da loja', 'ShoppingCart', 6),
  ('messages', 'Mensagens', 'Sistema de mensagens', 'MessageSquare', 7),
  ('blog', 'Blog', 'Gestão do blog', 'BookOpen', 8),
  ('settings', 'Configurações', 'Configurações do sistema', 'Settings', 9),
  ('roles', 'Cargos', 'Gestão de cargos e permissões', 'Shield', 10);

-- Ações possíveis
INSERT INTO actions (name, display_name, description) VALUES
  ('view', 'Visualizar', 'Visualizar dados'),
  ('create', 'Criar', 'Criar novos registros'),
  ('edit', 'Editar', 'Editar registros existentes'),
  ('delete', 'Excluir', 'Excluir registros'),
  ('manage', 'Gerenciar', 'Acesso completo ao módulo');

-- Cargos padrão
INSERT INTO roles (name, display_name, description, level, is_system) VALUES
  ('super_admin', 'Super Administrador', 'Acesso total ao sistema', 100, true),
  ('admin', 'Administrador', 'Gerenciamento completo do templo', 80, true),
  ('operator', 'Operador', 'Operações do dia a dia', 60, true),
  ('attendant', 'Atendente', 'Atendimento básico', 40, true),
  ('member', 'Membro', 'Membro do templo', 20, true),
  ('visitor', 'Visitante', 'Visitante do site', 10, true);

-- Permissões para Super Admin (acesso total)
INSERT INTO permissions (role_id, module_id, action_id, granted)
SELECT 
  r.id as role_id,
  m.id as module_id,
  a.id as action_id,
  true as granted
FROM roles r
CROSS JOIN modules m
CROSS JOIN actions a
WHERE r.name = 'super_admin';

-- Permissões para Admin (quase total, exceto roles)
INSERT INTO permissions (role_id, module_id, action_id, granted)
SELECT 
  r.id as role_id,
  m.id as module_id,
  a.id as action_id,
  true as granted
FROM roles r
CROSS JOIN modules m
CROSS JOIN actions a
WHERE r.name = 'admin'
AND m.name != 'roles';

-- Configurações básicas do sistema
INSERT INTO system_settings (key, value, type, category, description, is_public) VALUES
  ('site_name', '"Templo de Kimbanda Dragão Negro"', 'string', 'general', 'Nome do site', true),
  ('contact_email', '"contato@dragaonegro.com.br"', 'string', 'contact', 'Email de contato', true),
  ('contact_phone', '"(11) 99999-9999"', 'string', 'contact', 'Telefone de contato', true),
  ('whatsapp_number', '"5511999999999"', 'string', 'contact', 'Número do WhatsApp', true),
  ('consultation_price', '120.00', 'number', 'business', 'Preço da consulta', true),
  ('consultation_duration', '30', 'number', 'business', 'Duração da consulta em minutos', false),
  ('pagseguro_sandbox', 'true', 'boolean', 'payments', 'Modo sandbox do PagSeguro', false),
  ('allow_registrations', 'true', 'boolean', 'auth', 'Permitir novos cadastros', false);

-- Categorias de produtos básicas
INSERT INTO product_categories (name, slug, description, sort_order) VALUES
  ('Velas', 'velas', 'Velas para rituais e trabalhos espirituais', 1),
  ('Incensos', 'incensos', 'Incensos naturais para limpeza e proteção', 2),
  ('Imagens', 'imagens', 'Imagens de Exús, Pombas Giras e Santos', 3),
  ('Elementos', 'elementos', 'Elementos ritualísticos diversos', 4),
  ('Cristais', 'cristais', 'Cristais e pedras energizadas', 5),
  ('Livros', 'livros', 'Livros sobre Kimbanda e espiritualidade', 6);

-- Produtos iniciais
INSERT INTO products (name, slug, description, price, category_id, stock, images, featured, spiritual_purpose) VALUES
  (
    'Kit Velas 7 Dias - Cores Diversas',
    'kit-velas-7-dias',
    'Kit completo com 7 velas coloridas para diferentes propósitos espirituais. Cada cor possui uma finalidade específica: branca (paz), vermelha (amor), verde (prosperidade), azul (proteção), amarela (sabedoria), roxa (espiritualidade), preta (quebra de demandas).',
    85.00,
    (SELECT id FROM product_categories WHERE slug = 'velas'),
    12,
    ARRAY['https://images.pexels.com/photos/1040893/pexels-photo-1040893.jpeg?auto=compress&cs=tinysrgb&w=400'],
    true,
    'Trabalhos espirituais diversos com cada cor representando uma energia específica'
  ),
  (
    'Incenso de Arruda - Pacote 20un',
    'incenso-arruda-20un',
    'Incenso natural de arruda para limpeza espiritual e proteção. A arruda é uma das plantas mais poderosas para afastar energias negativas e proteger ambientes.',
    25.00,
    (SELECT id FROM product_categories WHERE slug = 'incensos'),
    25,
    ARRAY['https://images.pexels.com/photos/4040635/pexels-photo-4040635.jpeg?auto=compress&cs=tinysrgb&w=400'],
    false,
    'Limpeza de ambientes e proteção contra energias negativas'
  ),
  (
    'Imagem Exú Tranca Rua - 20cm',
    'imagem-exu-tranca-rua-20cm',
    'Imagem em gesso de Exú Tranca Rua, o guardião dos caminhos. Peça artesanal pintada à mão com acabamento de qualidade.',
    120.00,
    (SELECT id FROM product_categories WHERE slug = 'imagens'),
    8,
    ARRAY['https://images.pexels.com/photos/8978562/pexels-photo-8978562.jpeg?auto=compress&cs=tinysrgb&w=400'],
    true,
    'Abertura de caminhos, proteção e força espiritual'
  );

-- Horários de disponibilidade (próximos 30 dias) - COM PROTEÇÃO CONTRA DUPLICATAS
INSERT INTO availability (date, time, is_available, duration_minutes)
SELECT 
  (CURRENT_DATE + INTERVAL '1 day' * generate_series(1, 30))::date as date,
  time_slot::time as time,
  true as is_available,
  30 as duration_minutes
FROM generate_series(1, 30) as day_offset
CROSS JOIN (
  VALUES ('14:00'), ('15:00'), ('16:00'), ('17:00')
) as times(time_slot)
WHERE EXTRACT(DOW FROM (CURRENT_DATE + INTERVAL '1 day' * day_offset)) NOT IN (0, 1) -- Não domingo nem segunda
ON CONFLICT (date, time) DO NOTHING;

-- Templates de mensagem
INSERT INTO message_templates (name, type, subject, content, variables) VALUES
  (
    'consulta_confirmacao',
    'whatsapp',
    NULL,
    'Olá {{nome}}! Sua consulta foi confirmada para {{data}} às {{hora}}. Local: Templo de Kimbanda Dragão Negro. Até breve! 🙏',
    ARRAY['nome', 'data', 'hora']
  ),
  (
    'consulta_lembrete_24h',
    'whatsapp',
    NULL,
    'Olá {{nome}}! Lembrete: sua consulta está agendada para amanhã ({{data}}) às {{hora}}. Te esperamos! 🙏',
    ARRAY['nome', 'data', 'hora']
  ),
  (
    'consulta_lembrete_2h',
    'whatsapp',
    NULL,
    'Olá {{nome}}! Sua consulta é hoje às {{hora}}. Estamos te esperando no Templo! 🙏',
    ARRAY['nome', 'hora']
  ),
  (
    'pedido_confirmacao',
    'email',
    'Pedido Confirmado - Templo Dragão Negro',
    'Olá {{nome}}, seu pedido #{{numero}} foi confirmado e está sendo preparado. Total: R$ {{total}}. Obrigado!',
    ARRAY['nome', 'numero', 'total']
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
  ),
  (
    'Posso participar dos rituais?',
    'Sim! Nossos rituais são abertos ao público. Recomendamos confirmar presença antecipadamente devido ao limite de vagas.',
    'rituais',
    3
  ),
  (
    'Vocês fazem trabalhos específicos?',
    'Sim, realizamos trabalhos para diversas finalidades: amor, proteção, abertura de caminhos, saúde e prosperidade.',
    'trabalhos',
    4
  );

-- Posts do blog
INSERT INTO blog_posts (title, slug, excerpt, content, status, published_at, tags, category, author_id) VALUES
  (
    'A Importância dos Passes na Kimbanda',
    'importancia-passes-kimbanda',
    'Entenda como os passes espirituais podem transformar sua vida e proteger sua energia.',
    'Os passes são uma das práticas mais importantes na Kimbanda. Através da imposição das mãos e da canalização da energia dos Exús, conseguimos limpar, energizar e proteger as pessoas que buscam nossa ajuda.

A prática dos passes na Kimbanda tem origem nas tradições africanas e indígenas, onde o toque e a imposição das mãos eram utilizados para cura e proteção espiritual. No contexto da Kimbanda, os passes são realizados com a força e energia dos Exús, entidades poderosas que atuam como intermediários entre o mundo material e espiritual.

Durante uma sessão de passes, o médium canaliza a energia do Exú e a transmite através das mãos, promovendo limpeza energética, alívio de dores físicas e emocionais, e fortalecimento da aura. É um momento de conexão profunda com o sagrado e de renovação das energias vitais.',
    'published',
    now(),
    ARRAY['passes', 'kimbanda', 'espiritualidade', 'cura'],
    'Ensinamentos',
    NULL
  );

-- Rituais iniciais
INSERT INTO cults (title, description, date, time, type, max_participants, requirements, published) VALUES
  (
    'Culto Regular de Kimbanda',
    'Culto semanal com trabalhos espirituais, consultas com Exús e passes de limpeza. Momento de conexão com as entidades e fortalecimento espiritual da comunidade.',
    CURRENT_DATE + INTERVAL '3 days',
    '20:00',
    'regular',
    50,
    'Roupas brancas ou pretas, respeito e fé',
    true
  ),
  (
    'Desenvolvimento Mediúnico',
    'Sessão especial para desenvolvimento das faculdades mediúnicas. Trabalho focado no crescimento espiritual e conexão com os Exús.',
    CURRENT_DATE + INTERVAL '5 days',
    '19:00',
    'development',
    20,
    'Roupas brancas obrigatórias, apenas para médiuns em desenvolvimento',
    true
  );

-- Membro de exemplo
INSERT INTO members (name, email, phone, origin, tags, consents, status) VALUES
  (
    'Maria Silva Santos',
    'maria.santos@email.com',
    '(11) 98765-4321',
    'site',
    ARRAY['consulta', 'ativa', 'frequente'],
    '{"marketing": true, "data_processing": true, "whatsapp": true, "email": true}',
    'active'
  );

-- =====================================================
-- 13. CONCEDER PERMISSÕES BÁSICAS (SEM RLS AINDA)
-- =====================================================

-- Garantir que anon e authenticated podem acessar as funções
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- 14. VERIFICAÇÃO FINAL
-- =====================================================

DO $$
DECLARE
  table_count integer;
  role_count integer;
  super_admin_id uuid;
  function_count integer;
  seed_count integer;
BEGIN
  -- Contar tabelas criadas
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public';
  
  -- Contar roles
  SELECT COUNT(*) INTO role_count FROM roles;
  
  -- Verificar se super_admin existe
  SELECT id INTO super_admin_id FROM roles WHERE name = 'super_admin';
  
  -- Contar funções auxiliares
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'
  AND p.proname IN ('has_permission', 'is_super_admin', 'is_admin', 'is_member', 'check_table_exists');
  
  -- Contar seeds
  SELECT 
    (SELECT COUNT(*) FROM roles) +
    (SELECT COUNT(*) FROM modules) +
    (SELECT COUNT(*) FROM actions) +
    (SELECT COUNT(*) FROM system_settings) +
    (SELECT COUNT(*) FROM product_categories) +
    (SELECT COUNT(*) FROM products) +
    (SELECT COUNT(*) FROM availability) +
    (SELECT COUNT(*) FROM message_templates) +
    (SELECT COUNT(*) FROM faqs) +
    (SELECT COUNT(*) FROM blog_posts) +
    (SELECT COUNT(*) FROM cults) +
    (SELECT COUNT(*) FROM members)
  INTO seed_count;
  
  RAISE NOTICE '';
  RAISE NOTICE '🏛️ TEMPLO DE KIMBANDA DRAGÃO NEGRO - SETUP COMPLETO';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✅ Tabelas criadas: %', table_count;
  RAISE NOTICE '✅ Roles criados: %', role_count;
  RAISE NOTICE '✅ Super Admin ID: %', super_admin_id;
  RAISE NOTICE '✅ Funções auxiliares: %', function_count;
  RAISE NOTICE '✅ Registros seed: %', seed_count;
  
  IF table_count >= 15 AND role_count >= 6 AND super_admin_id IS NOT NULL AND function_count = 5 AND seed_count > 50 THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SETUP COMPLETO EXECUTADO COM SUCESSO!';
    RAISE NOTICE '📊 Sistema pronto para aplicar RLS';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRÓXIMOS PASSOS:';
    RAISE NOTICE '   1. Execute o script 02_apply_rls_dragao_negro.sql';
    RAISE NOTICE '   2. Configure Auth no Supabase (Allow signup = ON, Confirm email = OFF)';
    RAISE NOTICE '   3. Teste /setup-admin para criar Super Admin';
    RAISE NOTICE '   4. Login: tata@dragaonegro.com.br | Senha: Qwe123@2025';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  ATENÇÃO: Alguns problemas detectados!';
    RAISE NOTICE '   Verifique os logs acima e execute novamente se necessário.';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '⚡ ESTRUTURA COMPLETA CRIADA - PRONTO PARA RLS!';
  RAISE NOTICE '====================================================';
END $$;

-- =====================================================
-- 15. MENSAGEM DE SUCESSO
-- =====================================================

SELECT 'SETUP COMPLETO EXECUTADO - ESTRUTURA CRIADA COM SUCESSO!' as result;