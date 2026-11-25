import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get('/health', { schema: { tags: ['health'], summary: 'Status da API e do banco' } }, async (_req, reply) => {
    try {
      await app.deps.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', database: 'ok' };
    } catch {
      return reply.status(503).send({ status: 'degraded', database: 'down' });
    }
  });
};
