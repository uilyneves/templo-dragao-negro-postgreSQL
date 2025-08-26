import { createClient } from '@supabase/supabase-js';

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Criar cliente Supabase apenas se as variáveis estiverem configuradas
export const supabaseBrowser = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

// Função para verificar se Supabase está configurado
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey);
}

// Função para limpar sessão corrompida
export async function clearCorruptedSession() {
  if (!supabaseBrowser) return;
  
  try {
    // Tentar fazer logout silencioso
    await supabaseBrowser.auth.signOut({ scope: 'local' });
  } catch (error) {
    // Se falhar, limpar localStorage manualmente
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sb-' + supabaseUrl?.split('//')[1]?.split('.')[0] + '-auth-token');
    }
  }
}

// Função para verificar se sessão é válida
export async function isSessionValid(): Promise<boolean> {
  if (!supabaseBrowser) return false;
  
  try {
    const { data: { session }, error } = await supabaseBrowser.auth.getSession();
    return !error && !!session;
  } catch (error) {
    return false;
  }
}

// Função para obter usuário atual de forma segura
export async function getCurrentUserSafe() {
  if (!supabaseBrowser) {
    return { user: null, error: 'Supabase não configurado' };
  }
  
  try {
    // Verificar sessão primeiro
    const sessionValid = await isSessionValid();
    if (!sessionValid) {
      await clearCorruptedSession();
      return { user: null, error: 'Sessão inválida' };
    }
    
    const { data: { user }, error } = await supabaseBrowser.auth.getUser();
    return { user, error: error?.message };
  } catch (error) {
    await clearCorruptedSession();
    return { 
      user: null, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
}