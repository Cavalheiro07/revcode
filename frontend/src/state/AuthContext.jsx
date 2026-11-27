import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, getToken, setToken, setUnauthorizedHandler } from '../lib/api.js';
import { translate } from '../i18n/index.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setTokenState] = useState(getToken);
  const [user, setUser] = useState(null);
  // checking: validando o token salvo com GET /me; error: a API não respondeu
  const [status, setStatus] = useState(() => (getToken() ? 'checking' : 'ready'));
  const [notice, setNotice] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const clear = useCallback(() => {
    setToken(null);
    setTokenState(null);
    setUser(null);
    setStatus('ready');
  }, []);

  // Qualquer 401 com token: sessão expirada, volta para a entrada.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clear();
      setNotice(translate('Sua sessão expirou. Entre de novo.'));
    });
    return () => setUnauthorizedHandler(() => {});
  }, [clear]);

  // Valida o token salvo ao carregar a página.
  useEffect(() => {
    if (!token || user) return undefined;
    let alive = true;
    setStatus('checking');
    api('/me')
      .then((me) => {
        if (!alive) return;
        setUser(me);
        setStatus('ready');
      })
      .catch((err) => {
        if (!alive || err.status === 401) return; // o handler de 401 já limpou
        setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [token, user, attempt]);

  const start = useCallback((data) => {
    setToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    setNotice(null);
    setStatus('ready');
  }, []);

  const login = useCallback(
    async (email, password) =>
      start(await api('/auth/login', { method: 'POST', body: { email, password }, auth: false })),
    [start],
  );

  const register = useCallback(
    async (name, email, password) =>
      start(await api('/auth/register', { method: 'POST', body: { name, email, password }, auth: false })),
    [start],
  );

  // Sair (ou excluir a conta) leva para a entrada sem lembrar a página: o próximo login começa em /hoje.
  const logout = useCallback(() => {
    clear();
    setNotice(null);
    navigate('/', { replace: true });
  }, [clear, navigate]);

  const value = useMemo(
    () => ({
      token,
      user,
      status,
      notice,
      login,
      register,
      logout,
      setUser,
      retry: () => setAttempt((n) => n + 1),
    }),
    [token, user, status, notice, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
