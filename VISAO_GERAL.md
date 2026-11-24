# RevCode: visão geral do projeto

> Projeto Integrador VI · Engenharia de Software · Prof. Dimas Augusto Mendes Lemes · Campinas, 2026
>
> Equipe: Guilherme Padilha Freire Alves, Gustavo de Assis Cavalheiro, Jefferson Andrey Dias Cardoso, João Pedro de Moura Bortoloti e Kauã Kouqui Uemura Zauli.

Este documento resume o projeto como ele está hoje. Ele parte da documentação da Entrega 1 e incorpora as mudanças de regra de negócio que vieram com a construção dos datasets (ver `DATASETS.md`).

## 1. O que é

O RevCode é uma plataforma web gamificada para **treinar revisão de código (code review) em Python**. A ideia segue o modelo do LeetCode, mas aplicado a outra habilidade: em vez de escrever uma solução, o usuário recebe um trecho de código e precisa **apontar os problemas** que encontra nele.

- Um ou dois desafios por dia, curtos (~5 minutos), para caber na rotina.
- Cada acerto soma pontos e cada erro desconta, então marcar tudo não compensa.
- O usuário acompanha histórico, sequência de dias seguidos (streak) e métricas de evolução.

**Público-alvo:** estudantes de programação e de bootcamps, desenvolvedores em início de carreira se preparando para processos seletivos e empresas que querem treinar seus times em boas práticas de revisão.

**Por quê:** a revisão de código é cobrada no mercado, mas quase nunca é ensinada de forma estruturada. Quem aprende, aprende informalmente, dependendo do time em que caiu. O RevCode parte da ideia de que reconhecer problemas no código dos outros pode ser treinado deliberadamente, com prática frequente e retorno objetivo.

## 2. O que mudou desde a Entrega 1

| | Entrega 1 (planejado) | Hoje (após os datasets) |
|---|---|---|
| **Origem do código** | Scraper coletando código real de repositórios do GitHub | Problemas de bases públicas (MBPP, Exercism, Project CodeNet, APPS); os desafios em produção são **gerados por IA** |
| **Papel da IA** | Um modelo que **identifica e rotula** problemas em código existente | **Três adaptadores LoRA** sobre um modelo de código pequeno (1,5B a 7B), que **geram** o desafio com os problemas já injetados e marcados |
| **Tipos de problema** | Bugs, code smells, vulnerabilidades e más práticas | Só **legibilidade e manutenção**, em 10 categorias. O código problemático **continua funcionando** e passa nos mesmos testes |
| **Gabarito** | Rótulos do modelo por trecho | Gabarito **por linha**: linha, categoria, regra que detectou e explicação |
| **Revisão humana** | Fora do escopo | Continua fora dos desafios publicados, mas existe uma **fila de revisão humana no dataset de treino** (217 exemplos). É a única fonte da categoria `multiplas_responsabilidades` |

Por que mudou: rotular código arbitrário do GitHub não garante um gabarito **indiscutível**. Gerar o código problemático a partir de uma versão limpa conhecida permite saber exatamente onde está cada erro e conferir isso com ferramentas determinísticas.

## 3. Como um desafio é gerado

```
tags ──► [IA 1: Contexto] ──► enunciado + assinatura + exemplos executáveis
                                      │
                                      ▼
                          [IA 2: Solucionadora] ──► código limpo e correto
                                      │                (validado pelos exemplos)
             categorias pedidas ──────┤
                                      ▼
                            [IA 3: Injetora] ──► código com problemas + marcações ⟦categoria⟧
                                      │
                                      ▼
                        Auditor determinístico (ruff, AST, black, testes)
                                      │
                         passa? ──► publica o desafio · dúvida? ──► descarta
```

| # | IA | Entrada → saída | Dataset |
|---|---|---|---|
| 1 | Contexto | tags (operação, dificuldade, formato, recursos) → enunciado + assinatura + exemplos | 7.823 exemplos |
| 2 | Solucionadora | enunciado → código limpo e correto | 8.930 exemplos |
| 3 | Injetora | categorias pedidas + código limpo → código "piorado" como um iniciante faria, com as linhas marcadas | 2.730 exemplos (meta: 3 a 5 mil) |

- **Em produção** a ideia é pedir à IA 1 desafios no formato `funcao` e de dificuldade baixa, que são curtos e cabem na tela.
- **Equilíbrio de categorias:** como é a plataforma que escolhe as categorias pedidas à IA 3, dá para dosar as raras (`erro_vago`, `duplicacao`) e não deixar `nome_generico` dominar.
- **O lado problemático do treino é humano:** 95% vem de submissões reais de pessoas (CodeNet/APPS) e 5% de mutações por regra. A IA só ajudou a escrever o lado limpo, sempre com verificação.

> Observação: o fluxo de produção acima é a leitura do grupo a partir do `DATASETS.md`. O detalhe de como o auditor roda em produção ainda precisa ser fechado.

## 4. As categorias de problema

