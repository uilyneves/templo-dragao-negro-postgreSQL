/*
  # ADICIONAR TABELAS FALTANTES - Templo de Kimbanda Dragão Negro
  
  Este script adiciona apenas as tabelas que estão faltando,
  sem afetar as tabelas que já existem e funcionam.
  
  BASEADO NO DIAGNÓSTICO:
  - ❌ modules (0 registros)
  - ❌ actions (0 registros) 
  - ✅ roles (1 registros) - JÁ EXISTE
  - ❌ permissions (0 registros)
  - ❌ profiles (0 registros)
  - ✅ members (0 registros) - JÁ EXISTE
  - ✅ availability (120 registros) - JÁ EXISTE
  - ✅ consultations (0 registros) - JÁ EXISTE
  - ✅ cults (1 registros) - JÁ EXISTE
  - ❌ cult_participants (0 registros)
  - ✅ product_categories (3 registros) - JÁ EXISTE
  - ✅ products (1 registros) - JÁ EXISTE
  - ✅ orders (0 registros) - JÁ EXISTE
  - ✅ order_items (0 registros) - JÁ EXISTE
  - ✅ message_templates (0 registros) - JÁ EXISTE
  - ✅ messages (0 registros) - JÁ EXISTE
  - ✅ blog_posts (1 registros) - JÁ EXISTE
  - ✅ system_settings (4 registros) - JÁ EXISTE
  - ✅ faqs (1 registros) - JÁ EXISTE
  - ✅ form_submissions (0 registros) - JÁ EXISTE
  - ✅ donations (0 registros) - JÁ EXISTE
  - ❌ system_logs (0 registros)
  
  INSTRUÇÕES:
  1. Acesse seu projeto no Supabase
  2. Vá em "SQL Editor"
  3. Clique em "New Query"
  4. Cole este script completo
  5. Clique em "Run"
*/

-- =====================================================
-- 1. VERIFICAR E CRIAR TABELAS FALTANTES
-- =====================================================

-- MODULES (Sistema de Permissões)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'modules') THEN
    RAISE NOTICE '❌ CRIANDO TABELA: modules';
    
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
    
    ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ TABELA CRIADA: modules';
  ELSE
    RAISE NOTICE '✅ TABELA JÁ EXISTE: modules';
  END IF;
END $$;

-- ACTIONS (Sistema de Permissões)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'actions') THEN
    RAISE NOTICE '❌ CRIANDO TABELA: actions';
    
    CREATE TABLE actions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text UNIQUE NOT NULL,
      display_name text NOT NULL,
      description text,
      created_at timestamptz DEFAULT now()
    );
    
    ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ TABELA CRIADA: actions';
  ELSE
    RAISE NOTICE '✅ TABELA JÁ EXISTE: actions';
  END IF;
END $$;

-- PERMISSIONS (Sistema de Permissões)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'permissions') THEN
    RAISE NOTICE '❌ CRIANDO TABELA: permissions';
    
    CREATE TABLE permissions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      role_id uuid REFERENCES roles(id) ON DELETE CASCADE,
      module_id uuid REFERENCES modules(id) ON DELETE CASCADE,
      action_id uuid REFERENCES actions(id) ON DELETE CASCADE,
      granted boolean DEFAULT true,
      created_at timestamptz DEFAULT now(),
      UNIQUE(role_id, module_id, action_id)
    );
    
    ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ TABELA CRIADA: permissions';
  ELSE
    RAISE NOTICE '✅ TABELA JÁ EXISTE: permissions';
  END IF;
END $$;

-- PROFILES (Essencial para Auth)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE NOTICE '❌ CRIANDO TABELA: profiles';
    
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
    
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ TABELA CRIADA: profiles';
  ELSE
    RAISE NOTICE '✅ TABELA JÁ EXISTE: profiles';
  END IF;
END $$;

