# RevCode: backend

API REST em Node 22 + Fastify 5 + Prisma + PostgreSQL 16, com validação por Zod e documentação OpenAPI (Swagger).

## Rodar

```bash
cd backend
cp .env.example .env
docker compose up -d --build
```

API em http://localhost:3333/api, saúde em http://localhost:3333/api/health e Swagger em
http://localhost:3333/api/docs. As migrations rodam sozinhas quando a API sobe.

## Desenvolver fora do Docker

Com o Postgres do `docker compose` no ar (porta 55432):

```bash
npm install
npx prisma generate
npm run dev
```

## Qualidade

```bash
npm run lint          # ESLint
npm run format:check  # Prettier
npm run typecheck     # TypeScript
npm test              # Vitest, contra o banco revcode_test
```
