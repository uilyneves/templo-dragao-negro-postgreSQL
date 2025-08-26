/*
  # SETUP COMPLETO - TEMPLO DE KIMBANDA DRAGÃO NEGRO
  
  Este script cria toda a estrutura necessária do zero,
  incluindo a tabela roles com super_admin.
  
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
-- 2. CRIAR TABELA ROLES PRIMEIRO (OBRIGATÓRIO)
-- =====================================================

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

-- Inserir roles IMEDIATAMENTE
INSERT INTO roles (name, display_name, description, level, is_system) VALUES
  ('super_admin', 'Super Administrador', 'Acesso total ao sistema', 100, true),
  ('admin', 'Administrador', 'Gerenciamento completo do templo', 80, true),
  ('operator', 'Operador', 'Operações do dia a dia', 60, true),
  ('attendant', 'Atendente', 'Atendimento básico', 40, true),
  ('member', 'Membro', 'Membro do templo', 20, true),
  ('visitor', 'Visitante', 'Visitante do site', 10, true);

-- =====================================================
-- 3. CRIAR TABELA PROFILES (OBRIGATÓRIO PARA AUTH)
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
-- 4. CRIAR DEMAIS TABELAS ESSENCIAIS
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

-- =====================================================
-- 5. FUNÇÕES AUXILIARES (SEM RLS AINDA)
-- =====================================================

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
-- 6. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role_id ON profiles(role_id);
CREATE INDEX idx_profiles_active ON profiles(is_active);

-- Members
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_origin ON members(origin);

-- Consultations
CREATE INDEX idx_consultations_date_time ON consultations(date, time);
CREATE INDEX idx_consultations_member_id ON consultations(member_id);
CREATE INDEX idx_consultations_status ON consultations(status);

-- Availability
CREATE INDEX idx_availability_date ON availability(date);
CREATE INDEX idx_availability_available ON availability(is_available);

-- Products
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(active);

-- =====================================================
-- 7. SEEDS OBRIGATÓRIOS
-- =====================================================

-- Configurações básicas do sistema
INSERT INTO system_settings (key, value, type, category, description, is_public) VALUES
  ('site_name', '"Templo de Kimbanda Dragão Negro"', 'string', 'general', 'Nome do site', true),
  ('contact_email', '"contato@dragaonegro.com.br"', 'string', 'contact', 'Email de contato', true),
  ('contact_phone', '"(11) 99999-9999"', 'string', 'contact', 'Telefone de contato', true),
  ('consultation_price', '120.00', 'number', 'business', 'Preço da consulta', true);

-- Categorias de produtos básicas
INSERT INTO product_categories (name, slug, description, sort_order) VALUES
  ('Velas', 'velas', 'Velas para rituais e trabalhos espirituais', 1),
  ('Incensos', 'incensos', 'Incensos naturais para limpeza e proteção', 2),
  ('Imagens', 'imagens', 'Imagens de Exús, Pombas Giras e Santos', 3);

-- Produtos iniciais
INSERT INTO products (name, slug, description, price, category_id, stock, images, featured, spiritual_purpose) VALUES
  (
    'Kit Velas 7 Dias - Cores Diversas',
    'kit-velas-7-dias',
    'Kit completo com 7 velas coloridas para diferentes propósitos espirituais.',
    85.00,
    (SELECT id FROM product_categories WHERE slug = 'velas'),
    12,
    ARRAY['https://images.pexels.com/photos/1040893/pexels-photo-1040893.jpeg?auto=compress&cs=tinysrgb&w=400'],
    true,
    'Trabalhos espirituais diversos'
  );

-- Horários de disponibilidade (próximos 30 dias) - SEM DUPLICATAS
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
  );

-- FAQ inicial
INSERT INTO faqs (question, answer, category, sort_order) VALUES
  (
    'Como agendar uma consulta?',
    'Você pode agendar através do nosso site, WhatsApp (11) 99999-9999 ou telefone. O pagamento é feito antecipadamente para confirmar o horário.',
    'consultas',
    1
  );

-- Posts do blog
INSERT INTO blog_posts (title, slug, excerpt, content, status, published_at, tags, category, author_id) VALUES
  (
    'A Importância dos Passes na Kimbanda',
    'importancia-passes-kimbanda',
    'Entenda como os passes espirituais podem transformar sua vida e proteger sua energia.',
    'Os passes são uma das práticas mais importantes na Kimbanda.',
    'published',
    now(),
    ARRAY['passes', 'kimbanda'],
    'Ensinamentos',
    NULL
  );

-- Rituais iniciais
INSERT INTO cults (title, description, date, time, type, max_participants, requirements, published) VALUES
  (
    'Culto Regular de Kimbanda',
    'Culto semanal com trabalhos espirituais, consultas com Exús e passes de limpeza.',
    CURRENT_DATE + INTERVAL '3 days',
    '20:00',
    'regular',
    50,
    'Roupas brancas ou pretas, respeito e fé',
    true
  );

-- Membro de exemplo
INSERT INTO members (name, email, phone, origin, tags, consents, status) VALUES
  (
    'Maria Silva Santos',
    'maria.santos@email.com',
    '(11) 98765-4321',
    'site',
    ARRAY['consulta', 'ativa'],
    '{"marketing": true, "data_processing": true, "whatsapp": true}',
    'active'
  );

-- =====================================================
-- 8. CONCEDER PERMISSÕES BÁSICAS (SEM RLS)
-- =====================================================

-- Garantir que anon e authenticated podem acessar
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT ON profiles, members, consultations, form_submissions, donations TO anon, authenticated;
GRANT UPDATE ON profiles, members, consultations TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- 9. VERIFICAÇÃO FINAL
-- =====================================================

DO $$
DECLARE
  table_count integer;
  role_count integer;
  super_admin_id uuid;
  function_count integer;
  availability_count integer;
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
  AND p.proname IN ('is_super_admin', 'is_admin', 'is_member', 'check_table_exists');
  
  -- Contar availability
  SELECT COUNT(*) INTO availability_count FROM availability;
  
  RAISE NOTICE '';
  RAISE NOTICE '🏛️ TEMPLO DE KIMBANDA DRAGÃO NEGRO - SETUP COMPLETO';
  RAISE NOTICE '====================================================';
  RAISE NOTICE '✅ Tabelas criadas: %', table_count;
  RAISE NOTICE '✅ Roles criados: %', role_count;
  RAISE NOTICE '✅ Super Admin ID: %', super_admin_id;
  RAISE NOTICE '✅ Funções auxiliares: %', function_count;
  RAISE NOTICE '✅ Horários disponíveis: %', availability_count;
  
  IF table_count >= 12 AND role_count >= 6 AND super_admin_id IS NOT NULL AND function_count >= 4 THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 ESTRUTURA CRIADA COM SUCESSO!';
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
    RAISE NOTICE '   Tabelas: % | Roles: % | Super Admin: % | Funções: %', table_count, role_count, super_admin_id, function_count;
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '⚡ ESTRUTURA COMPLETA CRIADA - PRONTO PARA RLS!';
  RAISE NOTICE '====================================================';
END $$;

-- =====================================================
-- 10. MENSAGEM DE SUCESSO
-- =====================================================

SELECT 'ESTRUTURA COMPLETA CRIADA - EXECUTE AGORA O SCRIPT DE RLS!' as result;