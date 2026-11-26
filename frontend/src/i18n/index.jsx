import { useCallback } from 'react';
import { API_PATTERNS, EN } from './en.js';
import { usePreferences } from '../state/PreferencesContext.jsx';

// A chave de cada texto é o próprio português (a língua do app). Em inglês, procura no dicionário EN;
// texto sem tradução aparece em português, então uma chave esquecida nunca deixa a tela vazia.
let current = 'pt';

export function setCurrentLanguage(language) {
  current = language;
}

export function currentLanguage() {
  return current;
}

/** "Você fez {n} pontos" + { n: 3 } → "Você fez 3 pontos" (ou a versão em inglês). */
export function translate(text, vars, language = current) {
  const base = language === 'en' ? (EN[text] ?? text) : text;
  return vars ? base.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : base;
}

/** Mensagem de erro vinda da API (em português): traduz as conhecidas, inclusive as que têm números no meio. */
export function translateMessage(message, language = current) {
  if (language !== 'en') return message;
  if (EN[message]) return EN[message];
  for (const [regex, key] of API_PATTERNS) {
    const m = message.match(regex);
    if (m) return translate(key, Object.fromEntries(m.slice(1).map((v, i) => [String(i + 1), v])), language);
  }
  return message;
}

/** Hook: devolve t(texto, variáveis) na língua atual e faz o componente redesenhar quando ela muda. */
export function useT() {
  const { language } = usePreferences();
  return useCallback((text, vars) => translate(text, vars, language), [language]);
}

/** Código de idioma para Intl/toLocaleString. */
export function locale(language = current) {
  return language === 'en' ? 'en-US' : 'pt-BR';
}
