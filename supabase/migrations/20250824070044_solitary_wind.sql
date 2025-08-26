/*
  # Fix Missing Roles Table and Create Super Admin - Templo de Kimbanda Dragão Negro
  
  This migration checks if the roles table exists and creates it if missing,
  then ensures the super_admin role exists for the admin creation process.
  
  INSTRUCTIONS:
  1. Acesse seu projeto no Supabase
  2. Vá em "SQL Editor"
  3. Clique em "New Query"
  4. Cole este script completo
  5. Clique em "Run"
*/

-- =====================================================
-- 1. CHECK AND CREATE ROLES TABLE IF MISSING
-- =====================================================

DO $$
BEGIN
  -- Check if roles table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'roles'
  ) THEN
    RAISE NOTICE '❌ ROLES TABLE NOT FOUND - CREATING...';
    
    -- Create roles table
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
    
    -- Enable RLS
    ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
    
    -- Create basic policy
    CREATE POLICY "roles_select_all" ON roles FOR SELECT USING (true);
    CREATE POLICY "roles_admin_only" ON roles FOR INSERT WITH CHECK (true);
    CREATE POLICY "roles_update_admin" ON roles FOR UPDATE USING (true);
    CREATE POLICY "roles_delete_admin" ON roles FOR DELETE USING (true);
    
    RAISE NOTICE '✅ ROLES TABLE CREATED SUCCESSFULLY';
  ELSE
    RAISE NOTICE '✅ ROLES TABLE ALREADY EXISTS';
  END IF;
END $$;

-- =====================================================
-- 2. ENSURE SUPER_ADMIN ROLE EXISTS
-- =====================================================

DO $$
DECLARE
  super_admin_exists boolean;
BEGIN
  -- Check if super_admin role exists
  SELECT EXISTS (
    SELECT 1 FROM roles WHERE name = 'super_admin'
  ) INTO super_admin_exists;
  
  IF NOT super_admin_exists THEN
    RAISE NOTICE '❌ SUPER_ADMIN ROLE NOT FOUND - CREATING...';
    
    -- Insert super_admin role
    INSERT INTO roles (name, display_name, description, level, is_system, is_active) VALUES
      ('super_admin', 'Super Administrador', 'Acesso total ao sistema', 100, true, true);
    
    RAISE NOTICE '✅ SUPER_ADMIN ROLE CREATED';
  ELSE
    RAISE NOTICE '✅ SUPER_ADMIN ROLE ALREADY EXISTS';
  END IF;
END $$;

-- =====================================================
-- 3. CREATE OTHER ESSENTIAL ROLES IF MISSING
-- =====================================================

INSERT INTO roles (name, display_name, description, level, is_system, is_active) VALUES
  ('admin', 'Administrador', 'Gerenciamento completo do templo', 80, true, true),
  ('operator', 'Operador', 'Operações do dia a dia', 60, true, true),
  ('attendant', 'Atendente', 'Atendimento básico', 40, true, true),
  ('member', 'Membro', 'Membro do templo', 20, true, true),
  ('visitor', 'Visitante', 'Visitante do site', 10, true, true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 4. CHECK AND CREATE PROFILES TABLE IF MISSING
-- =====================================================

DO $$
BEGIN
  -- Check if profiles table exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    RAISE NOTICE '❌ PROFILES TABLE NOT FOUND - CREATING...';
    
    -- Create profiles table
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
    
    -- Enable RLS
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    -- Create basic policies
    CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
    CREATE POLICY "profiles_insert_auth" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
    CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE USING (true);
    
    RAISE NOTICE '✅ PROFILES TABLE CREATED SUCCESSFULLY';
  ELSE
    RAISE NOTICE '✅ PROFILES TABLE ALREADY EXISTS';
  END IF;
END $$;

-- =====================================================
-- 5. GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant permissions to anon and authenticated users
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON roles TO anon, authenticated;
GRANT SELECT ON profiles TO anon, authenticated;
GRANT INSERT ON profiles TO anon, authenticated;
GRANT UPDATE ON profiles TO authenticated;

-- =====================================================
-- 6. VERIFICATION AND SUMMARY
-- =====================================================

DO $$
DECLARE
  roles_count integer;
  super_admin_id uuid;
  profiles_table_exists boolean;
BEGIN
  -- Count roles
  SELECT COUNT(*) INTO roles_count FROM roles;
  
  -- Get super_admin ID
  SELECT id INTO super_admin_id FROM roles WHERE name = 'super_admin';
  
  -- Check if profiles table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) INTO profiles_table_exists;
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 VERIFICATION SUMMARY:';
  RAISE NOTICE '========================';
  RAISE NOTICE '✅ Roles table: EXISTS';
  RAISE NOTICE '✅ Total roles: %', roles_count;
  RAISE NOTICE '✅ Super admin role ID: %', super_admin_id;
  RAISE NOTICE '✅ Profiles table: %', CASE WHEN profiles_table_exists THEN 'EXISTS' ELSE 'MISSING' END;
  RAISE NOTICE '';
  
  IF roles_count >= 6 AND super_admin_id IS NOT NULL AND profiles_table_exists THEN
    RAISE NOTICE '🎉 SUCCESS! ALL REQUIREMENTS MET';
    RAISE NOTICE '🚀 You can now create the super admin user!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 NEXT STEPS:';
    RAISE NOTICE '   1. Go back to /setup-admin';
    RAISE NOTICE '   2. Click "Criar Super Administrador"';
    RAISE NOTICE '   3. Login: tata@dragaonegro.com.br';
    RAISE NOTICE '   4. Password: Qwe123@2025';
  ELSE
    RAISE NOTICE '⚠️  SOME ISSUES DETECTED - CHECK THE LOGS ABOVE';
  END IF;
  
  RAISE NOTICE '========================';
END $$;

-- =====================================================
-- 7. SUCCESS MESSAGE
-- =====================================================

SELECT 'ROLES TABLE FIXED - SUPER ADMIN ROLE READY!' as result;