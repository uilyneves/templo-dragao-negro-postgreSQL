import { createClient } from '@supabase/supabase-js';

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Criar cliente Supabase apenas se as variáveis estiverem configuradas
export const supabase = supabaseUrl && supabaseAnonKey 
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

// =====================================================
// SERVIÇOS CRUD PARA O SISTEMA
// =====================================================

// Serviço para membros
export const memberService = {
  async upsertMember(memberData: {
    name: string;
    email: string;
    phone?: string;
    origin: string;
    consents?: any;
  }) {
    if (!supabase) throw new Error('Supabase não configurado');

    const { data, error } = await supabase
      .from('members')
      .upsert({
        ...memberData,
        last_interaction: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'email' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAllMembers() {
    if (!supabase) throw new Error('Supabase não configurado');

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// Serviço CRUD para membros
export const memberCrudService = {
  async getAllMembers() {
    if (!supabase) throw new Error('Supabase não configurado');

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar membros:', error);
      return [];
    }
    return data || [];
  },

  async createMember(memberData: any) {
    if (!supabase) throw new Error('Supabase não configurado');

    const { data, error } = await supabase
      .from('members')
      .insert({
        ...memberData,
        status: 'active',
        origin: 'admin',
        tags: [],
        consents: {},
        total_consultations: 0,
        total_spent: 0,
        last_interaction: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMember(id: string, memberData: any) {
    if (!supabase) throw new Error('Supabase não configurado');

    const { data, error } = await supabase
      .from('members')
      .update({
        ...memberData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMember(id: string) {
    if (!supabase) throw new Error('Supabase não configurado');

    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Serviço CRUD para consultas
export const consultationCrudService = {
  async getAllConsultations() {
    if (!supabase) throw new Error('Supabase não configurado');

    const { data, error } = await supabase
      .from('consultations')
      .select(`
        *,
        members(name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar consultas:', error);
      return [];
    }
    return data || [];
  },

  async createConsultation(consultationData: any) {
    if (!supabase) throw new Error('Supabase não configurado');

    const { data, error } = await supabase
      .from('consultations')
      .insert({
        ...consultationData,
        status: 'pending',
        payment_status: 'pending',
        reminder_24h_sent: false,
        reminder_2h_sent: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateConsultation(id: string, consultationData: any) {
    if (!supabase) throw new Error('Supabase não configurado');

    const { data, error } = await supabase
      .from('consultations')
      .update({
        ...consultationData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteConsultation(id: string) {
    if (!supabase) throw new Error('Supabase não configurado');

    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};

// Serviço para dashboard
export const dashboardService = {
  async getDashboardData() {
    if (!supabase) throw new Error('Supabase não configurado');

    try {
      // Buscar dados reais do banco
      const [membersResult, consultationsResult] = await Promise.all([
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase.from('consultations').select('*')
      ]);

      const totalMembers = membersResult.count || 0;
      const consultations = consultationsResult.data || [];
      
      const completedConsultations = consultations.filter(c => c.status === 'completed').length;
      const pendingConsultations = consultations.filter(c => c.status === 'pending').length;
      
      // Calcular receita real
      const totalRevenue = consultations
        .filter(c => c.payment_status === 'paid')
        .reduce((sum, c) => sum + (c.amount || 0), 0);

      // Receita do mês atual
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyRevenue = consultations
        .filter(c => c.payment_status === 'paid' && c.created_at?.startsWith(currentMonth))
        .reduce((sum, c) => sum + (c.amount || 0), 0);

      return {
        totalMembers,
        totalConsultations: consultations.length,
        completedConsultations,
        pendingConsultations,
        totalRevenue,
        monthlyRevenue
      };
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      return {
        totalMembers: 0,
        totalConsultations: 0,
        completedConsultations: 0,
        pendingConsultations: 0,
        totalRevenue: 0,
        monthlyRevenue: 0
      };
    }
  }
};

// Serviço CRUD para posts do blog
export const blogService = {
  async getAllPosts() {
    if (!supabase) throw new Error('Supabase não configurado');

    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar posts:', error);
      return [];
    }
    return data || [];
  },

  async createPost(postData: any) {
    if (!supabase) throw new Error('Supabase não configurado');

    const { data, error } = await supabase
      .from('blog_posts')
      .insert({
        ...postData,
        view_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePost(id: string, postData: any) {
    if (!supabase) throw new Error('Supabase não configurado');

    const { data, error } = await supabase
      .from('blog_posts')
      .update({
        ...postData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePost(id: string) {
    if (!supabase) throw new Error('Supabase não configurado');

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  }
};