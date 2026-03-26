# Fantasy Portal — versão pronta para Vercel

Projeto full-stack com:
- Next.js 15
- Prisma ORM
- PostgreSQL remoto
- autenticação por cookie JWT
- área pública
- painel do usuário
- painel admin
- compartilhamento por link
- personalização de perfil

## O que foi ajustado para produção
- trocado de SQLite para **PostgreSQL**
- `build` corrigido para Vercel
- tipos de `bcryptjs` adicionados
- cookie seguro em produção
- middleware para proteger rotas privadas
- `.env.example` atualizado
- perfil agora tem **bio, avatar, banner e cor de destaque**

## Importante
O projeto está pronto para **Vercel + banco PostgreSQL remoto**.

O upload atual salva em `public/uploads` e funciona bem **localmente**.
Para produção real na Vercel, use um storage externo:
- Supabase Storage
- Vercel Blob
- Cloudinary

## 1. Rodar localmente

```bash
npm install
cp .env.example .env
```

Edite o `.env` com sua `DATABASE_URL` e `JWT_SECRET`.

Depois rode:

```bash
npx prisma db push
npm run db:seed
npm run dev
```

## 2. Deploy na Vercel

### Build and Output Settings
Use assim:

- **Install Command**
```bash
npm install
```

- **Build Command**
```bash
npm run build
```

- **Output Directory**
```bash
.next
```

## 3. Variáveis de ambiente na Vercel
Crie estas variáveis em:

**Project Settings → Environment Variables**

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require
JWT_SECRET=sua-chave-super-segura-com-32-caracteres-ou-mais
NEXT_PUBLIC_APP_URL=https://seu-projeto.vercel.app
ADMIN_EMAIL=admin@portal.com
ADMIN_PASSWORD=12345678
```

## 4. Banco recomendado
Use um destes:
- Neon
- Supabase
- Railway
- Vercel Postgres

## 5. Primeiro setup do banco remoto
Depois de configurar a `DATABASE_URL`, rode localmente:

```bash
npx prisma db push
npm run db:seed
```

Isso cria as tabelas e o usuário admin.

## 6. Login admin padrão
- email: definido em `ADMIN_EMAIL`
- senha: definida em `ADMIN_PASSWORD`

## 7. Perfil personalizável
Cada usuário pode editar:
- nome
- bio
- avatar por URL
- banner por URL
- cor de destaque

Página:
```bash
/profile
```

## 8. Estrutura principal
```txt
app/
  admin/
  api/
  dashboard/
  login/
  profile/
  register/
  share/
  universes/
components/
lib/
prisma/
public/
middleware.ts
```

## 9. Próximo upgrade recomendado
Se quiser endurecer isso mais ainda para produção real, o próximo passo é:
1. trocar JWT manual por Auth.js ou Supabase Auth
2. mover uploads para Supabase Storage
3. criar edição de universo
4. criar comentários públicos autenticados
5. criar paginação e busca
