/*
  # RESET TOTAL DO BANCO - Templo de Kimbanda Dragão Negro
  
  Este script apaga TUDO do banco de dados e deixa limpo para recomeçar.
  
  ⚠️ ATENÇÃO: Este script APAGA TODOS OS DADOS!
  
  INSTRUÇÕES:
  1. Acesse seu projeto no Supabase
  2. Vá em "SQL Editor"
  3. Clique em "New Query"
  4. Cole este script completo
  5. Clique em "Run"
*/

-- =====================================================
-- 1. APAGAR TUDO - RESET TOTAL
-- =====================================================

-- Apagar schema público completamente (remove tudo)
DROP SCHEMA IF EXISTS public CASCADE;

-- Recriar schema público vazio
CREATE SCHEMA public;

-- Recriar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Garantir permissões básicas
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- =====================================================
-- 2. VERIFICAÇÃO DE LIMPEZA
-- =====================================================

DO $$
DECLARE
  table_count integer;
  function_count integer;
  policy_count integer;
BEGIN
  -- Contar tabelas restantes
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public';
  
  -- Contar funções restantes
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public';
  
  -- Contar políticas restantes
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public';
  
  RAISE NOTICE '';
  RAISE NOTICE '🧹 RESET TOTAL EXECUTADO';
  RAISE NOTICE '========================';
  RAISE NOTICE '📊 Tabelas restantes: %', table_count;
  RAISE NOTICE '⚙️ Funções restantes: %', function_count;
  RAISE NOTICE '🔐 Políticas restantes: %', policy_count;
  
  IF table_count = 0 AND function_count = 0 AND policy_count = 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '✅ BANCO TOTALMENTE LIMPO!';
    RAISE NOTICE '🚀 Pronto para executar o script de setup completo';
  ELSE
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ Ainda há alguns objetos restantes (normal)';
  END IF;
  
  RAISE NOTICE '========================';
END $$;

-- =====================================================
-- 3. MENSAGEM DE SUCESSO
-- =====================================================

SELECT 'BANCO DE DADOS RESETADO COMPLETAMENTE - PRONTO PARA SETUP!' as result;