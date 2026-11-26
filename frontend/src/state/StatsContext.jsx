import { createContext, useContext } from 'react';
import { useApi } from '../lib/useApi.js';

// Métricas do usuário (GET /me/stats): streak do cabeçalho, painel e evolução.
// Fica num contexto para o cabeçalho e a página dividirem a mesma busca; reload() depois de um envio.
const StatsContext = createContext(null);

export function StatsProvider({ children }) {
  const stats = useApi('/me/stats');
  return <StatsContext.Provider value={stats}>{children}</StatsContext.Provider>;
}

export function useStats() {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error('useStats precisa estar dentro de <StatsProvider>');
  return ctx;
}
