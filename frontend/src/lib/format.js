import { currentLanguage, translate } from '../i18n/index.jsx';

// Só para mostrar na tela: quem pontua é a API (backend/src/lib/scoring.ts).
export const POINTS = { hit: 10, wrong: -5, missed: 0 };

export function formatPoints(n) {
  if (n > 0) return `+${n}`;
  if (n < 0) return `−${Math.abs(n)}`;
  return '0';
}

const FORMATS = { FUNCAO: 'Função', SCRIPT: 'Script', CLASSE: 'Classe' };

export function formatLabel(format) {
  return FORMATS[format] ? translate(FORMATS[format]) : format;
}

export function codeLines(code) {
  return code.split('\n');
}

// "2026-10-14" → "14/10" (ou "14/10/2025" se for de outro ano). Sem Date para não sofrer com fuso.
export function formatDay(ymd) {
  const [y, m, d] = ymd.split('-');
  const en = currentLanguage() === 'en';
  const short = en ? `${m}/${d}` : `${d}/${m}`;
  return y === String(new Date().getFullYear()) ? short : en ? `${short}/${y}` : `${short}/${y}`;
}

export function initials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

// ["a", "b", "c"] → "a, b e c" (em inglês: "a, b and c")
export function joinPt(items) {
  const and = currentLanguage() === 'en' ? 'and' : 'e';
  return items.length > 1 ? `${items.slice(0, -1).join(', ')} ${and} ${items[items.length - 1]}` : (items[0] ?? '');
}
