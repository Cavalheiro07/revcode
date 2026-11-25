import { PrismaClient } from '@prisma/client';
import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import { systemClock } from './lib/clock.js';

const config = loadConfig();
const prisma = new PrismaClient();
const app = await buildApp({ config, prisma, clock: systemClock });

const shutdown = async () => {
  await app.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

try {
  await app.listen({ port: config.PORT, host: config.HOST });
} catch (err) {
  app.log.error(err);
  await prisma.$disconnect();
  process.exit(1);
}
