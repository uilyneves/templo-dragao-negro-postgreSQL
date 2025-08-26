import { supabaseBrowser } from './supabase-browser';

// Serviço de autenticação
export const authService = {
  // Criar usuário membro
  async createMemberUser(email: string, password: string, name: string) {
    try {
      if (!supabaseBrowser) {
        return { success: false, error: 'Supabase não configurado' };
      }

      // Criar usuário no Supabase Auth
      const { data, error } = await supabaseBrowser.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: 'Falha ao criar usuário' };
      }

      // Buscar role de membro
      const { data: memberRole } = await supabaseBrowser
        .from('roles')
        .select('id')
        .eq('name', 'member')
        .single();

      if (!memberRole) {
        return { success: false, error: 'Role de membro não encontrada' };
      }

      // Criar perfil
      const { error: profileError } = await supabaseBrowser
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          name,
          role_id: memberRole.id,
          is_active: true
        });

      if (profileError) {
        return { success: false, error: 'Erro ao criar perfil: ' + profileError.message };
      }

      return { success: true, user: data.user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  // Fazer login
  async signIn(email: string, password: string) {
    try {
      if (!supabaseBrowser) {
        return { success: false, error: 'Supabase não configurado' };
      }

      const { data, error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user: data.user, session: data.session };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  // Fazer logout
  async signOut() {
    try {
      if (!supabaseBrowser) {
        return { success: false, error: 'Supabase não configurado' };
      }

      const { error } = await supabaseBrowser.auth.signOut();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  // Obter usuário atual
  async getCurrentUser() {
    try {
      if (!supabaseBrowser) {
        return { success: false, error: 'Supabase não configurado' };
      }

      const { data: { user }, error } = await supabaseBrowser.auth.getUser();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }
};