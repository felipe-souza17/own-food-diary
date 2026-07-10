# 🥗 Diário Alimentar

Sistema pessoal de diário alimentar com painel administrativo e **compartilhamento público somente leitura**. Registre refeições com fotos, observações e compartilhe seu diário por um link com token aleatório — quem tem o link só visualiza, nunca edita. Fiz apenas para minha nutricionista acompanhar o que eu como.

## Stack

| Camada         | Tecnologia                                  |
| -------------- | ------------------------------------------- |
| Framework      | Next.js 15 (App Router) + React 19          |
| Linguagem      | TypeScript (strict)                         |
| Estilo         | TailwindCSS 4                               |
| Banco de dados | PostgreSQL (Neon) via Prisma ORM            |
| Autenticação   | Auth.js (NextAuth v5) — credenciais via env |
| Upload         | Vercel Blob Storage (client upload)         |
| Formulários    | React Hook Form + Zod                       |
| UX             | sonner (toasts), lucide-react (ícones)      |

## Arquitetura

```
src/
├── app/                  # Rotas (App Router)
│   ├── admin/            # Painel protegido (dashboard, refeições, configurações)
│   ├── login/            # Tela de login
│   ├── share/[token]/    # Página pública somente leitura (ISR)
│   └── api/              # Auth.js handler + assinatura de upload do Blob
├── actions/              # Server Actions (validação Zod + guarda de sessão)
├── services/             # Regras de negócio
├── repositories/         # Acesso a dados (Prisma)
├── components/           # UI (design system, layout, refeições, público)
├── validators/           # Schemas Zod compartilhados client/server
├── lib/                  # Infra: prisma, auth, constantes, utils
├── hooks/                # Hooks client-side
├── types/                # Tipos compartilhados
└── middleware.ts         # Proteção de /admin/* (Edge)
prisma/
├── schema.prisma         # Models: Meal, MealImage, ShareLink
└── migrations/           # Migration inicial pronta para `migrate deploy`
```

**Fluxo de dependência (uma direção só):** `app/components → actions → services → repositories → Prisma`.

**Segurança:** o middleware é apenas a primeira barreira; **toda** Server Action e rota de API revalida a sessão no servidor (`requireAdmin()`). A página pública valida o token no banco e não expõe nenhuma mutação.

---

## 1. Instalação

Pré-requisito: Node.js 20+.

```bash
npm install
```

O `postinstall` já executa o `prisma generate` automaticamente.

## 2. Configuração das variáveis de ambiente

Copie o exemplo e preencha:

```bash
cp .env.example .env
```

| Variável                | Descrição                                                         |
| ----------------------- | ----------------------------------------------------------------- |
| `DATABASE_URL`          | Connection string do PostgreSQL (Neon)                            |
| `NEXTAUTH_SECRET`       | Segredo dos tokens de sessão — gere com `openssl rand -base64 32` |
| `NEXTAUTH_URL`          | `http://localhost:3000` local; URL do site em produção            |
| `BLOB_READ_WRITE_TOKEN` | Token do Vercel Blob Storage                                      |
| `ADMIN_EMAIL`           | Email do administrador (único usuário)                            |
| `ADMIN_PASSWORD`        | Senha do administrador                                            |

> Não existe cadastro: o login compara as credenciais com `ADMIN_EMAIL`/`ADMIN_PASSWORD` (comparação em tempo constante). Para trocar a senha, altere a variável e reinicie/redeploye.

## 3. Banco de dados (Neon)

1. Crie um projeto em [console.neon.tech](https://console.neon.tech).
2. Copie a **connection string** (algo como `postgresql://usuario:senha@ep-xxxx.aws.neon.tech/neondb?sslmode=require`).
3. Cole no `.env` em `DATABASE_URL`.

### Executar as migrations

A migration inicial já está criada em `prisma/migrations/`. Basta aplicar:

```bash
npm run db:migrate        # prisma migrate deploy — aplica as migrations existentes
```

Para desenvolvimento contínuo (criar novas migrations ao alterar o schema):

```bash
npm run db:migrate:dev    # prisma migrate dev
```

### Prisma Generate

Roda automaticamente no `npm install`, mas pode ser executado manualmente:

```bash
npm run db:generate
```

Outros utilitários: `npm run db:studio` abre o Prisma Studio.

## 4. Vercel Blob Storage

1. No painel da [Vercel](https://vercel.com), abra seu projeto → aba **Storage** → **Create Database** → **Blob**.
2. Conecte o store ao projeto — a variável `BLOB_READ_WRITE_TOKEN` é criada automaticamente no ambiente da Vercel.
3. Para desenvolvimento local, copie o valor do token (aba **`.env.local`** do store) para o seu `.env`.

O upload é feito **direto do navegador para o Blob** (client upload): a rota `/api/upload` apenas assina o token — e somente para o administrador autenticado — restringindo tipos (JPEG, PNG, WebP, AVIF, GIF) e tamanho (5 MB).

## 5. Rodando localmente

```bash
npm run dev       # desenvolvimento (http://localhost:3000)
npm run build     # build de produção
npm run start     # servir o build
npm run lint      # ESLint
npm run format    # Prettier
npm run typecheck # TypeScript
```

Acesse `http://localhost:3000`, faça login com `ADMIN_EMAIL`/`ADMIN_PASSWORD` e comece a registrar refeições.

## 6. Deploy na Vercel

1. Suba o repositório para o Git (GitHub/GitLab/Bitbucket).
2. Na Vercel: **Add New → Project** → importe o repositório (framework Next.js é detectado automaticamente).
3. Em **Settings → Environment Variables**, configure:
   `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (URL final do site), `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
4. Conecte o **Blob Storage** (passo 4) — o `BLOB_READ_WRITE_TOKEN` entra sozinho.
5. Aplique as migrations no banco Neon (uma vez, do seu terminal):
   ```bash
   npm run db:migrate
   ```
6. **Deploy.**

> O `prisma generate` roda no build da Vercel via `postinstall` — nenhum ajuste extra é necessário.

## Funcionalidades

- **Dashboard** — métricas (refeições, fotos, status do link) e últimos registros.
- **CRUD de refeições** — criar, editar, excluir (com confirmação), listar, pesquisar e ordenar por data, com paginação.
- **Tipos de refeição** — café da manhã, lanche da manhã, almoço, lanche da tarde, jantar, ceia e outro.
- **Múltiplas imagens por refeição** — preview imediato, loading por arquivo, tratamento de erro com retry e remoção (limpando o storage).
- **Compartilhar** — botão gera um token aleatório (`/share/5Lx8AaPqN2Xj…`); a página pública agrupa as refeições por data, exibe fotos, descrição e observações, é responsiva e 100% somente leitura (com `noindex`). Em Configurações é possível copiar, regenerar (invalida o anterior) ou desativar o link.
- **UX** — skeletons, empty states, error boundaries, toasts.
- **Performance** — Server Components por padrão, ISR na página pública (revalidação de 60s + on-demand nas mutações), `next/image` para otimização de imagens.
