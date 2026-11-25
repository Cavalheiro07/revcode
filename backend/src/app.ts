import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { PrismaClient } from '@prisma/client';
import Fastify, { type FastifyError } from 'fastify';
import {
  hasZodFastifySchemaValidationErrors,
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import type { Config } from './config.js';
import type { Clock } from './lib/clock.js';
import { AppError } from './lib/errors.js';
import { healthRoutes } from './modules/health.js';

export interface AppDeps {
  config: Config;
  prisma: PrismaClient;
  clock: Clock;
}

declare module 'fastify' {
  interface FastifyInstance {
    deps: AppDeps;
  }
}

export async function buildApp(deps: AppDeps) {
  const { config } = deps;
  const app = Fastify({
    logger: config.LOG_LEVEL === 'silent' ? false : { level: config.LOG_LEVEL },
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.decorate('deps', deps);

  await app.register(cors, { origin: config.CORS_ORIGIN.split(',').map((o) => o.trim()) });
  await app.register(swagger, {
    openapi: {
      info: { title: 'RevCode API', version: '0.1.0' },
      components: {
        securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
      },
    },
    transform: jsonSchemaTransform,
  });
  await app.register(swaggerUi, { routePrefix: '/api/docs' });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: { code: error.code, message: error.message } });
    }
    if (hasZodFastifySchemaValidationErrors(error)) {
      const first = error.validation[0];
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: first?.message ?? 'Dados inválidos.',
          details: error.validation.map((v) => ({ path: v.instancePath, message: v.message })),
        },
      });
    }
    if (error.statusCode === 429) {
      return reply
        .status(429)
        .send({ error: { code: 'RATE_LIMITED', message: 'Muitas tentativas. Tente de novo em instantes.' } });
    }
    if (error.statusCode && error.statusCode < 500) {
      return reply
        .status(error.statusCode)
        .send({ error: { code: error.code ?? 'BAD_REQUEST', message: error.message } });
    }
    request.log.error(error);
    return reply.status(500).send({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno.' } });
  });

  app.setNotFoundHandler((request, reply) => {
    reply
      .status(404)
      .send({ error: { code: 'NOT_FOUND', message: `Rota ${request.method} ${request.url} não existe.` } });
  });

  await app.register(
    async (api) => {
      await api.register(healthRoutes);
    },
    { prefix: '/api' },
  );

  return app;
}

export type App = Awaited<ReturnType<typeof buildApp>>;