-- CULT_PARTICIPANTS (Participantes dos Rituais)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cult_participants') THEN
    RAISE NOTICE '❌ CRIANDO TABELA: cult_participants';
    
    CREATE TABLE cult_participants (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      cult_id uuid REFERENCES cults(id) ON DELETE CASCADE,
      member_id uuid REFERENCES members(id) ON DELETE CASCADE,
      registered_at timestamptz DEFAULT now(),
      attended boolean DEFAULT false,
      notes text,
      UNIQUE(cult_id, member_id)
    );
    
    ALTER TABLE cult_participants ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ TABELA CRIADA: cult_participants';
  ELSE
    RAISE NOTICE '✅ TABELA JÁ EXISTE: cult_participants';
  END IF;
END $$;

-- SYSTEM_LOGS (Logs do Sistema)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_logs') THEN
    RAISE NOTICE '❌ CRIANDO TABELA: system_logs';
    
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
    
    ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE '✅ TABELA CRIADA: system_logs';
  ELSE
    RAISE NOTICE '✅ TABELA JÁ EXISTE: system_logs';
  END IF;
END $$;

-- =====================================================
-- 2. GARANTIR QUE SUPER_ADMIN EXISTE NA TABELA ROLES
-- =====================================================

DO $$
DECLARE
  super_admin_exists boolean;
  super_admin_id uuid;
BEGIN
  -- Verificar se super_admin existe
  SELECT EXISTS (
    SELECT 1 FROM roles WHERE name = 'super_admin'
  ) INTO super_admin_exists;
  
  IF NOT super_admin_exists THEN
    RAISE NOTICE '❌ SUPER_ADMIN NÃO EXISTE - CRIANDO...';
    
    -- Inserir super_admin
    INSERT INTO roles (name, display_name, description, level, is_system, is_active) 
    VALUES ('super_admin', 'Super Administrador', 'Acesso total ao sistema', 100, true, true)
    ON CONFLICT (name) DO NOTHING;
    
    RAISE NOTICE '✅ SUPER_ADMIN CRIADO';
  ELSE
    RAISE NOTICE '✅ SUPER_ADMIN JÁ EXISTE';
  END IF;
  
  -- Buscar ID do super_admin
  SELECT id INTO super_admin_id FROM roles WHERE name = 'super_admin';
  RAISE NOTICE '🔑 SUPER_ADMIN ID: %', super_admin_id;
END $$;

-- =====================================================
-- 3. INSERIR DADOS OBRIGATÓRIOS NAS TABELAS VAZIAS
-- =====================================================

-- Módulos do sistema (se tabela modules foi criada)
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
  ('roles', 'Cargos', 'Gestão de cargos e permissões', 'Shield', 10)
ON CONFLICT (name) DO NOTHING;

-- Ações possíveis (se tabela actions foi criada)
INSERT INTO actions (name, display_name, description) VALUES
  ('view', 'Visualizar', 'Visualizar dados'),
  ('create', 'Criar', 'Criar novos registros'),
  ('edit', 'Editar', 'Editar registros existentes'),
  ('delete', 'Excluir', 'Excluir registros'),
  ('manage', 'Gerenciar', 'Acesso completo ao módulo')
ON CONFLICT (name) DO NOTHING;

-- Permissões para Super Admin (se tabela permissions foi criada)
INSERT INTO permissions (role_id, module_id, action_id, granted)
SELECT 
  r.id as role_id,
  m.id as module_id,
  a.id as action_id,
  true as granted
FROM roles r
CROSS JOIN modules m
CROSS JOIN actions a
WHERE r.name = 'super_admin'
ON CONFLICT (role_id, module_id, action_id) DO NOTHING;

-- =====================================================
-- 4. CRIAR FUNÇÕES AUXILIARES PARA RLS
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

-- =====================================================
-- 5. CRIAR POLÍTICAS RLS BÁSICAS PARA TABELAS NOVAS
-- =====================================================

-- MODULES - Super Admin apenas
CREATE POLICY "modules_super_admin_only" ON modules FOR ALL USING (is_super_admin());

-- ACTIONS - Super Admin apenas  
CREATE POLICY "actions_super_admin_only" ON actions FOR ALL USING (is_super_admin());

-- PERMISSIONS - Super Admin apenas
CREATE POLICY "permissions_super_admin_only" ON permissions FOR ALL USING (is_super_admin());

