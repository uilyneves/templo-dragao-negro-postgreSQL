/*
  # Fix check_table_exists Function - Ambiguous Column Reference
  
  This script fixes the ambiguous column reference error in the check_table_exists function
  by renaming the parameter to avoid conflicts with table column names.
  
  INSTRUCTIONS:
  1. Acesse seu projeto no Supabase
  2. Vá em "SQL Editor"
  3. Clique em "New Query"
  4. Cole este script completo
  5. Clique em "Run"
*/

-- Drop the existing function with ambiguous parameter
DROP FUNCTION IF EXISTS check_table_exists(text);

-- Create the corrected function with unambiguous parameter name
CREATE OR REPLACE FUNCTION check_table_exists(p_table_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = p_table_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION check_table_exists(text) TO anon, authenticated;

-- Verify the function was created successfully
SELECT 'check_table_exists function fixed - ambiguity resolved!' as result;