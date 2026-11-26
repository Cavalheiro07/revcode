import { translateMessage, translate } from '../i18n/index.jsx';

// Cliente da API. Em dev o Vite repassa /api para http://localhost:3333 (ver vite.config.js).
const BASE_URL = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');
const TOKEN_KEY = 'revcode:token';

// localStorage pode não existir (aba anônima, bloqueio de cookies): aí o token só vive na memória.
let memoryToken = null;

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? memoryToken;
  } catch {
    return memoryToken;
  }
}

export function setToken(token) {
  memoryToken = token;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // sem storage: fica só na memória
  }
}

// O AuthContext registra aqui o que fazer quando a sessão expira.
let onUnauthorized = () => {};
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// auth: false para login/cadastro (não manda um token antigo que tenha sobrado).
export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const token = auth ? getToken() : null;
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', translate('Não foi possível falar com o servidor. Verifique a conexão.'));
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // 401 com token = sessão inválida ou expirada. Sem token (ex.: login errado) é só um erro do formulário.
    if (res.status === 401 && token) onUnauthorized();
    const err = data?.error;
    const message = err?.message
      ? translateMessage(err.message)
      : translate('Erro {n} ao falar com o servidor.', { n: res.status });
    throw new ApiError(res.status, err?.code ?? 'HTTP_ERROR', message, err?.details);
  }
  return data;
}

// Baixa um arquivo que exige login (ex.: CSV premium): busca com o token e dispara o download no navegador.
export async function downloadFile(path, fallbackName) {
  const token = getToken();
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  } catch {
    throw new ApiError(0, 'NETWORK_ERROR', translate('Não foi possível falar com o servidor. Verifique a conexão.'));
  }
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized();
    const data = await res.json().catch(() => null);
    throw new ApiError(
      res.status,
      data?.error?.code ?? 'HTTP_ERROR',
      data?.error?.message
        ? translateMessage(data.error.message)
        : translate('Erro {n} ao baixar o arquivo.', { n: res.status }),
    );
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fallbackName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
