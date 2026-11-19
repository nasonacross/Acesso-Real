# Integração Supabase — AcessoReal

Este diretório contém os scripts SQL e a documentação para configurar o banco de dados PostgreSQL gerenciado pelo **Supabase** para a plataforma **AcessoReal**.

---

## 🗄️ Arquivos Disponíveis

1. **`schema.sql`**:
   - Cria as tabelas estruturais:
     - `public.users` (Usuários e papéis: visitante, gestor, admin)
     - `public.profiles` (Perfis de acessibilidade personalizada: física, intelectual, sensorial, visual, auditiva, acompanhamento)
     - `public.establishments` (Estabelecimentos com dados de acessibilidade multidimensional NBR 9050, geolocalização, notas e classificação)
     - `public.reviews` (Avaliações comunitárias detalhadas)
     - `public.ai_analyses` (Histórico de análises de indícios visuais de acessibilidade por IA multimodal)
     - `public.reports` (Denúncias e moderação de estabelecimentos)
   - Cria índices otimizados para busca por cidade, categoria e busca JSONB GIN nos recursos de acessibilidade (`features`).
   - Habilita **Row Level Security (RLS)** com políticas públicas de leitura e inserção protegida.

2. **`seed.sql`**:
   - Insere os dados iniciais completos do projeto:
     - **37 estabelecimentos** cadastrados e pontuados nos municípios de **Tupã, Bastos, Marília e São Paulo** (incluindo FADAP/FAP, CRAS I, II e III, CREAS, APAE, UPA 24h, Praça da Bandeira, Corredor Av. Tamoios, etc.).
     - Perfis de teste (Mariana Silva - ativista cadeirante, Administradora AcessoReal, Gestor).
     - Avaliações da comunidade.
     - Histórico de análises de acessibilidade realizadas por inteligência artificial.

---

## 🚀 Como Configurar no Supabase (Passo a Passo)

### 1. Criar Projeto no Supabase
1. Acesse [supabase.com](https://supabase.com) e faça login.
2. Clique em **"New project"**.
3. Escolha uma organização, defina o nome do projeto (ex: `acessoreal-db`), crie uma senha segura para o banco e selecione a região mais próxima (ex: `South America (São Paulo) - sa-east-1`).
4. Aguarde a inicialização do projeto (~1 a 2 minutos).

### 2. Executar o Schema e o Seed
1. No painel do seu projeto no Supabase, clique no menu lateral **SQL Editor** (ícone `>_`).
2. Clique em **"New query"**.
3. Copie o conteúdo de [`schema.sql`](./schema.sql), cole no editor e clique em **"Run"** (ou `Ctrl + Enter`).
4. Em seguida, clique em **"New query"** novamente, copie o conteúdo de [`seed.sql`](./seed.sql), cole no editor e clique em **"Run"**.
5. Acesse a aba **Table Editor** no menu lateral e confirme que as 6 tabelas foram criadas com os dados populados!

### 3. Obter as Chaves de API
1. No menu lateral do Supabase, vá em **Project Settings** (ícone de engrenagem) > **API**.
2. Copie:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`)
   - **Project API Keys**:
     - `anon` `public`
     - `service_role` `secret`

### 4. Configurar as Variáveis de Ambiente

Crie ou edite o arquivo `.env` na raiz do projeto ou na pasta `backend/`:

```env
# Configurações do Supabase
SUPABASE_URL=https://SEU_PROJETO.supabase.co
SUPABASE_ANON_KEY=sua_chave_anon_publica_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_secreta_aqui

# Frontend Vite (se desejar acesso direto pelo client)
VITE_SUPABASE_URL=https://SEU_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_publica_aqui
```

### 5. Configurar no Vercel
Ao fazer o deploy no Vercel (ou nas configurações do projeto em **Settings > Environment Variables**):
- Adicione `SUPABASE_URL`
- Adicione `SUPABASE_ANON_KEY`
- Adicione `SUPABASE_SERVICE_ROLE_KEY`
- Adicione `VITE_SUPABASE_URL`
- Adicione `VITE_SUPABASE_ANON_KEY`

---

## 🛡️ Arquitetura Dual-Engine (Supabase + Fallback JSON)

O backend do AcessoReal foi construído de forma resiliente:
- **Com Supabase configurado**: Todas as consultas e gravações de estabelecimentos, perfis, avaliações, denúncias e análises de IA são sincronizadas em tempo real com o PostgreSQL no Supabase.
- **Sem Supabase (ou offline)**: A aplicação continua funcionando normalmente utilizando o banco transacional local em `backend/data/database.json`. Zero quebras ou dependências obrigatórias para testes rápidos!
