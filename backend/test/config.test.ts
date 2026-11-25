import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

const base = { DATABASE_URL: 'postgresql://u:p@localhost:5432/db', JWT_SECRET: 'segredo-com-mais-de-16' };

describe('configuração', () => {
  it('recusa subir com fuso horário inválido', () => {
    expect(() => loadConfig({ ...base, TIMEZONE: 'America/SaoPaulo' })).toThrow(/TIMEZONE/);
  });

  it('recusa segredo do JWT curto', () => {
    expect(() => loadConfig({ ...base, JWT_SECRET: 'curto' })).toThrow(/JWT_SECRET/);
  });

  it('usa o fuso de Brasília por padrão', () => {
    expect(loadConfig(base).TIMEZONE).toBe('America/Sao_Paulo');
  });
});
