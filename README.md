# SmartDisaster

> Plataforma integrada de gestão de resposta a desastres — FIAP Global Solution 2026/1 · Economia Espacial

---

## Integrantes

| Nome | RM |
|---|---|
| Pedro Vaz | RM566551 |
| João Victor Luiz Oliveira Resende | RM565139 |

---

## Links importantes

| Recurso | URL |
|---|---|
| Vídeo Pitch | https://youtu.be/ItPEbWxzNkw |
| Vídeo de explicação do projeto | https://youtu.be/pk97vHmkX98 |
| Deploy da API | https://smartdisasterjava-production.up.railway.app |
| Swagger da API | https://smartdisasterjava-production.up.railway.app/swagger-ui.html |

---

## Sobre o projeto

O **SmartDisaster** é uma plataforma de gestão de resposta a desastres naturais que conecta tecnologia espacial a situações de emergência. O app permite que voluntários e administradores coordenem em campo, pelo celular, o cadastro e o monitoramento de abrigos, vítimas, doações e necessidades — enquanto o painel exibe em tempo real os eventos naturais ativos detectados por satélite via **NASA EONET API**.

---

## Objetivo da solução

O sistema centraliza todas as operações críticas de resposta a emergências em um único lugar:

- **Abrigos** — cadastro, capacidade, localização, status (ativo / lotado / inativo)
- **Vítimas** — registro com condição de saúde e vínculo ao abrigo
- **Voluntários** — cadastro com autenticação JWT e controle de perfil
- **Doações** — registro, entrega e cancelamento por voluntários
- **Necessidades** — o que cada abrigo precisa, com status de atendimento
- **Alertas em tempo real** — integração com NASA EONET para eventos naturais ativos (enchentes, incêndios, tempestades, vulcões)
- **Engine de matching** — pareamento automático de doações disponíveis com necessidades pendentes

---

## Tecnologias utilizadas

### Backend / API

| Tecnologia | Uso |
|---|---|
| Java 17 | Linguagem principal |
| Spring Boot 3.2.4 | Framework REST |
| Spring Security | Autenticação e autorização |
| Spring Data JPA / Hibernate | ORM e acesso a dados |
| Spring HATEOAS | Respostas hipermídia |
| JJWT 0.11.5 | Geração e validação de JWT |
| SpringDoc OpenAPI 2.3.0 | Documentação Swagger |
| Lombok | Redução de boilerplate |
| Maven | Build e dependências |

### Mobile

| Tecnologia | Uso |
|---|---|
| React Native 0.78 | Framework mobile |
| Expo SDK 54 | Toolchain e build |
| Expo Router 4 | Navegação baseada em arquivos |
| TypeScript 5.3 | Tipagem estática |
| Axios 1.7 | Requisições HTTP com interceptors JWT |
| AsyncStorage | Persistência de token e sessão |
| React Native Reanimated | Animações |
| Expo Vector Icons (Ionicons) | Ícones |



### Outras bibliotecas

- **NASA EONET API** — feed de desastres naturais em tempo real
- **ESLint + Prettier** — qualidade e formatação de código (mobile)

---

## Funcionalidades

### Login e autenticação
- Cadastro de voluntário com nome, e-mail e senha
- Login com retorno de JWT Bearer Token
- Persistência de sessão no dispositivo via AsyncStorage
- Logout com confirmação
- Indicador visual de status da API (online / offline) na tela de login
- Proteção de rotas: usuários não autenticados são redirecionados automaticamente para `/login`

### Dashboard
- Contadores em tempo real: total de abrigos, vítimas, doações e necessidades
- Nível de alerta calculado dinamicamente com base nos eventos NASA (Normal / Atenção / Alto / Crítico)
- Feed de desastres naturais ativos via NASA EONET
- Pull-to-refresh

### Gestão de abrigos (CRUD completo)
- Listagem com busca por nome, cidade ou status
- Cadastro com endereço completo (rua, número, bairro, cidade, estado, CEP) e coordenadas GPS
- Edição e exclusão (exclusão lógica — status muda para INATIVO)
- Tela de detalhe com vítimas acolhidas e necessidades do abrigo
- Barra visual de ocupação (total de vítimas vs. capacidade máxima)
- Status: ATIVO, LOTADO, INATIVO — alterado automaticamente por leitura de sensor

### Gestão de vítimas (CRUD completo)
- Listagem com busca por nome ou CPF
- Cadastro com CPF (máscara automática), data de nascimento e condição de saúde
- Edição e exclusão de registros
- Vínculo com o abrigo

