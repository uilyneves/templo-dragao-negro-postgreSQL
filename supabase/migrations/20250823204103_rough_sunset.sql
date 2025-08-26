/*
  # FORÇAR ATIVAÇÃO DE RLS - Templo de Kimbanda Dragão Negro
  
  Este script força a ativação do RLS em todas as tabelas
  e corrige as permissões para funcionar corretamente.
  
  INSTRUÇÕES:
  1. Acesse seu projeto no Supabase
  2. Vá em "SQL Editor"
  3. Clique em "New Query"
  4. Cole este script completo
  5. Clique em "Run"
*/

-- =====================================================
-- 1. FORÇAR ATIVAÇÃO DE RLS EM TODAS AS TABELAS
-- =====================================================

DO $$
DECLARE
  table_name text;
  table_exists boolean;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔐 FORÇANDO ATIVAÇÃO DE RLS...';
  RAISE NOTICE '================================';
  
  -- Lista de todas as tabelas que devem ter RLS
  FOR table_name IN VALUES 
    ('profiles'), ('members'), ('consultations'), ('cults'), 
    ('product_categories'), ('products'), ('orders'), ('order_items'),
    ('messages'), ('message_templates'), ('form_submissions'), 
    ('blog_posts'), ('system_settings'), ('faqs'), ('donations')
  LOOP
    -- Verificar se a tabela existe
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = table_name
    ) INTO table_exists;
    
    IF table_exists THEN
      -- Forçar ativação do RLS
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
      RAISE NOTICE '✅ RLS ATIVADO: %', table_name;
    ELSE
      RAISE NOTICE '❌ TABELA NÃO EXISTE: %', table_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 RLS FORÇADO EM TODAS AS TABELAS!';
  RAISE NOTICE '================================';
END $$;

-- =====================================================
-- 2. VERIFICAR STATUS FINAL DO RLS
-- =====================================================

DO $$
DECLARE
  table_name text;
  rls_enabled boolean;
  total_tables integer := 0;
  rls_active_count integer := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📊 VERIFICAÇÃO FINAL DE RLS:';
  RAISE NOTICE '============================';
  
  FOR table_name IN VALUES 
    ('profiles'), ('members'), ('consultations'), ('cults'), 
    ('product_categories'), ('products'), ('orders'), ('order_items'),
    ('messages'), ('message_templates'), ('form_submissions'), 
    ('blog_posts'), ('system_settings'), ('faqs'), ('donations')
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
  
  RAISE NOTICE '';
  RAISE NOTICE '📈 RESUMO:';
  RAISE NOTICE '   • Total de tabelas: %', total_tables;
  RAISE NOTICE '   • RLS ativo em: % tabelas', rls_active_count;
  
  IF rls_active_count = total_tables THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SUCESSO TOTAL!';
    RAISE NOTICE '✅ RLS está ATIVO em todas as % tabelas!', total_tables;
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  ATENÇÃO: % tabelas ainda sem RLS!', (total_tables - rls_active_count);
  END IF;
END $$;

-- =====================================================
-- 3. CRIAR POLÍTICAS BÁSICAS PARA FUNCIONAMENTO
-- =====================================================

-- Remover políticas conflitantes primeiro
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authentication users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on email" ON profiles;

-- Políticas básicas para profiles (necessário para auth)
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_auth" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas básicas para outras tabelas críticas
CREATE POLICY "members_select_all" ON members FOR SELECT USING (true);
CREATE POLICY "members_insert_all" ON members FOR INSERT WITH CHECK (true);

CREATE POLICY "consultations_select_all" ON consultations FOR SELECT USING (true);
CREATE POLICY "consultations_insert_all" ON consultations FOR INSERT WITH CHECK (true);

CREATE POLICY "products_select_all" ON products FOR SELECT USING (true);
CREATE POLICY "system_settings_select_all" ON system_settings FOR SELECT USING (true);

-- =====================================================
-- 4. CONCEDER PERMISSÕES NECESSÁRIAS
-- =====================================================

-- Garantir que anon e authenticated podem acessar as tabelas
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT ON profiles, members, consultations, form_submissions TO anon, authenticated;
GRANT UPDATE ON profiles, members, consultations TO authenticated;

-- =====================================================
-- 5. MENSAGEM FINAL
-- =====================================================

SELECT 'RLS FORÇADO E POLÍTICAS CRIADAS - TESTE NOVAMENTE!' as result;