Cada desafio tem de **3 a 6 problemas**, de categorias diferentes:

| Categoria | O que é |
|---|---|
| `nome_generico` | Nome de variável/função que não diz o que guarda (`a`, `S`, `tmp`) |
| `comentario_ruim` | Código comentado, comentário inútil ou que contradiz o código |
| `codigo_morto` | Código que nunca roda ou cujo resultado nunca é usado |
| `condicional_confusa` | Condição redundante ou difícil de ler (`if x == True`) |
| `magic_values` | Número ou string solto sem nome (`1000` → `MAX_ITEMS`) |
| `retorno_inconsistente` | Função que às vezes retorna valor e às vezes não, ou retorna tipos diferentes |
| `efeito_colateral` | Função que altera estado externo ou os próprios argumentos sem deixar claro |
| `erro_vago` | Tratamento de exceção genérico ou mensagem de erro que não ajuda |
| `duplicacao` | Trecho repetido que deveria virar uma função ou um loop |
| `multiplas_responsabilidades` | Função que faz mais do que o contexto pede |

## 5. Regras que valem para todo desafio

- **Gabarito indiscutível:** qualquer caso duvidoso faz o exemplo ser descartado, nunca publicado.
- **Nenhum erro fora do gabarito:** se o código tem um problema que o gabarito não lista, ele é descartado.
- **O código problemático continua funcionando:** passa nos mesmos testes da versão limpa.
- **Cada erro do gabarito tem uma explicação** (hoje em inglês no dataset), mostrada ao jogador na correção.

## 6. A experiência do jogador

1. Entra na plataforma e vê o desafio do dia (1 ou 2), com dificuldade e número de problemas escondidos.
2. Lê o enunciado curto e o código.
3. Marca os problemas que encontrar. **Ainda em decisão:** marcar linha + categoria (usa todo o gabarito por linha) ou só a categoria (mais simples, como estava na Entrega 1). Os wireframes exploram as duas opções.
4. Envia a resposta e recebe a correção na hora: acertos, falsos positivos, problemas que passaram despercebidos e a explicação de cada um.
5. Os pontos entram no histórico, o streak avança e as métricas por categoria são atualizadas (ex.: "você encontra 31% dos efeitos colaterais").

## 7. Arquitetura

- **IA:** modelo de código open-source pequeno com 3 adaptadores LoRA (piloto: QLoRA no Qwen2.5-Coder-1.5B).
- **Backend:** API REST que distribui os desafios do dia, corrige as respostas e registra o desempenho.
- **Frontend:** aplicação web responsiva em React.
- **Infra:** Docker e implantação na AWS.

## 8. Escopo e não escopo

**No escopo**
- Construção dos 3 datasets e treino/avaliação dos 3 adaptadores.
- Geração automática do banco de desafios, com auditoria determinística.
- API REST, frontend React responsivo, pontuação por acerto e erro, histórico, streak e métricas de evolução.
- Docker e AWS.

**Fora do escopo**
- Linguagens além do Python.
- Bugs e vulnerabilidades de segurança (agora explicitamente: o foco é legibilidade e manutenção).
- Comentários de revisão em texto livre.
- Integração com repositórios ou PRs do próprio usuário.
- Modo de prática ilimitada fora do desafio diário.
- Ranking global (leaderboard) e badges.
- Curadoria manual dos desafios publicados.

## 9. Estado atual e próximos passos

| Dataset | Total | Meta | Situação |
|---|---|---|---|
| 1. Contexto | 7.823 | 2 a 5 mil | ✅ |
| 2. Solução | 8.930 | 3 a 10 mil | ✅ |
| 3. Injetora | 2.730 | 3 a 5 mil | ⚠️ faltam ~270 |

1. Passar de 3 mil exemplos no dataset 3.
2. Reduzir o viés de `nome_generico` (aparece em 94% dos exemplos).
3. Mais dados para `erro_vago` e `duplicacao`, via mutações dirigidas.
4. Revisar a fila de 217 exemplos (traz `multiplas_responsabilidades` e forma o conjunto gold do auditor).
5. Piloto de treino com QLoRA e medição do rendimento por categoria pedida.
6. Decidir o design da tela de desafio a partir dos wireframes.

## 10. Cronograma (sprints quinzenais)

| Sprint | Período | Atividades |
|---|---|---|
| 1 | 17/08 a 31/08 | Tema, requisitos, escopo do MVP |
| 2 | 31/08 a 14/09 | Coleta de dados; Docker e AWS |
| 3 | 14/09 a 28/09 | Montagem dos datasets; protótipo das telas |
| 4 | 28/09 a 12/10 | Primeiro treino (MVP) do modelo; telas básicas em React; API das telas básicas |
| 5 | 12/10 a 26/10 | Avaliação e refinamento do modelo; frontend completo; backend completo e integração com o modelo |
| 6 | 26/10 a 09/11 | Ajustes, integração geral, documentação e apresentação |
