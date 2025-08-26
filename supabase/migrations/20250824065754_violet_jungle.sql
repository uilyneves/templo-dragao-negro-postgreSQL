/*
  # Fix Duplicate Availability Records - Templo de Kimbanda Dragão Negro
  
  This migration fixes the duplicate key error in availability table
  by using ON CONFLICT DO NOTHING for safe insertion.
  
  INSTRUCTIONS:
  1. Acesse seu projeto no Supabase
  2. Vá em "SQL Editor"
  3. Clique em "New Query"
  4. Cole este script completo
  5. Clique em "Run"
*/

-- =====================================================
-- 1. CLEAR EXISTING AVAILABILITY RECORDS
-- =====================================================

-- Remove all existing availability records to start fresh
DELETE FROM availability;

-- =====================================================
-- 2. INSERT AVAILABILITY WITH CONFLICT HANDLING
-- =====================================================

-- Insert availability slots for next 30 days with conflict handling
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

-- =====================================================
-- 3. VERIFY AVAILABILITY RECORDS
-- =====================================================

DO $$
DECLARE
  availability_count integer;
BEGIN
  SELECT COUNT(*) INTO availability_count FROM availability;
  
  RAISE NOTICE '';
  RAISE NOTICE '📅 HORÁRIOS DE DISPONIBILIDADE:';
  RAISE NOTICE '================================';
  RAISE NOTICE '✅ % horários criados com sucesso', availability_count;
  RAISE NOTICE '⏰ Horários: 14:00, 15:00, 16:00, 17:00';
  RAISE NOTICE '📆 Período: Próximos 30 dias (exceto domingos e segundas)';
  RAISE NOTICE '================================';
  
  IF availability_count > 0 THEN
    RAISE NOTICE '🎉 AVAILABILITY TABLE FIXED!';
  ELSE
    RAISE NOTICE '⚠️  Nenhum horário foi criado - verifique as datas';
  END IF;
END $$;

-- =====================================================
-- 4. SUCCESS MESSAGE
-- =====================================================

SELECT 'AVAILABILITY DUPLICATES FIXED - MIGRATION COMPLETED!' as result;