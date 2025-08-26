/*
  # Add check_table_exists Function
  
  This function is required by the diagnostic page to verify table existence.
  
  INSTRUCTIONS:
  1. Acesse seu projeto no Supabase
  2. Vá em "SQL Editor"
  3. Clique em "New Query"
  4. Cole este script completo
  5. Clique em "Run"
*/

-- Create the check_table_exists function
CREATE OR REPLACE FUNCTION check_table_exists(table_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = check_table_exists.table_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION check_table_exists(text) TO anon, authenticated;

-- Verify the function was created
SELECT 'check_table_exists function created successfully!' as result;