### Gestão de doações
- Listagem de todas as doações registradas
- Cadastro com tipo, descrição, quantidade e vínculo ao abrigo/necessidade
- Ações: marcar como entregue, cancelar, excluir
- Doação vinculada automaticamente ao voluntário logado

### Gestão de necessidades
- Cada abrigo lista suas necessidades com tipo, quantidade e status
- Status: PENDENTE, ATENDIDA
- Atendimento automático via engine de matching

### Alertas (NASA EONET)
- Feed de eventos naturais ativos em tempo real
- Categorias: tempestades, enchentes, incêndios, vulcões, terremotos etc.
- Exibe localização e data do evento

### Engine de matching (backend)
- `POST /matching/executar` percorre doações disponíveis e necessidades pendentes do mesmo tipo
- Cria registro de `MatchingDoacaoNecessidade`
- Atualiza status da doação para ENTREGUE e da necessidade para ATENDIDA automaticamente

### Monitoramento por sensor (backend)
- `POST /sensor/leitura` registra ocupação atual e temperatura de um abrigo
- Quando `ocupacaoAtual >= capacidadeMaxima`, o status do abrigo é alterado automaticamente para LOTADO

---

## Estrutura do projeto

```
Desktop/
├── mobile/             # App React Native (Expo) — este repositório
└── API_smart/          # API REST Spring Boot
```

### Mobile (`mobile/`)

```
mobile/
├── app/
│   ├── _layout.tsx              # Root layout + proteção de rotas
│   ├── index.tsx                # Redirect inicial
│   ├── boasvindas.tsx           # Onboarding (apenas no primeiro acesso)
│   ├── login.tsx                # Tela de login
│   ├── register.tsx             # Cadastro de voluntário
│   ├── sobre.tsx                # Sobre o projeto
│   ├── (tabs)/
│   │   ├── _layout.tsx          # Bottom tab navigator (5 abas)
│   │   ├── index.tsx            # Dashboard
│   │   ├── abrigos.tsx          # Lista de abrigos
│   │   ├── vitimas.tsx          # Lista de vítimas
│   │   ├── doacoes.tsx          # Doações
│   │   └── alertas.tsx          # Alertas NASA
│   ├── abrigos/
│   │   ├── [id].tsx             # Detalhe do abrigo
│   │   └── cadastro.tsx         # Cadastro / edição
│   ├── vitimas/
│   │   └── cadastro.tsx         # Cadastro / edição
│   └── doacoes/
│       ├── [id].tsx             # Detalhe da doação
│       ├── cadastro.tsx         # Registrar doação
│       └── novo/[abrigoId].tsx  # Nova doação por abrigo
├── components/                  # Componentes reutilizáveis
├── services/                    # Camada de acesso à API (Axios)
├── hooks/                       # useAuth, useApi
├── constants/                   # Cores e tema
├── types/                       # Tipos TypeScript do domínio
└── utils/                       # Máscaras, formatadores, AsyncStorage
```

### API (`API_smart/`)

```
API_smart/
└── src/main/java/br/com/fiap/smartdisaster/
    ├── config/          # SecurityConfig, CorsConfig, OpenApiConfig, DataLoader
    ├── controller/      # AuthController, AbrigoController, VitimaController,
    │                    # DoacaoController, NecessidadeController,
    │                    # SensorController, MatchingController
    ├── service/         # Lógica de negócio (7 services)
    ├── repository/      # Spring Data JPA (8 repositórios)
    ├── entity/          # Entidades JPA: Usuario, Admin, Voluntario, Abrigo,
    │                    # Vitima, Doacao, Necessidade, SensorLeitura
    ├── dto/             # Request e Response DTOs
    ├── enums/           # Role, StatusAbrigo, StatusDoacao, StatusNecessidade
    └── security/        # JwtTokenProvider, JwtAuthFilter, UserDetailsServiceImpl
```

---

## Como executar o backend

### Pré-requisitos
- Java 17+
- Maven 3.8+ (ou use o `mvnw` incluído no projeto)

### Passos

```bash
# 1. Entrar na pasta da API
cd API_smart

# 2. Compilar e instalar dependências
mvn clean install

# 3. Subir a aplicação
mvn spring-boot:run
```

Ou, sem Maven instalado localmente:

```bash
./mvnw spring-boot:run        # Linux/Mac
mvnw.cmd spring-boot:run      # Windows
```

### Informações da API

| Item | Valor |
|---|---|
| Porta padrão | `8080` |
| Banco de dados | H2 in-memory (zero configuração) |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| OpenAPI JSON | http://localhost:8080/v3/api-docs |
| Console H2 | http://localhost:8080/h2-console |

