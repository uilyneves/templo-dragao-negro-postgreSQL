# Sistema Completo Templo de Kimbanda - Dragão Negro

Sistema web completo para gerenciamento de Templo de Kimbanda com agendamento de consultas, e-commerce, CRM automático e painel administrativo.

## 🚀 Stack Tecnológica

- **Frontend**: Next.js 13 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend/DB**: Supabase (Auth + Database + Storage + RLS)
- **Pagamentos**: PagSeguro (checkout transparente + webhook)
- **Mensagens**: WhatsApp Evolution API
- **Email**: Brevo + SMTP
- **Deploy**: Netlify

## 📋 Funcionalidades

### Site Público
- ✅ Home com CTAs para consulta, culto e loja
- ✅ Sistema de agendamento de consultas com Exús
- ✅ Loja virtual com carrinho e checkout
- ✅ Sistema de rituais com calendário
- ✅ Páginas institucionais (sobre, iniciação, contato, etc.)
- ✅ Blog integrado
- ✅ Sistema de doações

### Painel Administrativo
- ✅ Dashboard com métricas em tempo real
- ✅ Gestão completa de consultas
- ✅ Administração de rituais e eventos
- ✅ E-commerce (produtos, pedidos, estoque)
- ✅ CRM de membros com tags automáticas
- ✅ Sistema de mensagens (WhatsApp + Email)
- ✅ Sistema RBAC com permissões granulares
- ✅ Gestão de cargos e permissões

### Integrações
- ✅ PagSeguro para pagamentos (PIX, cartão, boleto)
- ✅ WhatsApp via Evolution API
- ✅ Email transacional e marketing
- ✅ Webhooks para automações externas (Make/Zapier)

## 🛠️ Setup Rápido

### 1. Clonar e Instalar
```bash
git clone <repository-url>
cd dragao-negro-sistema
npm install
```

### 2. Configurar Supabase

1. Criar projeto no [Supabase](https://supabase.com)
2. Executar o script `supabase/migrations/complete_reset_dragao_negro.sql`
3. Configurar Auth: **Allow signup = ON**, **Confirm email = OFF**
4. Obter URL e chaves do projeto

### 3. Variáveis de Ambiente

Criar `.env.local`:

```bash
# Supabase - OBRIGATÓRIO
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Templo de Kimbanda Dragão Negro"

# PagSeguro (Opcional)
PAGSEGURO_EMAIL=contato@dragaonegro.com.br
PAGSEGURO_TOKEN=sua_token_aqui
PAGSEGURO_SANDBOX=true

# WhatsApp Evolution API (Opcional)
EVOLUTION_API_URL=https://sua-evolution-api.com
EVOLUTION_API_KEY=sua_api_key

# Email Brevo (Opcional)
BREVO_API_KEY=xkeysib-xxx
BREVO_SENDER_EMAIL=noreply@dragaonegro.com.br
```

### 4. Executar

```bash
npm run dev
```

### 5. Setup Inicial

1. Acesse `/test-database` - verificar se tudo está funcionando
2. Acesse `/setup-admin` - criar Super Administrador
3. Login: `tata@dragaonegro.com.br` | Senha: `Qwe123@2025`
4. Acesse `/admin` - painel administrativo completo

## 🔧 Scripts Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Verificar saúde do sistema
curl http://localhost:3000/api/health

# Atualizar browserslist
npm run update-browserslist
```

## 📊 Estrutura do Banco

### Tabelas Principais
- `roles` - Cargos e níveis de acesso
- `permissions` - Matriz de permissões por módulo/ação
- `profiles` - Usuários com roles
- `members` - CRM de membros
- `consultations` - Agendamentos de consultas
- `availability` - Horários disponíveis
- `cults` - Eventos e rituais
- `products` - Catálogo de produtos
- `orders` - Pedidos da loja
- `messages` - Fila de mensagens
- `system_settings` - Configurações
- `system_logs` - Logs de auditoria

### Segurança
- ✅ Row Level Security (RLS) ativo em todas as tabelas
- ✅ Políticas baseadas em roles e permissões
- ✅ Funções auxiliares para verificação de acesso
- ✅ Logs de auditoria completos

## 🎯 Funcionalidades Avançadas

### Sistema RBAC
- Cargos: Super Admin, Admin, Operador, Atendente, Membro, Visitante
- Permissões granulares por módulo (Dashboard, Membros, Consultas, etc.)
- Função `has_permission(module, action)` para verificações

### CRM Automático
- Captura automática de leads via formulários
- Segmentação por tags e origem
- Consentimentos LGPD
- Métricas de engajamento

### Sistema de Mensagens
- Templates personalizáveis
- Fila com retry automático
- Integração WhatsApp + Email
- Lembretes automáticos

## 🚀 Deploy em Produção

### Netlify
1. Conectar repositório
2. Configurar variáveis de ambiente
3. Deploy automático

### Configurações Importantes
- **Supabase Auth**: Allow signup = ON, Confirm email = OFF
- **RLS**: Ativo em todas as tabelas
- **Service Role Key**: Configurada para operações admin

## 📞 Suporte

- **Diagnóstico**: `/test-database`
- **Health Check**: `/api/health`
- **Setup**: `/setup-admin`

---

**Sistema 100% funcional, sem warnings, pronto para produção!** 🎉