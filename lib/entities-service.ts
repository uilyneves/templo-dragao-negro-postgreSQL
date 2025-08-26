import { supabase } from './supabase-client';

export interface EntityType {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  hierarchy_level: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Entity {
  id: string;
  name: string;
  entity_type_id?: string;
  description?: string;
  attributes: any;
  image_url?: string;
  day_of_week?: string;
  colors: string[];
  offerings: string[];
  characteristics: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  entity_types?: {
    name: string;
    color: string;
  };
}

export const entityTypesService = {
  // Buscar todos os tipos de entidades
  async getAll() {
    if (!supabase) throw new Error('Supabase não configurado');
    
    try {
      const { data, error } = await supabase
        .from('entity_types')
        .select('*')
        .order('hierarchy_level', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar tipos de entidades:', error);
      throw error;
    }
  },

  // Buscar tipos ativos
  async getActive() {
    if (!supabase) throw new Error('Supabase não configurado');
    
    try {
      const { data, error } = await supabase
        .from('entity_types')
        .select('*')
        .eq('is_active', true)
        .order('hierarchy_level', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar tipos ativos:', error);
      throw error;
    }
  },

  // Criar tipo de entidade
  async create(entityType: Omit<EntityType, 'id' | 'created_at' | 'updated_at'>) {
    if (!supabase) throw new Error('Supabase não configurado');
    
    try {
      const { data, error } = await supabase
        .from('entity_types')
        .insert({
          ...entityType,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar tipo de entidade:', error);
      throw error;
    }
  },

  // Atualizar tipo de entidade
  async update(id: string, entityType: Partial<EntityType>) {
    if (!supabase) throw new Error('Supabase não configurado');
    
    try {
      const { data, error } = await supabase
        .from('entity_types')
        .update({
          ...entityType,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar tipo de entidade:', error);
      throw error;
    }
  },

  // Deletar tipo de entidade
  async delete(id: string) {
    if (!supabase) throw new Error('Supabase não configurado');
    
    try {
      const { error } = await supabase
        .from('entity_types')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar tipo de entidade:', error);
      throw error;
    }
  }
};

export const entitiesService = {
  // Buscar todas as entidades
  async getAll() {
    if (!supabase) throw new Error('Supabase não configurado');
    
    try {
      const { data, error } = await supabase
        .from('entities')
        .select(`
          *,
          entity_types(name, color)
        `)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar entidades:', error);
      throw error;
    }
  },

  // Buscar entidades ativas
  async getActive() {
    if (!supabase) throw new Error('Supabase não configurado');
    
    try {
      const { data, error } = await supabase
        .from('entities')
        .select(`
          *,
          entity_types(name, color)
        `)
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar entidades ativas:', error);
      throw error;
    }
  },

  // Buscar entidades por tipo
  async getByType(entityTypeId: string) {
    if (!supabase) throw new Error('Supabase não configurado');
    
    try {
      const { data, error } = await supabase
        .from('entities')
        .select(`
          *,
          entity_types(name, color)
        `)
        .eq('entity_type_id', entityTypeId)
        .eq('is_active', true)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar entidades por tipo:', error);
      throw error;
    }
  },

  // Criar entidade
  async create(entity: Omit<Entity, 'id' | 'created_at' | 'updated_at' | 'entity_types'>) {
    if (!supabase) throw new Error('Supabase não configurado');
    
    try {
      const { data, error } = await supabase
        .from('entities')
        .insert({
          ...entity,
          updated_at: new Date().toISOString()
        })
        .select(`
          *,
          entity_types(name, color)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar entidade:', error);
      throw error;
    }
  },

  // Atualizar entidade
  async update(id: string, entity: Partial<Entity>) {
    if (!supabase) throw new Error('Supabase não configurado');
    
    try {
      const { data, error } = await supabase
        .from('entities')
        .update({
          ...entity,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          entity_types(name, color)
        `)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao atualizar entidade:', error);
      throw error;
    }
  },

  // Deletar entidade
  async delete(id: string) {
    if (!supabase) throw new Error('Supabase não configurado');
    
    try {
      const { error } = await supabase
        .from('entities')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar entidade:', error);
      throw error;
    }
  }
};