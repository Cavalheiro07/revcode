import { PrismaClient } from '@prisma/client';
import { afterAll, beforeEach } from 'vitest';
import { buildApp, type App } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import type { Clock } from '../src/lib/clock.js';

export const prisma = new PrismaClient();

// Relógio controlável. Começa num sábado, 4/10/2026, meio-dia em Brasília.
export class TestClock implements Clock {
  private current = new Date('2026-10-04T12:00:00-03:00');
  now() {
    return new Date(this.current);
  }
  set(iso: string) {
    this.current = new Date(iso);
  }
}

export async function resetDb() {
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  if (tables.length === 0) return;
  const list = tables.map((t) => `"public"."${t.tablename}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} CASCADE`);
}

export async function makeApp(overrides: Record<string, string> = {}) {
  const clock = new TestClock();
  const config = loadConfig({
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: 'segredo-de-teste-com-mais-de-16',
    LOG_LEVEL: 'silent',
    AUTH_RATE_LIMIT_MAX: '1000',
    ...overrides,
  });
  const app = await buildApp({ config, prisma, clock });
  await app.ready();
  return { app, clock };
}

/** Prepara um app novo e um banco vazio para cada teste do arquivo. */
export function setupTestApp(overrides: Record<string, string> = {}) {
  const ctx = {} as { app: App; clock: TestClock };
  beforeEach(async () => {
    await resetDb();
    if (ctx.app) await ctx.app.close();
    Object.assign(ctx, await makeApp(overrides));
  });
  afterAll(async () => {
    if (ctx.app) await ctx.app.close();
    await prisma.$disconnect();
  });
  return ctx;
}
