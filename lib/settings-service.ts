import { supabaseBrowser } from './supabase-browser';

export interface SiteSettings {
  site_name: string;
  contact_email: string;
  contact_phone: string;
  whatsapp_number: string;
  consultation_price: number;
  consultation_duration: number;
  address: string;
}

export const settingsService = {
  // Carregar configurações públicas do sistema
  async getPublicSettings(): Promise<SiteSettings> {
    const defaultSettings: SiteSettings = {
      site_name: 'Templo de Kimbanda Dragão Negro',
      contact_email: 'contato@dragaonegro.com.br',
      contact_phone: '(11) 99999-9999',
      whatsapp_number: '5511999999999',
      consultation_price: 120.00,
      consultation_duration: 30,
      address: 'São Paulo - SP'
    };

    try {
      if (!supabaseBrowser) {
        console.warn('Supabase não configurado - usando configurações padrão');
        return defaultSettings;
      }

      const { data, error } = await supabaseBrowser
        .from('system_settings')
        .select('key, value, type')
        .eq('is_public', true);

      if (error) {
        console.error('Erro ao carregar configurações:', error);
        return defaultSettings;
      }

      if (!data || data.length === 0) {
        console.warn('Nenhuma configuração encontrada no banco - usando padrões');
        return defaultSettings;
      }

      const settings = { ...defaultSettings };
      
      data.forEach(setting => {
        try {
          if (setting.type === 'string') {
            (settings as any)[setting.key] = JSON.parse(setting.value);
          } else if (setting.type === 'number') {
            (settings as any)[setting.key] = parseFloat(setting.value);
          } else if (setting.type === 'boolean') {
            (settings as any)[setting.key] = setting.value === 'true';
          } else {
            (settings as any)[setting.key] = setting.value;
          }
        } catch (e) {
          console.warn(`Erro ao processar configuração ${setting.key}:`, e);
          // Manter valor padrão se houver erro no parse
        }
      });

      console.log('Configurações carregadas do banco:', settings);
      return settings;
    } catch (error) {
      console.error('Erro no settingsService:', error);
      return defaultSettings;
    }
  },

  // Atualizar configuração específica (apenas para admin)
  async updateSetting(key: string, value: any, type: 'string' | 'number' | 'boolean' = 'string') {
    try {
      if (!supabaseBrowser) {
        throw new Error('Supabase não configurado');
      }

      console.log(`🔧 Atualizando configuração ${key}:`, value, `(${type})`);

      let processedValue: string;
      
      if (type === 'string') {
        processedValue = JSON.stringify(value);
      } else if (type === 'number') {
        processedValue = value.toString();
      } else if (type === 'boolean') {
        processedValue = value.toString();
      } else {
        processedValue = value;
      }

      console.log(`💾 Valor processado para ${key}:`, processedValue);

      const { data, error } = await supabaseBrowser
        .from('system_settings')
        .upsert({
          key,
          value: processedValue,
          type,
          category: 'general',
          is_public: true, // Configurações do site são públicas
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'key',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error(`❌ Erro ao salvar ${key}:`, error);
        throw error;
      }

      console.log(`✅ Configuração ${key} salva:`, data);
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  },

  // Invalidar cache e recarregar configurações
  async refreshSettings(): Promise<SiteSettings> {
    // Força recarregamento das configurações
    return this.getPublicSettings();
  }
};