import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { setCurrentLanguage } from '../i18n/index.jsx';
import { useAuth } from './AuthContext.jsx';

const THEME_KEY = 'revcode:theme';
const LANG_KEY = 'revcode:lang';
const THEMES = ['light', 'dark', 'system'];

// Idioma da interface salvo neste navegador; sem escolha, segue o idioma do navegador.
function readLocalLanguage() {
  try {
    const v = localStorage.getItem(LANG_KEY);
    return v === 'pt' || v === 'en' ? v : null;
  } catch {
    return null;
  }
}

function writeLocalLanguage(language) {
  try {
    localStorage.setItem(LANG_KEY, language);
  } catch {
    // sem storage: vale só até fechar a aba
  }
}

function initialLanguage() {
  const saved = readLocalLanguage();
  if (saved) return saved;
  return typeof navigator !== 'undefined' && /^en/i.test(navigator.language ?? '') ? 'en' : 'pt';
}

// Escolha de tema salva neste navegador. Vale também sem login (tela de entrada) e evita piscar ao abrir.
function readLocalTheme() {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return THEMES.includes(v) ? v : null;
  } catch {
    return null;
  }
}

function writeLocalTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // sem storage: vale só até fechar a aba
  }
}

const darkQuery = () =>
  typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

function resolveTheme(theme) {
  if (theme === 'light' || theme === 'dark') return theme;
  return darkQuery()?.matches ? 'dark' : 'light';
}

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState(() => readLocalTheme() ?? 'system');
  const [resolved, setResolved] = useState(() => resolveTheme(readLocalTheme() ?? 'system'));
  const [premium, setPremium] = useState({ active: false, plan: null, since: null });
  const [language, setLanguageState] = useState(() => {
    const initial = initialLanguage();
    setCurrentLanguage(initial);
    document.documentElement.setAttribute('lang', initial === 'en' ? 'en' : 'pt-BR');
    return initial;
  });
  const [loaded, setLoaded] = useState(false);

  // O idioma "global" (usado por categoryLabel, formatDay etc.) tem de estar certo já neste render, antes
  // de os filhos desenharem; por isso é definido aqui e não num efeito.
  setCurrentLanguage(language);
  useEffect(() => {
    document.documentElement.setAttribute('lang', language === 'en' ? 'en' : 'pt-BR');
  }, [language]);

  // Aplica o tema na página e, no modo automático, acompanha o sistema operacional.
  useEffect(() => {
    const apply = () => {
      const next = resolveTheme(theme);
      setResolved(next);
      document.documentElement.setAttribute('data-theme', next);
    };
    apply();
    const mq = darkQuery();
    if (theme !== 'system' || !mq) return undefined;
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);

  // Ao entrar, busca as preferências da conta. A escolha salva na conta vale em qualquer aparelho;
  // se a conta ainda não tem escolha, a deste navegador sobe para ela.
  const userId = user?.id;
  useEffect(() => {
    if (!userId) {
      setPremium({ active: false, plan: null, since: null });
      setLoaded(false);
      return undefined;
    }
    let alive = true;
    api('/me/preferences')
      .then((prefs) => {
        if (!alive) return;
        setPremium(prefs.premium);
        if (prefs.language) {
          setLanguageState(prefs.language);
          writeLocalLanguage(prefs.language);
        } else {
          // A conta ainda não tem idioma: o desta tela (escolhido ou do navegador) sobe para ela,
          // para o servidor traduzir as explicações da correção na mesma língua.
          api('/me/preferences', {
            method: 'PATCH',
            body: { language: readLocalLanguage() ?? initialLanguage() },
          }).catch(() => {});
        }
        if (prefs.theme) {
          setThemeState(prefs.theme);
          writeLocalTheme(prefs.theme);
        } else {
          const local = readLocalTheme();
          if (local) api('/me/preferences', { method: 'PATCH', body: { theme: local } }).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, [userId]);

  const setTheme = useCallback(
    (next) => {
      setThemeState(next);
      writeLocalTheme(next);
      // Salvar na conta é "melhor esforço": o tema já mudou na tela mesmo que a API não responda.
      if (userId) api('/me/preferences', { method: 'PATCH', body: { theme: next } }).catch(() => {});
    },
    [userId],
  );

  // Troca a tela na hora; salvar na conta é "melhor esforço" (sem login, vale só neste navegador).
  const setLanguage = useCallback(
    async (next) => {
      writeLocalLanguage(next);
      // Salva na conta antes de trocar a tela: as telas que vêm traduzidas do servidor (a correção) recarregam
      // quando o idioma muda e precisam encontrar a nova escolha lá.
      if (userId) await api('/me/preferences', { method: 'PATCH', body: { language: next } }).catch(() => {});
      setLanguageState(next);
    },
    [userId],
  );

  const subscribe = useCallback(async (plan) => {
    const prefs = await api('/me/premium', { method: 'PUT', body: { plan } });
    setPremium(prefs.premium);
  }, []);

  const cancel = useCallback(async () => {
    const prefs = await api('/me/premium', { method: 'DELETE' });
    setPremium(prefs.premium);
  }, []);

  const value = useMemo(
    () => ({ theme, resolved, setTheme, language, setLanguage, premium, loaded, subscribe, cancel }),
    [theme, resolved, setTheme, language, setLanguage, premium, loaded, subscribe, cancel],
  );
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences precisa estar dentro de <PreferencesProvider>');
  return ctx;
}
