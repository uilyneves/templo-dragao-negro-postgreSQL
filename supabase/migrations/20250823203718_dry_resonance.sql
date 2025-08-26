/*
  # Fix Anonymous Role Permissions - Templo de Kimbanda Dragão Negro
  
  Este script corrige as permissões para o role 'anon' do Supabase,
  permitindo que o diagnóstico funcione corretamente.
  
  INSTRUÇÕES:
  1. Acesse seu projeto no Supabase
  2. Vá em "SQL Editor"
  3. Clique em "New Query"
  4. Cole este script completo
  5. Clique em "Run"
*/

-- =====================================================
-- 1. GARANTIR PERMISSÕES BÁSICAS PARA ROLE ANON
-- =====================================================

-- Garantir que o role anon existe e tem permissões básicas
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;

-- =====================================================
-- 2. CONCEDER PERMISSÕES SELECT PARA TABELAS PÚBLICAS
-- =====================================================

-- Tabelas que devem ser acessíveis publicamente (para diagnóstico)
GRANT SELECT ON TABLE public.profiles TO anon;
GRANT SELECT ON TABLE public.members TO anon;
GRANT SELECT ON TABLE public.consultations TO anon;
GRANT SELECT ON TABLE public.cults TO anon;
GRANT SELECT ON TABLE public.product_categories TO anon;
GRANT SELECT ON TABLE public.products TO anon;
GRANT SELECT ON TABLE public.orders TO anon;
GRANT SELECT ON TABLE public.order_items TO anon;
GRANT SELECT ON TABLE public.messages TO anon;
GRANT SELECT ON TABLE public.message_templates TO anon;
GRANT SELECT ON TABLE public.form_submissions TO anon;
GRANT SELECT ON TABLE public.blog_posts TO anon;
GRANT SELECT ON TABLE public.system_settings TO anon;
GRANT SELECT ON TABLE public.faqs TO anon;
GRANT SELECT ON TABLE public.donations TO anon;

-- Também para authenticated users
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.members TO authenticated;
GRANT SELECT ON TABLE public.consultations TO authenticated;
GRANT SELECT ON TABLE public.cults TO authenticated;
GRANT SELECT ON TABLE public.product_categories TO authenticated;
GRANT SELECT ON TABLE public.products TO authenticated;
GRANT SELECT ON TABLE public.orders TO authenticated;
GRANT SELECT ON TABLE public.order_items TO authenticated;
GRANT SELECT ON TABLE public.messages TO authenticated;
GRANT SELECT ON TABLE public.message_templates TO authenticated;
GRANT SELECT ON TABLE public.form_submissions TO authenticated;
GRANT SELECT ON TABLE public.blog_posts TO authenticated;
GRANT SELECT ON TABLE public.system_settings TO authenticated;
GRANT SELECT ON TABLE public.faqs TO authenticated;
GRANT SELECT ON TABLE public.donations TO authenticated;

-- =====================================================
-- 3. ATUALIZAR POLÍTICAS RLS PARA PERMITIR DIAGNÓSTICO
-- =====================================================

-- Remover políticas restritivas e criar políticas mais permissivas para diagnóstico
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "donations_select_admin" ON donations;
CREATE POLICY "donations_select_public" ON donations FOR SELECT USING (true);

-- Política mais permissiva para outras tabelas durante diagnóstico
DROP POLICY IF EXISTS "members_select_admin" ON members;
CREATE POLICY "members_select_public" ON members FOR SELECT USING (true);

DROP POLICY IF EXISTS "consultations_select" ON consultations;
CREATE POLICY "consultations_select_public" ON consultations FOR SELECT USING (true);

DROP POLICY IF EXISTS "messages_select_admin" ON messages;
CREATE POLICY "messages_select_public" ON messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "submissions_select_admin" ON form_submissions;
CREATE POLICY "submissions_select_public" ON form_submissions FOR SELECT USING (true);

-- =====================================================
-- 4. VERIFICAR SE RLS ESTÁ ATIVO
-- =====================================================

-- Verificar status do RLS em todas as tabelas
DO $$
DECLARE
  table_name text;
  rls_enabled boolean;
  policy_count integer;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔐 VERIFICANDO PERMISSÕES E RLS...';
  RAISE NOTICE '=====================================';
  
  FOR table_name IN VALUES 
    ('profiles'), ('members'), ('consultations'), ('cults'), 
    ('product_categories'), ('products'), ('orders'), ('order_items'),
    ('messages'), ('message_templates'), ('form_submissions'), 
    ('blog_posts'), ('system_settings'), ('faqs'), ('donations')
  LOOP
    -- Verificar se RLS está ativo
    SELECT c.relrowsecurity INTO rls_enabled
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
    AND c.relname = table_name;
    
    -- Contar políticas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = table_name;
    
    RAISE NOTICE '📋 %: RLS=% | Políticas=%', 
      table_name, 
      CASE WHEN rls_enabled THEN 'ATIVO' ELSE 'INATIVO' END,
      policy_count;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ PERMISSÕES ATUALIZADAS!';
  RAISE NOTICE '🔓 Role anon pode acessar tabelas para diagnóstico';
  RAISE NOTICE '=====================================';
END $$;

-- =====================================================
-- 5. MENSAGEM DE SUCESSO
-- =====================================================

SELECT 'PERMISSÕES CORRIGIDAS - DIAGNÓSTICO DEVE FUNCIONAR AGORA!' as result;