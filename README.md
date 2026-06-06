# SmartDisaster — Mobile

> Plataforma mobile de gestão de resposta a desastres naturais monitorados por satélite.
> **FIAP — Global Solution 2026/1 · Economia Espacial**

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Conexão com o desafio espacial](#conexão-com-o-desafio-espacial)
- [Funcionalidades](#funcionalidades)
- [Telas e navegação](#telas-e-navegação)
- [Tecnologias](#tecnologias)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Como rodar](#como-rodar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Integração com a API](#integração-com-a-api)
- [Autenticação](#autenticação)
- [Autor](#autor)

---

## Sobre o projeto

O **SmartDisaster Mobile** é o aplicativo de campo da plataforma SmartDisaster. Ele permite que voluntários e administradores gerenciem em tempo real a resposta a desastres naturais — abrigos, vítimas, doações e necessidades — diretamente do celular, integrado a uma API REST protegida por JWT.

O app foi construído com **React Native + Expo** e consome a API Spring Boot do mesmo projeto.

---

## Conexão com o desafio espacial

O desafio da FIAP propõe soluções que conectem a **economia espacial** a problemas reais na Terra. O SmartDisaster se encaixa diretamente em dois dos eixos do desafio:

| Eixo do desafio | Como o SmartDisaster atende |
|---|---|
| Monitoramento satelital para previsão de desastres | A API possui um módulo `SensorLeitura` que recebe dados de sensores IoT instalados nos abrigos — dados que podem ser alimentados por imagens e telemetria de satélites (via Space Charter / NASA / ESA) |
| Sistemas de resposta a emergências | O app gerencia toda a operação de campo após a detecção do desastre: abrigos, vítimas, doações e matching automático de recursos |
| Conectividade em situações de emergência | A arquitetura é offline-tolerante e pode ser conectada a redes via satélite (ex: Starlink) em regiões sem infraestrutura |

**Fluxo completo:**

```
Satélite detecta evento climático extremo
            ↓
Alerta gerado via dados orbitais (NASA / ESA / Space Charter)
            ↓
SmartDisaster ativa o modo de resposta
            ↓
App mobile coordena abrigos, vítimas, doações e voluntários em tempo real
```

**ODS da ONU atendidos:** 11 (Cidades sustentáveis), 13 (Ação climática), 9 (Inovação e infraestrutura)

---

## Funcionalidades

### Autenticação
- Cadastro de voluntário com validação completa (nome, e-mail, telefone, senha)
- Login com e-mail e senha via JWT
- Persistência de sessão com AsyncStorage
- Logout com confirmação
- Indicador visual de status da API (online / offline) na tela de login

### Dashboard
- Painel com contadores em tempo real: abrigos, vítimas, doações, necessidades
- Pull-to-refresh para atualizar os dados
- Ações rápidas de navegação
- Identificação do role do usuário (Admin / Voluntário)

### Abrigos
- Listagem com busca por nome, cidade ou status
- Detalhe de cada abrigo com endereço completo
- Status visual: ATIVO, LOTADO, INATIVO

### Vítimas
- Listagem com busca por nome, CPF ou abrigo
- Filtro por abrigo via chips horizontais
- Cadastro com validação de CPF e data de nascimento
- Edição e exclusão de registros
- Máscara automática de CPF e data

### Doações
- Listagem de todas as doações registradas
- Cadastro com seleção de tipo (Alimentos, Água, Roupas, Medicamentos, Higiene, Cobertores, Outros)
- Vinculação automática ao voluntário logado (extraído do JWT)
- Status: DISPONÍVEL, ENTREGUE, CANCELADA

### Necessidades
- Listagem das necessidades de cada abrigo
- Status: PENDENTE, ATENDIDA, CANCELADA

---

## Telas e navegação

```
/                   → Redireciona para /login ou /(tabs)
/login              → Tela de login com status da API
/register           → Cadastro de voluntário
/dashboard          → Alias para /(tabs)

/(tabs)
  ├── index         → Dashboard (painel geral)
  ├── abrigos       → Lista de abrigos
  ├── vitimas       → Lista de vítimas
  ├── doacoes       → Lista de doações
  └── necessidades  → Lista de necessidades

/abrigos/[id]       → Detalhe do abrigo
/vitimas/cadastro   → Cadastro / edição de vítima
/doacoes/cadastro   → Registro de doação
/doacoes/[id]       → Detalhe da doação
```

**Proteção de rota:** O `_layout.tsx` redireciona automaticamente usuários não autenticados para `/login` e usuários autenticados para fora da tela de login.

---

## Tecnologias

| Tecnologia | Uso |
|---|---|
| React Native | Framework mobile |
| Expo SDK 52+ | Toolchain e build |
| Expo Router | Navegação baseada em arquivos |
| TypeScript | Tipagem estática |
| Axios | Requisições HTTP com interceptors JWT |
| AsyncStorage | Persistência de token e sessão |
| React Native Safe Area Context | Suporte a notch e dynamic island |
| React Native Gesture Handler | Gestos nativos |
| Expo Vector Icons (Ionicons) | Ícones |

---

## Estrutura do projeto

```
mobile/
├── app/
│   ├── _layout.tsx           # Root layout + proteção de rotas
│   ├── index.tsx             # Redirect inicial
│   ├── login.tsx             # Tela de login + status da API
│   ├── register.tsx          # Cadastro de usuário
│   ├── dashboard.tsx         # Alias → /(tabs)
│   ├── (tabs)/
│   │   ├── _layout.tsx       # Bottom tab navigator
│   │   ├── index.tsx         # Dashboard
│   │   ├── abrigos.tsx       # Lista de abrigos
│   │   ├── vitimas.tsx       # Lista de vítimas
│   │   ├── doacoes.tsx       # Lista de doações
│   │   └── necessidades.tsx  # Lista de necessidades
│   ├── abrigos/[id].tsx      # Detalhe de abrigo
│   ├── vitimas/cadastro.tsx  # Cadastro/edição de vítima
│   ├── doacoes/cadastro.tsx  # Registro de doação
│   └── doacoes/[id].tsx      # Detalhe de doação
│
├── components/
│   ├── CustomButton.tsx      # Botão (variantes: solid, outline, danger)
│   ├── CustomInput.tsx       # Input com ícone, senha e erro
│   ├── Header.tsx            # Cabeçalho com back e ação
│   ├── Loading.tsx           # Indicador de carregamento
│   ├── EmptyState.tsx        # Estado vazio com ação opcional
│   ├── CardAbrigo.tsx
│   ├── CardVitima.tsx
│   ├── CardDoacao.tsx
│   └── CardNecessidade.tsx
│
├── services/
│   ├── api.ts                # Instância Axios centralizada + interceptors
│   ├── apiStatus.ts          # checkApiStatus()
│   ├── authService.ts        # login(), register()
│   ├── abrigoService.ts      # getAbrigos(), getAbrigoById(), count
│   ├── vitimaService.ts      # CRUD de vítimas + count
│   ├── doacaoService.ts      # CRUD de doações + count
│   └── necessidadeService.ts # getNecessidades() + count
│
├── hooks/
│   ├── useAuth.ts            # AuthProvider + useAuth()
│   └── useApi.ts             # useApi() + extractErrorMessage()
│
├── constants/
│   ├── colors.ts             # Paleta de cores (dark theme)
│   └── theme.ts              # Espaçamentos, fontes, bordas, sombras
│
├── types/
│   └── index.ts              # Tipos TypeScript do domínio
│
└── utils/
    ├── storage.ts            # AsyncStorage: token e usuário
    └── formatters.ts         # Máscaras CPF/data, decodificação JWT
```

---

## Pré-requisitos

- Node.js 18+
- npm
- Android Studio com emulador **ou** dispositivo físico com Expo Go
- A [API SmartDisaster](../API_smart) rodando na porta `8080`

---

## Como rodar

```bash
# 1. Instalar dependências
cd mobile
npm install

# 2. Iniciar o Expo (limpando cache)
npx expo start -c

# 3. Emulador Android → pressione 'a'
#    Dispositivo físico → escaneie o QR code com o Expo Go
```

> A API deve estar rodando antes de abrir o app.
> O indicador na tela de login mostrará **API Online** (verde) quando a conexão estiver ativa.

---

## Variáveis de ambiente

Por padrão a baseURL é `http://10.0.2.2:8080` (emulador Android aponta para o localhost da máquina).

Para usar dispositivo físico ou servidor remoto, crie `.env` na raiz do projeto mobile:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:8080
```

Ou via `app.json`:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://SEU_IP_LOCAL:8080"
    }
  }
}
```

---

## Integração com a API

Endpoints consumidos pelo app:

| Método | Rota | Descrição | Auth |
|---|---|---|---|
| POST | `/auth/register` | Cadastro de voluntário | Não |
| POST | `/auth/login` | Login e geração de JWT | Não |
| GET | `/actuator/health` | Status da API | Não |
| GET | `/abrigos` | Lista paginada de abrigos | Sim |
| GET | `/abrigos/{id}` | Detalhe de um abrigo | Sim |
| GET | `/vitimas` | Lista paginada de vítimas | Sim |
| GET | `/vitimas/{id}` | Detalhe de uma vítima | Sim |
| POST | `/vitimas` | Cadastrar vítima | Sim |
| PUT | `/vitimas/{id}` | Atualizar vítima | Sim |
| DELETE | `/vitimas/{id}` | Remover vítima | Sim |
| GET | `/doacoes` | Lista paginada de doações | Sim |
| GET | `/doacoes/{id}` | Detalhe de uma doação | Sim |
| POST | `/doacoes` | Registrar doação | Sim |
| GET | `/necessidades` | Lista de necessidades | Sim |

As respostas seguem o padrão **HATEOAS** com `_embedded` e `page.totalElements`.

---

## Autenticação

O app usa **JWT Bearer Token**:

1. Usuário faz login → API retorna `{ token, tipo, email, role }`
2. Token salvo no dispositivo via AsyncStorage
3. Todas as requisições incluem `Authorization: Bearer <token>` automaticamente (interceptor em `services/api.ts`)
4. Se a API retornar `401`, o app limpa a sessão e redireciona para `/login`

**Roles disponíveis:**

| Role | Permissões |
|---|---|
| `ADMIN` | Acesso completo a todos os recursos |
| `VOLUNTARIO` | Registro de doações e visualização geral |

---

## Autor

**Pedro Vaz**
pedrovazferreira10@gmail.com
FIAP — Global Solution 2026/1