**Configuração H2 Console:**
- JDBC URL: `jdbc:h2:mem:smartdisaster`
- Usuário: `sa`
- Senha: *(deixar em branco)*

> O banco é recriado a cada reinicialização. O `DataLoader` insere dados de exemplo automaticamente na primeira execução.

### Usuários de teste (inseridos pelo DataLoader)

| Perfil | E-mail | Senha | Permissões |
|---|---|---|---|
| Admin | admin@smartdisaster.com | `123456` | Acesso completo |
| Voluntário | voluntario@smartdisaster.com | `123456` | Cadastrar doações e vítimas, visualizar |
| Voluntária | ana@smartdisaster.com | `vol123` | Cadastrar doações e vítimas, visualizar |

### Dados de exemplo incluídos

- 6 abrigos (SP, RS, RJ)
- 3 vítimas
- 9 necessidades
- 4 doações

### application.properties (dev — H2)

Arquivo em `src/main/resources/application.properties`. Não requer alteração para rodar localmente.

Para usar Oracle em produção, ative o profile:

```bash
mvn spring-boot:run -Dspring.profiles.active=oracle
```

E configure as variáveis de ambiente: `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.

---

## Como executar o mobile

### Pré-requisitos
- Node.js 18+
- npm
- Android Studio com emulador Android **ou** dispositivo físico com o app **Expo Go** instalado
- API SmartDisaster rodando na porta `8080`

### Passos

```bash
# 1. Entrar na pasta do app
cd mobile

# 2. Instalar dependências
npm install

# 3. Iniciar o Expo (limpa cache)
npx expo start -c
```

No terminal do Expo:
- Pressione `a` para abrir no emulador Android
- Escaneie o QR code com o app **Expo Go** para rodar em dispositivo físico

### Configuração da URL da API

Crie um arquivo `.env` na raiz do projeto mobile com a URL da API:

**Opção 1 — API em produção (Railway, recomendado):**

```env
EXPO_PUBLIC_API_URL=https://smartdisasterjava-production.up.railway.app
```

**Opção 2 — API rodando localmente:**

```env
EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
```

> `10.0.2.2` é o endereço do `localhost` da máquina host visto pelo emulador Android. Para dispositivo físico, use o IP da sua rede Wi-Fi (descubra com `ipconfig` no Windows ou `ifconfig` no Mac/Linux), ex: `http://192.168.x.x:8080`.

A variável é lida em `services/api.ts`:

```ts
// services/api.ts
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:8080';
```

---

## Autenticação

O app usa **JWT Bearer Token**:

1. Usuário faz login → API retorna `{ token, tipo, email, role }`
2. Token salvo no dispositivo via AsyncStorage
3. Todas as requisições incluem `Authorization: Bearer <token>` automaticamente via interceptor do Axios
4. Se a API retornar `401`, o app limpa a sessão e redireciona para `/login`

| Role | Permissões |
|---|---|
| `ADMIN` | Acesso completo — criar, editar e excluir todos os recursos |
| `VOLUNTARIO` | Cadastrar doações e vítimas, visualizar abrigos e necessidades |

---

## Principais endpoints da API

Todos os endpoints estão documentados e testáveis via Swagger em `http://localhost:8080/swagger-ui.html`.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | Cadastro de voluntário |
| POST | `/auth/login` | Login e geração de JWT |
| GET | `/abrigos` | Lista paginada de abrigos (HATEOAS) |
| GET | `/abrigos/{id}` | Detalhe de um abrigo |
| POST | `/abrigos` | Cadastrar abrigo (ADMIN) |
| PUT | `/abrigos/{id}` | Atualizar abrigo (ADMIN) |
| DELETE | `/abrigos/{id}` | Inativar abrigo (soft delete, ADMIN) |
| GET | `/vitimas` | Lista paginada de vítimas |
| POST | `/vitimas` | Cadastrar vítima |
| GET | `/doacoes` | Lista paginada de doações |
| POST | `/doacoes` | Registrar doação |
| PATCH | `/doacoes/{id}/entregar` | Marcar doação como entregue |
| PATCH | `/doacoes/{id}/cancelar` | Cancelar doação |
| GET | `/necessidades` | Lista de necessidades |
| POST | `/necessidades` | Cadastrar necessidade (ADMIN) |
| POST | `/sensor/leitura` | Registrar leitura de sensor |
| POST | `/matching/executar` | Executar matching doações × necessidades |
