import { useState } from 'react';

// Erro de validação da API vem com o caminho do campo (ex.: /answers/2/line): ajuda a achar o problema.
function describe(err) {
  const path = err.code === 'VALIDATION_ERROR' ? err.details?.[0]?.path : null;
  return path ? `${err.message} (${path})` : err.message;
}

// Estado comum dos formulários: enviando, erro e mensagem de sucesso.
export function useFormStatus() {
  const [status, setStatus] = useState({ busy: false, error: null, ok: null });
  async function run(fn, okMessage) {
    setStatus({ busy: true, error: null, ok: null });
    try {
      await fn();
      setStatus({ busy: false, error: null, ok: okMessage });
      return true;
    } catch (err) {
      setStatus({ busy: false, error: describe(err), ok: null });
      return false;
    }
  }
  const fail = (error) => setStatus({ busy: false, error, ok: null });
  const succeed = (ok) => setStatus({ busy: false, error: null, ok });
  return { ...status, run, fail, succeed };
}
