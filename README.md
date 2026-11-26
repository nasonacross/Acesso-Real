# AcessoReal — Plataforma de Acessibilidade Universal (Tupã - SP)

Plataforma web progressiva (PWA) voltada à inclusão e acessibilidade urbana em **Tupã - SP** e região, publicada na **Vercel** com banco de dados PostgreSQL e armazenamento de imagens no **Supabase**.

## Principais Funcionalidades

- **Rotas Acessíveis em Tupã (Partida fixa: Faculdade FADAP / FAP):** cálculo real de trajetos via OSRM nos modos **A Pé / Cadeira de Rodas**, **Ônibus Urbano Adaptado** e **Carro Adaptado / Táxi**, cobrindo estabelecimentos, hospitais, CRAS, CREAS, APAE, Poupatempo e assistências sociais de Tupã.
- **Sistema de 2 Perfis:**
  - **Perfil Personalizado:** cadastro completo onde a pessoa escolhe suas condições **mentais/cognitivas/psicossociais** (TEA, TDAH, ansiedade, pânico, depressão, bipolaridade, TOC, TEPT, Tourette, dislexia, memória/demência, hipersensibilidades, entre outras) e **corporais/físicas/sensoriais** para cálculo automático de compatibilidade.
  - **Perfil Gestor:** portal dedicado para gestores de estabelecimentos atualizarem recursos de acessibilidade e responderem verificações.
- **IA Visão (Análise Óptica de Acessibilidade):** captura pela câmera do celular ou upload de foto com medição real de luminosidade, contraste e ofuscamento em Canvas + histórico salvo no Supabase Postgres e Storage.
- **PWA Instalável (Android, iPhone e PC):** design responsivo WCAG com modo alto contraste, ícones nativos e suporte a tela cheia no celular.

## Arquitetura

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Leaflet (`frontend/`)
- **Backend:** Express + TypeScript rodando via **Vercel Services** (`backend/`, entrypoint `src/index.ts`)
- **Banco de Dados & Storage:** **Supabase PostgreSQL 17** (`acessoreal-db`, região `sa-east-1`) + **Supabase Storage** (`images` bucket)

## Variáveis de Ambiente

Veja [`.env.example`](.env.example). Configure `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no projeto da Vercel.

## Rodando Localmente

```bash
npm --prefix backend install
npm --prefix frontend install
npm run build
npm run dev:backend
npm run dev:frontend
```
