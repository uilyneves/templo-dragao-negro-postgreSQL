/*
  # RESET LIMPO - TEMPLO DE KIMBANDA DRAGÃO NEGRO
  
  Este script remove todas as políticas conflitantes e recria
  a estrutura completa do banco de dados.
  
  INSTRUÇÕES:
  1. Acesse seu projeto no Supabase
  2. Vá em "SQL Editor"
  3. Clique em "New Query"
  4. Cole este script completo
  5. Clique em "Run"
*/

-- =====================================================
-- 1. REMOVER TODAS AS POLÍTICAS CONFLITANTES
-- =====================================================

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🧹 REMOVENDO TODAS AS POLÍTICAS CONFLITANTES...';
  RAISE NOTICE '===============================================';
  
  -- Remover todas as políticas existentes
  FOR policy_record IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
      policy_record.policyname, 
      policy_record.schemaname, 
      policy_record.tablename
    );
  END LOOP;
  
  RAISE NOTICE '✅ TODAS AS POLÍTICAS REMOVIDAS!';
  RAISE NOTICE '===============================================';
END $$;

-- =====================================================
-- 2. VERIFICAR E CRIAR TABELAS ESSENCIAIS
-- =====================================================

-- ROLES (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roles') THEN
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
    RAISE NOTICE '✅ TABELA CRIADA: roles';
  ELSE
    RAISE NOTICE '✅ TABELA JÁ EXISTE: roles';
  END IF;
END $$;

-- PROFILES (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
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
    RAISE NOTICE '✅ TABELA CRIADA: profiles';
  ELSE
    RAISE NOTICE '✅ TABELA JÁ EXISTE: profiles';
  END IF;
END $$;

-- =====================================================
-- 3. GARANTIR QUE SUPER_ADMIN EXISTE
-- =====================================================

-- Inserir super_admin se não existir
INSERT INTO roles (name, display_name, description, level, is_system, is_active) VALUES
  ('super_admin', 'Super Administrador', 'Acesso total ao sistema', 100, true, true),
  ('admin', 'Administrador', 'Gerenciamento completo do templo', 80, true, true),
  ('member', 'Membro', 'Membro do templo', 20, true, true),
  ('visitor', 'Visitante', 'Visitante do site', 10, true, true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 4. ATIVAR RLS EM TABELAS ESSENCIAIS
-- =====================================================

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Ativar RLS em outras tabelas se existirem
DO $$
DECLARE
  tbl_name text;
BEGIN
  FOR tbl_name IN VALUES 
    ('members'), ('consultations'), ('availability'), ('products'), 
    ('orders'), ('messages'), ('blog_posts'), ('system_settings')
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl_name) THEN
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl_name);
      RAISE NOTICE '✅ RLS ATIVADO: %', tbl_name;
    END IF;
  END LOOP;
END $$;

-- =====================================================
-- 5. CRIAR FUNÇÕES AUXILIARES
-- =====================================================

-- Função para verificar se é admin
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

-- Função para verificar se é super admin
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

-- =====================================================
-- 6. CRIAR POLÍTICAS BÁSICAS (SEM CONFLITOS)
-- =====================================================

-- ROLES - Leitura pública, escrita admin
CREATE POLICY "roles_select_public" ON roles FOR SELECT USING (true);
CREATE POLICY "roles_insert_admin" ON roles FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "roles_update_admin" ON roles FOR UPDATE USING (is_admin());
CREATE POLICY "roles_delete_admin" ON roles FOR DELETE USING (is_admin());

-- PROFILES - Próprio perfil ou admin
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_auth" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own_or_admin" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE USING (is_admin());

-- Políticas para outras tabelas se existirem
DO $$
BEGIN
  -- MEMBERS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'members') THEN
    CREATE POLICY "members_select_public" ON members FOR SELECT USING (true);
    CREATE POLICY "members_insert_public" ON members FOR INSERT WITH CHECK (true);
    CREATE POLICY "members_update_admin" ON members FOR UPDATE USING (is_admin());
    CREATE POLICY "members_delete_admin" ON members FOR DELETE USING (is_admin());
  END IF;
  
  -- CONSULTATIONS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consultations') THEN
    CREATE POLICY "consultations_select_public" ON consultations FOR SELECT USING (true);
    CREATE POLICY "consultations_insert_public" ON consultations FOR INSERT WITH CHECK (true);
    CREATE POLICY "consultations_update_admin" ON consultations FOR UPDATE USING (is_admin());
    CREATE POLICY "consultations_delete_admin" ON consultations FOR DELETE USING (is_admin());
  END IF;
  
  -- PRODUCTS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    CREATE POLICY "products_select_public" ON products FOR SELECT USING (true);
    CREATE POLICY "products_insert_admin" ON products FOR INSERT WITH CHECK (is_admin());
    CREATE POLICY "products_update_admin" ON products FOR UPDATE USING (is_admin());
    CREATE POLICY "products_delete_admin" ON products FOR DELETE USING (is_admin());
  END IF;
  
  -- SYSTEM_SETTINGS
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_settings') THEN
    CREATE POLICY "settings_select_public" ON system_settings FOR SELECT USING (true);
    CREATE POLICY "settings_insert_admin" ON system_settings FOR INSERT WITH CHECK (is_admin());
    CREATE POLICY "settings_update_admin" ON system_settings FOR UPDATE USING (is_admin());
    CREATE POLICY "settings_delete_admin" ON system_settings FOR DELETE USING (is_admin());
  END IF;
END $$;

-- =====================================================
-- 7. CONCEDER PERMISSÕES NECESSÁRIAS
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT ON profiles, members, consultations TO anon, authenticated;
GRANT UPDATE ON profiles, members, consultations TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =====================================================
-- 8. VERIFICAÇÃO FINAL
-- =====================================================

DO $$
DECLARE
  super_admin_id uuid;
  profiles_exists boolean;
  policy_count integer;
BEGIN
  -- Verificar se super_admin existe
  SELECT id INTO super_admin_id FROM roles WHERE name = 'super_admin';
  
  -- Verificar se profiles existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles'
  ) INTO profiles_exists;
  
  -- Contar políticas
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
  
  RAISE NOTICE '';
  RAISE NOTICE '🏛️ TEMPLO DE KIMBANDA DRAGÃO NEGRO - STATUS FINAL';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '✅ Super Admin ID: %', super_admin_id;
  RAISE NOTICE '✅ Profiles table: %', CASE WHEN profiles_exists THEN 'EXISTS' ELSE 'MISSING' END;
  RAISE NOTICE '✅ Políticas criadas: %', policy_count;
  
  IF super_admin_id IS NOT NULL AND profiles_exists AND policy_count > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 TUDO PRONTO PARA CRIAR SUPER ADMIN!';
    RAISE NOTICE '🚀 Vá em /setup-admin e clique em "Criar Super Administrador"';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  Ainda há problemas - verifique os logs acima';
  END IF;
  
  RAISE NOTICE '=================================================';
END $$;

SELECT 'POLÍTICAS CONFLITANTES REMOVIDAS - ESTRUTURA LIMPA!' as result;