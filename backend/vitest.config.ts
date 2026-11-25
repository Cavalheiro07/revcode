import { defineConfig } from 'vitest/config';

const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? 'postgresql://revcode:revcode@localhost:55432/revcode_test';

export default defineConfig({
  test: {
    globalSetup: ['./test/global-setup.ts'],
    // Os arquivos compartilham o mesmo banco de teste.
    fileParallelism: false,
    env: { DATABASE_URL: testDatabaseUrl },
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});
