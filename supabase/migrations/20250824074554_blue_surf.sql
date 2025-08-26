/*
  # CRIAR SISTEMA DE ENTIDADES ESPIRITUAIS - Templo de Kimbanda Dragão Negro
  
  Este script cria as tabelas para gestão de entidades espirituais
  (Exús, Pombagiras, Caboclos, etc.) no sistema.
  
  INSTRUÇÕES:
  1. Acesse seu projeto no Supabase
  2. Vá em "SQL Editor"
  3. Clique em "New Query"
  4. Cole este script completo
  5. Clique em "Run"
*/

-- =====================================================
-- 1. CRIAR TABELAS DO SISTEMA DE ENTIDADES
-- =====================================================

-- Tipos de Entidades (Exús, Pombagiras, Caboclos, etc.)
CREATE TABLE IF NOT EXISTS entity_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#dc2626',
  icon text DEFAULT 'Zap',
  hierarchy_level integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Entidades Espirituais
CREATE TABLE IF NOT EXISTS entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  entity_type_id uuid REFERENCES entity_types(id) ON DELETE SET NULL,
  description text,
  attributes jsonb DEFAULT '{}',
  image_url text,
  day_of_week text,
  colors text[] DEFAULT '{}',
  offerings text[] DEFAULT '{}',
  characteristics text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. ATIVAR RLS NAS NOVAS TABELAS
-- =====================================================

ALTER TABLE entity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. CRIAR POLÍTICAS RLS PARA AS NOVAS TABELAS
-- =====================================================

-- Entity Types - Ativos são públicos, admin pode gerenciar
CREATE POLICY "entity_types_select_active" ON entity_types FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "entity_types_insert_admin" ON entity_types FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "entity_types_update_admin" ON entity_types FOR UPDATE USING (is_admin());
CREATE POLICY "entity_types_delete_admin" ON entity_types FOR DELETE USING (is_admin());

-- Entities - Ativas são públicas, admin pode gerenciar
CREATE POLICY "entities_select_active" ON entities FOR SELECT USING (is_active = true OR is_admin());
CREATE POLICY "entities_insert_admin" ON entities FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "entities_update_admin" ON entities FOR UPDATE USING (is_admin());
CREATE POLICY "entities_delete_admin" ON entities FOR DELETE USING (is_admin());

-- =====================================================
-- 4. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX idx_entity_types_name ON entity_types(name);
CREATE INDEX idx_entity_types_active ON entity_types(is_active);
CREATE INDEX idx_entities_name ON entities(name);
CREATE INDEX idx_entities_type_id ON entities(entity_type_id);
CREATE INDEX idx_entities_active ON entities(is_active);

-- =====================================================
-- 5. INSERIR DADOS INICIAIS
-- =====================================================

-- Tipos de Entidades
INSERT INTO entity_types (name, description, color, icon, hierarchy_level) VALUES
  ('Exús', 'Entidades masculinas guardiãs dos caminhos', '#dc2626', 'Zap', 1),
  ('Pombagiras', 'Entidades femininas da linha de esquerda', '#ec4899', 'Heart', 1),
  ('Caboclos', 'Espíritos de índios brasileiros', '#16a34a', 'TreePine', 2),
  ('Pretos-Velhos', 'Espíritos de escravos sábios', '#8b5cf6', 'Users', 2),
  ('Orixás', 'Divindades africanas', '#f59e0b', 'Crown', 3),
  ('Erês', 'Espíritos de crianças', '#06b6d4', 'Baby', 1)
ON CONFLICT (name) DO NOTHING;

-- Entidades Espirituais
INSERT INTO entities (name, entity_type_id, description, day_of_week, colors, offerings, characteristics) VALUES
  (
    'Exú Tranca Rua',
    (SELECT id FROM entity_types WHERE name = 'Exús'),
    'Guardião dos caminhos e encruzilhadas, responsável por abrir e fechar caminhos',
    'Segunda-feira',
    ARRAY['Vermelho', 'Preto'],
    ARRAY['Cachaça', 'Charuto', 'Vela vermelha', 'Farofa de dendê'],
    ARRAY['Proteção', 'Abertura de caminhos', 'Justiça', 'Força']
  ),
  (
    'Maria Padilha',
    (SELECT id FROM entity_types WHERE name = 'Pombagiras'),
    'Pombagira das sete encruzilhadas, especialista em trabalhos de amor',
    'Sexta-feira',
    ARRAY['Vermelho', 'Dourado'],
    ARRAY['Champagne', 'Rosas vermelhas', 'Perfume', 'Vela vermelha'],
    ARRAY['Amor', 'Sedução', 'Feminilidade', 'Poder']
  ),
  (
    'Exú Caveira',
    (SELECT id FROM entity_types WHERE name = 'Exús'),
    'Exú das almas e cemitérios, especialista em proteção espiritual',
    'Segunda-feira',
    ARRAY['Preto', 'Branco'],
    ARRAY['Cachaça', 'Charuto', 'Vela preta', 'Café preto'],
    ARRAY['Proteção', 'Defesa espiritual', 'Quebra de demandas', 'Justiça']
  ),
  (
    'Caboclo Sete Flechas',
    (SELECT id FROM entity_types WHERE name = 'Caboclos'),
    'Caboclo guerreiro das matas, protetor e curador',
    'Quinta-feira',
    ARRAY['Verde', 'Marrom'],
    ARRAY['Jurema', 'Ervas', 'Vela verde', 'Água'],
    ARRAY['Cura', 'Proteção', 'Força', 'Sabedoria']
  )
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. CONCEDER PERMISSÕES
-- =====================================================

GRANT SELECT ON entity_types TO anon, authenticated;
GRANT SELECT ON entities TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON entity_types TO authenticated;
GRANT INSERT, UPDATE, DELETE ON entities TO authenticated;

-- =====================================================
-- 7. VERIFICAÇÃO FINAL
-- =====================================================

DO $$
DECLARE
  entity_types_count integer;
  entities_count integer;
BEGIN
  SELECT COUNT(*) INTO entity_types_count FROM entity_types;
  SELECT COUNT(*) INTO entities_count FROM entities;
  
  RAISE NOTICE '';
  RAISE NOTICE '🏛️ SISTEMA DE ENTIDADES ESPIRITUAIS CRIADO';
  RAISE NOTICE '==========================================';
  RAISE NOTICE '✅ Tipos de entidades: %', entity_types_count;
  RAISE NOTICE '✅ Entidades criadas: %', entities_count;
  RAISE NOTICE '';
  RAISE NOTICE '🚀 PRÓXIMOS PASSOS:';
  RAISE NOTICE '   1. Acesse /admin';
  RAISE NOTICE '   2. Veja o novo menu "Entidades Espirituais"';
  RAISE NOTICE '   3. Gerencie tipos e entidades';
  RAISE NOTICE '==========================================';
END $$;

SELECT 'SISTEMA DE ENTIDADES ESPIRITUAIS CRIADO COM SUCESSO!' as result;