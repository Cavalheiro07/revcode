import { execSync } from 'node:child_process';

// Aplica as migrations no banco de teste uma vez antes da suíte.
export default function setup() {
  const url = process.env.TEST_DATABASE_URL ?? 'postgresql://revcode:revcode@localhost:55432/revcode_test';
  execSync('npx prisma migrate deploy', {
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit',
  });
}
