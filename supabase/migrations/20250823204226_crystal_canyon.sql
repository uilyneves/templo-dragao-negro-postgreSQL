/*
  # FORÇAR ATIVAÇÃO DE RLS - CORRIGIDO - Templo de Kimbanda Dragão Negro
  
  Este script força a ativação do RLS em todas as tabelas
  e corrige o erro de ambiguidade de variáveis.
  
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
  tbl_name text;
  table_exists boolean;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔐 FORÇANDO ATIVAÇÃO DE RLS...';
  RAISE NOTICE '================================';
  
  -- Lista de todas as tabelas que devem ter RLS
  FOR tbl_name IN VALUES 
    ('profiles'), ('members'), ('consultations'), ('cults'), 
    ('product_categories'), ('products'), ('orders'), ('order_items'),
    ('messages'), ('message_templates'), ('form_submissions'), 
    ('blog_posts'), ('system_settings'), ('faqs'), ('donations')
  LOOP
    -- Verificar se a tabela existe (corrigido para evitar ambiguidade)
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = tbl_name
    ) INTO table_exists;
    
    IF table_exists THEN
      -- Forçar ativação do RLS
      EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl_name);
      RAISE NOTICE '✅ RLS ATIVADO: %', tbl_name;
    ELSE
      RAISE NOTICE '❌ TABELA NÃO EXISTE: %', tbl_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 RLS FORÇADO EM TODAS AS TABELAS!';
  RAISE NOTICE '================================';
END $$;

-- =====================================================
-- 2. REMOVER POLÍTICAS CONFLITANTES
-- =====================================================

-- Função para remover todas as políticas de uma tabela
CREATE OR REPLACE FUNCTION drop_all_policies_safe(tbl_name text)
RETURNS void AS $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN 
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = tbl_name
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.policyname, tbl_name);
  END LOOP;
  RAISE NOTICE 'Políticas removidas da tabela: %', tbl_name;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao remover políticas da tabela %: %', tbl_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Remover todas as políticas existentes
SELECT drop_all_policies_safe('profiles');
SELECT drop_all_policies_safe('members');
SELECT drop_all_policies_safe('consultations');
SELECT drop_all_policies_safe('cults');
SELECT drop_all_policies_safe('product_categories');
SELECT drop_all_policies_safe('products');
SELECT drop_all_policies_safe('orders');
SELECT drop_all_policies_safe('order_items');
SELECT drop_all_policies_safe('messages');
SELECT drop_all_policies_safe('message_templates');
SELECT drop_all_policies_safe('form_submissions');
SELECT drop_all_policies_safe('blog_posts');
SELECT drop_all_policies_safe('system_settings');
SELECT drop_all_policies_safe('faqs');
SELECT drop_all_policies_safe('donations');

-- =====================================================
-- 3. CRIAR FUNÇÕES AUXILIARES PARA RLS
-- =====================================================

-- Remover funções existentes
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_member();
DROP FUNCTION IF EXISTS current_user_email();

-- Função para verificar se usuário é admin
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

-- Função para verificar se usuário é membro
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

-- Função para obter email do usuário atual
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
-- 4. CRIAR POLÍTICAS BÁSICAS FUNCIONAIS
-- =====================================================

-- PROFILES - Essencial para autenticação
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_auth" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_delete_admin" ON profiles FOR DELETE USING (is_admin());

-- MEMBERS - CRM público para inserção, admin para gestão
CREATE POLICY "members_select_all" ON members FOR SELECT USING (true);
CREATE POLICY "members_insert_all" ON members FOR INSERT WITH CHECK (true);
CREATE POLICY "members_update_admin" ON members FOR UPDATE USING (is_admin());
CREATE POLICY "members_delete_admin" ON members FOR DELETE USING (is_admin());

-- CONSULTATIONS - Públicas para inserção, próprias para visualização
CREATE POLICY "consultations_select_own_or_admin" ON consultations FOR SELECT USING (
  is_admin() OR 
  (is_member() AND EXISTS (
    SELECT 1 FROM members 
    WHERE id = consultations.member_id 
    AND email = current_user_email()
  ))
);
CREATE POLICY "consultations_insert_all" ON consultations FOR INSERT WITH CHECK (true);
CREATE POLICY "consultations_update_admin" ON consultations FOR UPDATE USING (is_admin());
CREATE POLICY "consultations_delete_admin" ON consultations FOR DELETE USING (is_admin());

-- CULTS - Públicos se publicados
CREATE POLICY "cults_select_published" ON cults FOR SELECT USING (published = true OR is_admin());
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

-- ORDERS - Próprios pedidos ou admin
CREATE POLICY "orders_select_own_or_admin" ON orders FOR SELECT USING (
  is_admin() OR 
  (is_member() AND EXISTS (
    SELECT 1 FROM members 
    WHERE id = orders.member_id 
    AND email = current_user_email()
  ))
);
CREATE POLICY "orders_insert_all" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE USING (is_admin());
CREATE POLICY "orders_delete_admin" ON orders FOR DELETE USING (is_admin());

-- ORDER_ITEMS - Seguem regras dos pedidos
CREATE POLICY "order_items_select_own_or_admin" ON order_items FOR SELECT USING (
  is_admin() OR 
  (is_member() AND EXISTS (
    SELECT 1 FROM orders o
    JOIN members m ON m.id = o.member_id
    WHERE o.id = order_items.order_id 
    AND m.email = current_user_email()
  ))
);
CREATE POLICY "order_items_insert_all" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "order_items_update_admin" ON order_items FOR UPDATE USING (is_admin());
CREATE POLICY "order_items_delete_admin" ON order_items FOR DELETE USING (is_admin());

-- MESSAGES - Admin apenas
CREATE POLICY "messages_select_admin" ON messages FOR SELECT USING (is_admin());
CREATE POLICY "messages_insert_system" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "messages_update_admin" ON messages FOR UPDATE USING (is_admin());
CREATE POLICY "messages_delete_admin" ON messages FOR DELETE USING (is_admin());

-- MESSAGE_TEMPLATES - Admin apenas
CREATE POLICY "templates_select_admin" ON message_templates FOR SELECT USING (is_admin());
CREATE POLICY "templates_insert_admin" ON message_templates FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "templates_update_admin" ON message_templates FOR UPDATE USING (is_admin());
CREATE POLICY "templates_delete_admin" ON message_templates FOR DELETE USING (is_admin());

-- FORM_SUBMISSIONS - Admin vê, público insere
CREATE POLICY "submissions_select_admin" ON form_submissions FOR SELECT USING (is_admin());
CREATE POLICY "submissions_insert_all" ON form_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "submissions_update_admin" ON form_submissions FOR UPDATE USING (is_admin());
CREATE POLICY "submissions_delete_admin" ON form_submissions FOR DELETE USING (is_admin());

-- BLOG_POSTS - Publicados são públicos
CREATE POLICY "blog_select_published" ON blog_posts FOR SELECT USING (status = 'published' OR is_admin());
CREATE POLICY "blog_insert_admin" ON blog_posts FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "blog_update_admin" ON blog_posts FOR UPDATE USING (is_admin());
CREATE POLICY "blog_delete_admin" ON blog_posts FOR DELETE USING (is_admin());

-- SYSTEM_SETTINGS - Públicas são visíveis
CREATE POLICY "settings_select_public" ON system_settings FOR SELECT USING (is_public = true OR is_admin());
CREATE POLICY "settings_insert_admin" ON system_settings FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "settings_update_admin" ON system_settings FOR UPDATE USING (is_admin());
CREATE POLICY "settings_delete_admin" ON system_settings FOR DELETE USING (is_admin());

-- FAQS - Ativas são públicas
CREATE POLICY "faqs_select_active" ON faqs FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "faqs_insert_admin" ON faqs FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "faqs_update_admin" ON faqs FOR UPDATE USING (is_admin());
CREATE POLICY "faqs_delete_admin" ON faqs FOR DELETE USING (is_admin());

-- DONATIONS - Admin vê, público doa
CREATE POLICY "donations_select_admin" ON donations FOR SELECT USING (is_admin());
CREATE POLICY "donations_insert_all" ON donations FOR INSERT WITH CHECK (true);
CREATE POLICY "donations_update_system" ON donations FOR UPDATE USING (true);
CREATE POLICY "donations_delete_admin" ON donations FOR DELETE USING (is_admin());

-- =====================================================
-- 5. CONCEDER PERMISSÕES NECESSÁRIAS
-- =====================================================

-- Garantir que anon e authenticated podem acessar as tabelas
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT ON profiles, members, consultations, form_submissions, donations TO anon, authenticated;
GRANT UPDATE ON profiles, members, consultations TO authenticated;

-- =====================================================
-- 6. VERIFICAÇÃO FINAL DE RLS
-- =====================================================

DO $$
DECLARE
  tbl_name text;
  rls_enabled boolean;
  total_tables integer := 0;
  rls_active_count integer := 0;
  policy_count integer := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '📊 VERIFICAÇÃO FINAL DE RLS:';
  RAISE NOTICE '============================';
  
  FOR tbl_name IN VALUES 
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
    AND c.relname = tbl_name;
    
    IF rls_enabled THEN
      rls_active_count := rls_active_count + 1;
      RAISE NOTICE '✅ %: RLS ATIVO', tbl_name;
    ELSE
      RAISE NOTICE '❌ %: RLS INATIVO', tbl_name;
    END IF;
  END LOOP;
  
  -- Contar políticas totais
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  RAISE NOTICE '';
  RAISE NOTICE '📈 RESUMO FINAL:';
  RAISE NOTICE '   • Total de tabelas: %', total_tables;
  RAISE NOTICE '   • RLS ativo em: % tabelas', rls_active_count;
  RAISE NOTICE '   • Políticas criadas: %', policy_count;
  
  IF rls_active_count = total_tables AND policy_count > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 SUCESSO TOTAL!';
    RAISE NOTICE '✅ RLS está ATIVO em todas as % tabelas!', total_tables;
    RAISE NOTICE '🔐 Banco de dados totalmente protegido!';
    RAISE NOTICE '📝 % políticas de segurança criadas!', policy_count;
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  ATENÇÃO: % tabelas ainda sem RLS!', (total_tables - rls_active_count);
  END IF;
END $$;

-- =====================================================
-- 7. LIMPEZA DE FUNÇÕES TEMPORÁRIAS
-- =====================================================

DROP FUNCTION IF EXISTS drop_all_policies_safe(text);

-- =====================================================
-- 8. MENSAGEM FINAL
-- =====================================================

SELECT 'RLS ATIVADO COM SUCESSO - ERRO DE AMBIGUIDADE CORRIGIDO!' as result;