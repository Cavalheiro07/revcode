import { z } from 'zod';

function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat('en-CA', { timeZone });
    return true;
  } catch {
    return false;
  }
}

const ConfigSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3333),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  TIMEZONE: z.string().default('America/Sao_Paulo').refine(isValidTimeZone, 'fuso horário IANA inválido'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET precisa ter pelo menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  // Serviço das IAs (api.py do repositório revcode_datasets): gera os desafios que o admin importa como rascunho.
  IA_URL: z.string().url().default('http://127.0.0.1:8000/v1'),
  // O token de administração do serviço das IAs (o --token dele). Fica só aqui no backend.
  IA_ADMIN_TOKEN: z.string().default(''),
  IA_TIMEOUT_MS: z.coerce.number().int().positive().default(10_000),
  // MongoDB das preferências (tema e plano premium). Vazio: usa memória, que some ao reiniciar a API.
  MONGO_URL: z.string().default(''),
  MONGO_DB: z.string().min(1).default('revcode'),
});

export type Config = z.infer<typeof ConfigSchema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = ConfigSchema.safeParse(env);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Configuração inválida:\n${problems}`);
  }
  return parsed.data;
}
