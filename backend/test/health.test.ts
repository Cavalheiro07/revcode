import { describe, expect, it } from 'vitest';
import { setupTestApp } from './helpers.js';

const ctx = setupTestApp();

describe('saúde', () => {
  it('informa que a API e o banco estão de pé', async () => {
    const res = await ctx.app.inject({ method: 'GET', url: '/api/health' });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: 'ok', database: 'ok' });
  });
});
