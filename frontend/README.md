# RevCode: frontend

Frontend em Vite + React que fala com a API do `backend/`. Login, desafios, correção, histórico e métricas vêm todos da API; nada fica mockado no navegador (só o token da sessão vai para o `localStorage`).

## Idiomas (português e inglês)

Todo texto da interface passa por `t('texto em português')` (hook `useT()` de `src/i18n`); a tradução em inglês fica em `src/i18n/en.js`, e texto sem entrada ali aparece em português. Em código fora de componentes use `translate(...)`. O idioma é escolhido pelo botão PT/EN do cabeçalho (ou em Conta), fica no navegador e, logado, na conta (Mongo). Para um texto novo: escreva em português com `t()` e acrescente o inglês em `en.js`.

## Rodar

A API precisa estar no ar (ver `backend/README.md`; com Docker ela fica em http://localhost:3333).

```bash
cd frontend
npm install
npm run dev
```

Abre em http://localhost:5173. Em dev, o Vite repassa `/api` para `http://localhost:3333` (proxy em `vite.config.js`), então não precisa configurar CORS.

Para entrar, crie uma conta na tela inicial ou use o usuário do seed (`demo@revcode.dev` / `demo12345`).

### Apontar para outra API

O endereço base vem de `VITE_API_URL` (padrão: `/api`). Para um build que fala com uma API em outro domínio:

```bash
VITE_API_URL=https://api.exemplo.com/api npm run build
```

## Telas

| Rota                     | Tela                                                                             |
| ------------------------ | -------------------------------------------------------------------------------- |
| `/`                      | Entrada: entrar ou criar conta (e-mail e senha). Logado, vai direto para `/hoje` |
| `/hoje`                  | Desafios do dia (`GET /daily`), streak e pontos (`GET /me/stats`)                |
| `/desafio/:id`           | Desafio: clique na linha e escolha o motivo no painel ao lado                    |
| `/desafio/:id/resultado` | Correção linha a linha com a explicação do gabarito                              |
| `/historico`             | Histórico completo, paginado ("carregar mais")                                   |
| `/metricas`              | Evolução: precisão por semana, atividade e quanto você encontra por categoria    |
| `/conta`                 | Editar nome e e-mail, trocar senha, excluir conta                                |

Todas, menos `/`, exigem login. Se a API responder 401 (token vencido ou conta excluída), a sessão é apagada e o usuário volta para a entrada.

## Onde mexer

- `src/lib/api.js`: cliente da API (token, erros `{ error: { code, message } }`, 401).
- `src/state/AuthContext.jsx`: sessão (login, cadastro, sair, validação do token com `GET /me`).
- `src/state/StatsContext.jsx`: `GET /me/stats`, compartilhado entre o cabeçalho e as telas.
- `src/lib/useApi.js`: hook de GET com carregando/erro.
- `src/data/categories.js`: rótulos das 10 categorias (as chaves são as mesmas da API).
- `src/lib/format.js`: formatação (pontos, datas, formato do desafio). A pontuação em si é calculada pela API.