-- PROFILES - Próprio perfil ou admin
CREATE POLICY "profiles_select_own_or_admin" ON profiles FOR SELECT USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_insert_auth" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own_or_admin" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE USING (is_admin());

-- CULT_PARTICIPANTS - Próprias participações ou admin
CREATE POLICY "cult_participants_select_own_or_admin" ON cult_participants FOR SELECT USING (
  is_admin() OR 
  EXISTS (SELECT 1 FROM members WHERE id = cult_participants.member_id AND email = (SELECT email FROM profiles WHERE id = auth.uid()))
);
CREATE POLICY "cult_participants_insert_member" ON cult_participants FOR INSERT WITH CHECK (is_member() OR is_admin());
CREATE POLICY "cult_participants_update_admin" ON cult_participants FOR UPDATE USING (is_admin());
CREATE POLICY "cult_participants_delete_admin" ON cult_participants FOR DELETE USING (is_admin());

-- SYSTEM_LOGS - Admin apenas
CREATE POLICY "logs_admin_only" ON system_logs FOR ALL USING (is_admin());

-- =====================================================
-- 6. CONCEDER PERMISSÕES NECESSÁRIAS
-- =====================================================

-- Garantir que anon e authenticated podem acessar as funções
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT ON profiles, members, consultations, form_submissions, donations, cult_participants TO anon, authenticated;
GRANT UPDATE ON profiles, members, consultations TO authenticated;

-- =====================================================
-- 7. VERIFICAÇÃO FINAL
-- =====================================================

DO $$
DECLARE
  table_name text;
  table_exists boolean;
  record_count integer;
  total_tables integer := 0;
  existing_tables integer := 0;
  super_admin_id uuid;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🏛️ TEMPLO DE KIMBANDA DRAGÃO NEGRO - VERIFICAÇÃO FINAL';
  RAISE NOTICE '====================================================';
  
  -- Verificar todas as tabelas necessárias
  FOR table_name IN VALUES 
    ('modules'), ('actions'), ('roles'), ('permissions'), ('profiles'), 
    ('members'), ('availability'), ('consultations'), ('cults'), ('cult_participants'),
    ('product_categories'), ('products'), ('orders'), ('order_items'), 
    ('message_templates'), ('messages'), ('blog_posts'), ('system_settings'), 
    ('faqs'), ('form_submissions'), ('donations'), ('system_logs')
  LOOP
    total_tables := total_tables + 1;
    
    -- Verificar se a tabela existe
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = table_name
    ) INTO table_exists;
    
    IF table_exists THEN
      existing_tables := existing_tables + 1;
      
      -- Contar registros
      EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO record_count;
      
      RAISE NOTICE '✅ %: % registros', table_name, record_count;
    ELSE
      RAISE NOTICE '❌ %: NÃO EXISTE', table_name;
    END IF;
  END LOOP;
  
  -- Verificar se super_admin existe
  SELECT id INTO super_admin_id FROM roles WHERE name = 'super_admin';
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 RESUMO FINAL:';
  RAISE NOTICE '   • Tabelas existentes: %/%', existing_tables, total_tables;
  RAISE NOTICE '   • Super Admin ID: %', super_admin_id;
  
  IF existing_tables = total_tables AND super_admin_id IS NOT NULL THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SUCESSO TOTAL!';
    RAISE NOTICE '✅ Todas as % tabelas existem!', total_tables;
    RAISE NOTICE '✅ Super Admin configurado!';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 PRÓXIMOS PASSOS:';
    RAISE NOTICE '   1. Configure Auth no Supabase (Allow signup = ON, Confirm email = OFF)';
    RAISE NOTICE '   2. Teste /setup-admin (deve funcionar agora)';
    RAISE NOTICE '   3. Login: tata@dragaonegro.com.br | Senha: Qwe123@2025';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  ATENÇÃO: Ainda faltam % tabelas', (total_tables - existing_tables);
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '⚡ TABELAS FALTANTES ADICIONADAS!';
  RAISE NOTICE '====================================================';
END $$;

-- =====================================================
-- 8. MENSAGEM DE SUCESSO
-- =====================================================

SELECT 'TABELAS FALTANTES ADICIONADAS - SUPER_ADMIN PRONTO!' as result;