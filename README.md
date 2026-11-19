# AcessoReal — Plataforma Inteligente de Acessibilidade Universal

> *"Acessibilidade não deve ser uma promessa do estabelecimento. Deve ser uma informação que qualquer pessoa possa consultar antes de sair de casa."*

**AcessoReal** é uma plataforma inteligente, responsiva e mobile-first (com suporte a PWA instalável no Android e iOS) projetada para identificar, localizar, avaliar e comparar a acessibilidade REAL de espaços coletivos: estabelecimentos comerciais, instituições públicas, serviços de saúde, transporte e assistência social (CRAS, CREAS).

A plataforma atende pessoas com deficiência física/motora, intelectual, psicossocial/neurodivergente (Autismo/TEA, TDAH, Síndrome de Down), visual, auditiva, mobilidade reduzida e suas famílias.

---

## 🌟 Principais Recursos e Diferenciais Inovadores

### 1. Índice de Compatibilidade Pessoal
- Compara as necessidades ativas e voluntárias de cada visitante com os recursos reais do local.
- **Categorias não selecionadas não distorcem a nota**: se o usuário não indicou necessidade auditiva, a nota da categoria auditiva não infla nem reduz sua compatibilidade pessoal.
- Apresenta:
  - Percentual de Compatibilidade Individual (0% a 100%)
  - Autonomia Individual estimada
  - O que está adequado
  - Possíveis dificuldades que podem ser encontradas
  - Informações que ainda precisam ser confirmadas

### 2. Personalização do Modo de Visita e Acompanhamento
- Pergunta fundamental: **"Você pretende ir acompanhado(a) ou sozinho(a)?"**
  - **Vou sozinho(a)**: o sistema prioriza estabelecimentos com autonomia plena, rotas desimpedidas, pisos nivelados e atendimento empático.
  - **Vou acompanhado(a)**: permite informar o apoio prestado (locomoção, comunicação, tarefas).
  - *Regra Ética Inegociável*: a presença de acompanhante facilita a visita, mas não substitui a responsabilidade do local em ser acessível.

### 3. "Antes de Ir, Saiba o que Esperar" (Simulação da Visita)
- Passo a passo da experiência do visitante da calçada ao sanitário e atendimento.
- Veredito claro sobre a possibilidade de ida autônoma.
- Checklist com perguntas essenciais para ligar e confirmar antes de sair de casa.
- Recurso de **leitura em voz alta (Audio TTS)** integrado para suporte visual.

### 4. Avaliação Multidimensional (0 a 100) sem Maquiagem
O sistema pontua separadamente 6 categorias:
1. **Física e Motora** (rampas, corrimãos, largura de portas ≥80cm, sanitários adaptados, elevadores, circulação).
2. **Intelectual e Cognitiva** (sinalização simples, linguagem fácil, rotas intuitivas, atendimento paciente).
3. **Psicossocial e Sensorial** (nível de ruído, iluminação acolhedora, salas de descompressão para autistas/TDAH, horários de pico).
4. **Visual** (piso tátil podotátil, sinalização em Braille, alto contraste, avisos sonoros).
5. **Auditiva** (Libras, painéis visuais de senha, alertas luminosos).
6. **Qualidade do Atendimento** (respeito à autonomia, capacitação inclusiva, atendimento prioritário sem capacitismo).

> **Garantia Antimaquiagem**: Uma boa pontuação em atendimento ou tecnologia nunca esconde uma barreira física grave (ex: degrau sem rampa na entrada impede a classificação de "Acessibilidade bem avaliada").

### 5. Visão Computacional & IA Multimodal
- Módulo de inteligência artificial para análise de fotos de calçadas, entradas, rampas, corredores, banheiros e sinalizações.
- Integração nativa com **Google Gemini API (`@google/genai`)** e motor heurístico local de visão computacional.
- **Diretriz de Segurança**: Apresenta resultados estritamente como **INDÍCIOS VISUAIS**, identificando o público afetado e recomendando melhorias sem afirmar laudo de engenharia definitivo.

### 6. Transparência da Origem dos Dados
Cada informação exibe seu selo de procedência:
- 🏢 Declarada pelo estabelecimento
- 👤 Informada por usuário
- 🔍 Verificada presencialmente
- 📄 Confirmada por laudo/documentação técnica
- ✨ Analisada por inteligência artificial

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Leaflet (OpenStreetMap), PWA (Service Worker & Web App Manifest).
- **Acessibilidade Digital**: Conformidade com WCAG 2.2 Nível AA, navegação por teclado, leitor de tela (aria-live), modo alto contraste, redimensionamento de fontes (A-/A+), síntese de voz (Web Speech API).
- **Backend**: Node.js, Express, TypeScript, Multer, dotenv, CORS.
- **IA Multimodal**: `@google/genai` (Gemini API 2.5 Flash / 1.5 Flash).
- **Banco de Dados**: Motor relacional transacional com persistência atômica em disco (`backend/data/database.json`), permitindo execução imediata sem dependências complexas de compilação C++.

---

## 🚀 Instalação e Execução

### Pré-requisitos
- Node.js 18+ ou 20+ e npm.

### Passo 1: Instalar dependências

No diretório do backend:
```bash
cd backend
npm install
```

No diretório do frontend:
```bash
cd frontend
npm install
```

### Passo 2: Executar o Projeto

#### Modo Servidor Unificado (Frontend + Backend Integrados)
```bash
cd backend
npm start
```
Acesse no seu navegador: **`http://localhost:3001`**
- A aplicação web completa é servida na porta 3001.
- A API REST está disponível em `http://localhost:3001/api`.

#### Modo Desenvolvimento (Vite com Hot Reload)
Para desenvolvimento ativo com atualização instantânea:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```
Acesse **`http://localhost:5173`** (com proxy transparente para a API na porta 3001).

---

## 🔑 Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` dentro da pasta `backend/` caso deseje ativar a API do Google Gemini:

```env
PORT=3001
GEMINI_API_KEY=sua_chave_gemini_aqui
```

*Nota: Se a chave não for informada, o sistema executará automaticamente o motor heurístico local de visão computacional com indícios detalhados e rotulados como demonstração/heurística.*

---

## 📱 Instalação PWA (Progressive Web App)

- **Android / Google Chrome**: Toque no botão "Instalar App" na barra superior do AcessoReal ou acesse o menu de três pontos do navegador e selecione **"Instalar aplicativo"**.
- **iOS / Safari**: Toque no botão de Compartilhamento (ícone de quadrado com seta para cima) e selecione **"Adicionar à Tela de Início"**.

---

## 🛡️ Conformidade e Privacidade (LGPD)

- **Sem exigência de diagnósticos ou laudos**: o cadastro de necessidades é 100% voluntário.
- **Transparência e Controle**: o visitante pode alterar, apagar ou desativar temporariamente filtros do seu perfil a qualquer momento.
- **Moderação Colaborativa**: avaliações passam por crivo ético para evitar avaliações inverídicas ou ofensivas.
