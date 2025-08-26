import { createClient } from '@supabase/supabase-js';

// Verificar se as variáveis de ambiente estão definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Tipos do banco de dados
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone?: string;
          role: 'super_admin' | 'admin' | 'operator' | 'attendant' | 'member' | 'visitor';
          avatar_url?: string;
          is_active: boolean;
          last_login?: string;
          metadata?: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          phone?: string;
          role?: 'super_admin' | 'admin' | 'operator' | 'attendant' | 'member' | 'visitor';
          avatar_url?: string;
          is_active?: boolean;
          last_login?: string;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string;
          role?: 'super_admin' | 'admin' | 'operator' | 'attendant' | 'member' | 'visitor';
          avatar_url?: string;
          is_active?: boolean;
          last_login?: string;
          metadata?: any;
          updated_at?: string;
        };
      };
      members: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone?: string;
          cpf?: string;
          birth_date?: string;
          address?: any;
          emergency_contact?: any;
          initiation_date?: string;
          spiritual_level?: string;
          guardian_exu?: string;
          guardian_pomba_gira?: string;
          tags: string[];
          origin: string;
          status: 'active' | 'inactive' | 'blocked' | 'pending';
          consents?: any;
          last_interaction: string;
          total_consultations: number;
          total_spent: number;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string;
          cpf?: string;
          birth_date?: string;
          address?: any;
          emergency_contact?: any;
          initiation_date?: string;
          spiritual_level?: string;
          guardian_exu?: string;
          guardian_pomba_gira?: string;
          tags?: string[];
          origin: string;
          status?: 'active' | 'inactive' | 'blocked' | 'pending';
          consents?: any;
          last_interaction?: string;
          total_consultations?: number;
          total_spent?: number;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          cpf?: string;
          birth_date?: string;
          address?: any;
          emergency_contact?: any;
          initiation_date?: string;
          spiritual_level?: string;
          guardian_exu?: string;
          guardian_pomba_gira?: string;
          tags?: string[];
          origin?: string;
          status?: 'active' | 'inactive' | 'blocked' | 'pending';
          consents?: any;
          last_interaction?: string;
          total_consultations?: number;
          total_spent?: number;
          notes?: string;
          updated_at?: string;
        };
      };
      consultations: {
        Row: {
          id: string;
          member_id?: string;
          consultant_id?: string;
          date: string;
          time: string;
          duration_minutes: number;
          status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
          payment_status: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'cancelled';
          payment_method?: 'pix' | 'credit_card' | 'debit_card' | 'boleto' | 'cash' | 'transfer';
          payment_id?: string;
          amount: number;
          question?: string;
          exu_consulted?: string;
          consultation_notes?: string;
          recommendations?: string;
          scheduled_by?: string;
          confirmed_at?: string;
          completed_at?: string;
          reminder_24h_sent: boolean;
          reminder_2h_sent: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          member_id?: string;
          consultant_id?: string;
          date: string;
          time: string;
          duration_minutes?: number;
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
          payment_status?: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'cancelled';
          payment_method?: 'pix' | 'credit_card' | 'debit_card' | 'boleto' | 'cash' | 'transfer';
          payment_id?: string;
          amount?: number;
          question?: string;
          exu_consulted?: string;
          consultation_notes?: string;
          recommendations?: string;
          scheduled_by?: string;
          confirmed_at?: string;
          completed_at?: string;
          reminder_24h_sent?: boolean;
          reminder_2h_sent?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          consultant_id?: string;
          date?: string;
          time?: string;
          duration_minutes?: number;
          status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
          payment_status?: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'cancelled';
          payment_method?: 'pix' | 'credit_card' | 'debit_card' | 'boleto' | 'cash' | 'transfer';
          payment_id?: string;
          amount?: number;
          question?: string;
          exu_consulted?: string;
          consultation_notes?: string;
          recommendations?: string;
          scheduled_by?: string;
          confirmed_at?: string;
          completed_at?: string;
          reminder_24h_sent?: boolean;
          reminder_2h_sent?: boolean;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          short_description?: string;
          price: number;
          compare_price?: number;
          cost_price?: number;
          stock: number;
          min_stock: number;
          track_stock: boolean;
          category_id?: string;
          tags: string[];
          images: string[];
          featured_image?: string;
          weight?: number;
          dimensions?: any;
          active: boolean;
          featured: boolean;
          meta_title?: string;
          meta_description?: string;
          spiritual_purpose?: string;
          usage_instructions?: string;
          consecration_level?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description: string;
          short_description?: string;
          price: number;
          compare_price?: number;
          cost_price?: number;
          stock?: number;
          min_stock?: number;
          track_stock?: boolean;
          category_id?: string;
          tags?: string[];
          images?: string[];
          featured_image?: string;
          weight?: number;
          dimensions?: any;
          active?: boolean;
          featured?: boolean;
          meta_title?: string;
          meta_description?: string;
          spiritual_purpose?: string;
          usage_instructions?: string;
          consecration_level?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          short_description?: string;
          price?: number;
          compare_price?: number;
          cost_price?: number;
          stock?: number;
          min_stock?: number;
          track_stock?: boolean;
          category_id?: string;
          tags?: string[];
          images?: string[];
          featured_image?: string;
          weight?: number;
          dimensions?: any;
          active?: boolean;
          featured?: boolean;
          meta_title?: string;
          meta_description?: string;
          spiritual_purpose?: string;
          usage_instructions?: string;
          consecration_level?: string;
          updated_at?: string;
        };
      };
      blog_posts: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt?: string;
          content: string;
          featured_image?: string;
          images: string[];
          author_id?: string;
          status: 'draft' | 'published' | 'archived';
          published_at?: string;
          tags: string[];
          category?: string;
          meta_title?: string;
          meta_description?: string;
          view_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt?: string;
          content: string;
          featured_image?: string;
          images?: string[];
          author_id?: string;
          status?: 'draft' | 'published' | 'archived';
          published_at?: string;
          tags?: string[];
          category?: string;
          meta_title?: string;
          meta_description?: string;
          view_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string;
          content?: string;
          featured_image?: string;
          images?: string[];
          author_id?: string;
          status?: 'draft' | 'published' | 'archived';
          published_at?: string;
          tags?: string[];
          category?: string;
          meta_title?: string;
          meta_description?: string;
          view_count?: number;
          updated_at?: string;
        };
      };
    };
  };
};