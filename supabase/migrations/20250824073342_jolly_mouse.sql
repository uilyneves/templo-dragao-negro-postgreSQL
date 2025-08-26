/*
  # SETUP MÍNIMO - TEMPLO DE KIMBANDA DRAGÃO NEGRO
  
  Script mínimo para criar apenas as tabelas essenciais
  para o funcionamento do sistema de criação de admin.
  
  INSTRUÇÕES:
  1. Acesse seu projeto no Supabase
  2. Vá em "SQL Editor"
  3. Clique em "New Query"
  4. Cole este script completo
  5. Clique em "Run"
*/

-- =====================================================
-- 1. VERIFICAR E CRIAR TABELA ROLES (OBRIGATÓRIO)
-- =====================================================

-- Criar tabela roles se não existir
CREATE TABLE IF NOT EXISTS roles (
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

-- Inserir super_admin FORÇADAMENTE
INSERT INTO roles (name, display_name, description, level, is_system, is_active) 
VALUES ('super_admin', 'Super Administrador', 'Acesso total ao sistema', 100, true, true)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  is_system = EXCLUDED.is_system,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Inserir outros roles essenciais
INSERT INTO roles (name, display_name, description, level, is_system, is_active) VALUES
  ('admin', 'Administrador', 'Gerenciamento completo do templo', 80, true, true),
  ('member', 'Membro', 'Membro do templo', 20, true, true),
  ('visitor', 'Visitante', 'Visitante do site', 10, true, true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. VERIFICAR E CRIAR TABELA PROFILES (OBRIGATÓRIO)
-- =====================================================

-- Criar tabela profiles se não existir
CREATE TABLE IF NOT EXISTS profiles (
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
-- 3. CRIAR TABELAS MÍNIMAS PARA FUNCIONAMENTO
-- =====================================================

-- Members (se não existir)
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  origin text NOT NULL DEFAULT 'site',
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked', 'pending')),
  tags text[] DEFAULT '{}',
  consents jsonb DEFAULT '{}',
  last_interaction timestamptz DEFAULT now(),
  total_consultations integer DEFAULT 0,
  total_spent decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 4. CONCEDER PERMISSÕES BÁSICAS (SEM RLS)
-- =====================================================

-- Garantir que anon e authenticated podem acessar
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON roles TO anon, authenticated;
GRANT SELECT ON profiles TO anon, authenticated;
GRANT INSERT ON profiles TO anon, authenticated;
GRANT UPDATE ON profiles TO authenticated;
GRANT SELECT ON members TO anon, authenticated;
GRANT INSERT ON members TO anon, authenticated;

-- =====================================================
-- 5. VERIFICAÇÃO FINAL
-- =====================================================

DO $$
DECLARE
  roles_count integer;
  super_admin_id uuid;
  profiles_exists boolean;
BEGIN
  -- Contar roles
  SELECT COUNT(*) INTO roles_count FROM roles;
  
  -- Buscar super_admin
  SELECT id INTO super_admin_id FROM roles WHERE name = 'super_admin';
  
  -- Verificar se profiles existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) INTO profiles_exists;
  
  RAISE NOTICE '';
  RAISE NOTICE '🏛️ SETUP MÍNIMO - TEMPLO DRAGÃO NEGRO';
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ Roles criados: %', roles_count;
  RAISE NOTICE '✅ Super Admin ID: %', super_admin_id;
  RAISE NOTICE '✅ Profiles table: %', CASE WHEN profiles_exists THEN 'EXISTS' ELSE 'MISSING' END;
  
  IF roles_count >= 4 AND super_admin_id IS NOT NULL AND profiles_exists THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SETUP MÍNIMO CONCLUÍDO!';
    RAISE NOTICE '🚀 Agora você pode criar o Super Admin!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 PRÓXIMOS PASSOS:';
    RAISE NOTICE '   1. Configure SUPABASE_SERVICE_ROLE_KEY no .env.local';
    RAISE NOTICE '   2. Reinicie o servidor (Ctrl+C e npm run dev)';
    RAISE NOTICE '   3. Vá em /setup-admin';
    RAISE NOTICE '   4. Clique "Criar Super Administrador"';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  AINDA HÁ PROBLEMAS:';
    RAISE NOTICE '   Roles: % | Super Admin: % | Profiles: %', roles_count, super_admin_id, profiles_exists;
  END IF;
  
  RAISE NOTICE '====================================';
END $$;

-- =====================================================
-- 6. MENSAGEM DE SUCESSO
-- =====================================================

SELECT 'SETUP MÍNIMO EXECUTADO - PRONTO PARA CRIAR ADMIN!' as result;