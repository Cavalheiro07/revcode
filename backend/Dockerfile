FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Compila o TypeScript
FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build

# Imagem final: só dependências de produção (prisma e tsx ficam para migrations e seed)
FROM base AS runtime
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
RUN npx prisma generate
COPY --from=build /app/dist ./dist
COPY docker/entrypoint.sh ./entrypoint.sh
EXPOSE 3333
CMD ["sh", "./entrypoint.sh"]
