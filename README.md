# RevCode

Jogo diário de **revisão de código em Python**: todo dia, todos os jogadores recebem o mesmo trecho de código, que
funciona, mas tem de 3 a 6 problemas de legibilidade e manutenção (clean code). O jogador aponta a linha e a
categoria de cada problema; acerto soma ponto, marcação errada desconta. Depois de responder, vê a explicação de cada
problema e a versão limpa do código. Os desafios são gerados por três modelos de IA treinados pelo grupo e revisados
por um humano antes de publicar.

Trabalho da disciplina de Arquitetura e Projeto de Software sobre o projeto do Projeto Integrador VI (Engenharia de
Software, 2026): o que mudou no projeto por causa de arquitetura, SOLID, Clean Code e padrões GoF está em
[docs/](docs/), com os PRs de cada mudança.

## Integrantes

| Nome | RA | GitHub |
|---|---|---|
| Guilherme Padilha Freire Alves | 24005138 | [@GuilhermePadilhaFreireAlves](https://github.com/GuilhermePadilhaFreireAlves) |
| Gustavo de Assis Cavalheiro | 24003360 | [@Cavalheiro07](https://github.com/Cavalheiro07) |
| Jefferson Andrey Dias Cardoso | 24017498 | [@jeffersonandrey](https://github.com/jeffersonandrey) |
| João Pedro de Moura Bortoloti | 24020462 | [@JoaoBortoloti](https://github.com/JoaoBortoloti) |
| Kauã Kouqui Uemura Zauli | 24027746 | [@Kouqui](https://github.com/Kouqui) |

## O que tem neste repositório

| Pasta | O que é |
|---|---|
| [`backend/`](backend/) | API REST em Node 22 + Fastify + Prisma (PostgreSQL), com as preferências dos usuários no MongoDB |
| [`frontend/`](frontend/) | Aplicação web em React + Vite |
| [`ia/`](ia/) | Serviço das IAs em Python: os 3 modelos (llama.cpp, em CPU), o auditor que define o gabarito e a API de geração |
| [`docs/`](docs/) | Documentação da disciplina (contexto, qualidade, arquitetura, SOLID, Clean Code, GoF) |
| [`adrs/`](adrs/) | Registros de decisões de arquitetura |
| [`diagrams/`](diagrams/) | Fontes dos diagramas (Mermaid) |

## Como contribuímos

- O `main` é protegido: toda mudança entra por **pull request**, com aprovação de outro integrante e o workflow verde.
- Um ramo por mudança, com o tipo no nome: `feat/`, `fix/`, `refactor/`, `docs/`, `chore/`, `ci/`.
- Commits no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/).
- A descrição do PR segue o [modelo](.github/pull_request_template.md) e cita o padrão, princípio ou ADR aplicado.
- Estratégia de merge única: **merge commit**.

## Mapa da documentação

| Documento | Conteúdo |
|---|---|
| [1. Contexto](docs/1-contexto.md) | O problema, para quem, o escopo e o que mudou em relação ao Projeto Integrador |
| [2. Atributos de qualidade](docs/2-qualidade.md) | Os três atributos mais importantes, as decisões que os atendem e o trade-off assumido |
| [3. Arquitetura](docs/3-arquitetura.md) | Estilo macro e interno, estilos descartados, diagramas C4 e de sequência |
| [4. SOLID](docs/4-solid.md) | Os cinco princípios no código, com o efeito de cada um |
| [5. Clean Code](docs/5-clean-code.md) | As práticas no código, os code smells removidos e o linter |
| [6. Padrões GoF](docs/6-gof.md) | Os padrões aplicados, com o problema, o código, o diagrama, o benefício e o custo |
| [7. Padrão transversal](docs/7-transversal.md) | Camada anticorrupção e resiliência na integração com o serviço das IAs |
| [8. Conclusão](docs/8-conclusao.md) | O que funcionou, o que não funcionou e as referências |
| [ADRs](adrs/) | As decisões de arquitetura, uma por arquivo |
| [Diagramas](diagrams/) | As fontes dos diagramas em Mermaid |
| [Visão geral do produto](VISAO_GERAL.md) | Regras do jogo, categorias e o pipeline de IA |
