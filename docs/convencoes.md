# Convenções

Regras para o código. O que o site é está no README; o porquê das decisões grandes, em `arquitetura.md`.

## Princípios

- **Baixa entropia.** Uma forma de fazer cada coisa. Sem duplicação, exceções, dependências ou mecanismos concorrentes.
- **Alta densidade.** O máximo de expressividade com o mínimo de código. Abstrair decisões recorrentes, não propriedades isoladas.
- **Regra de três.** Lógica repetida três vezes vira função. Vale para tudo: site, demo SemIf, `functions/`, `scripts/`.
- **Coesão.** Cada arquivo faz uma coisa e diz no cabeçalho qual é.

## Lógica

| Onde | O quê |
|---|---|
| `src/lib/` | Funções puras, sem Astro, testadas em `test/`. |
| `src/lib/semif/` | Motor e jogos da demo (`engine`, `models`, workers, `snake`, `pacman`, `learner`, `quiz`). |
| `scripts/lib/` | Helpers dos scripts de verificação. |
| `<script>` do componente | Só ligar DOM a `src/lib`. Nada de regra de negócio. |

Extrações decididas:

| Função | Substitui |
|---|---|
| `src/lib/text.js`: `fill`, `plural` | A interpolação `{nome}` do `i18n` e do `contact-messages`; o `plural` dos dois jogos. |
| `src/lib/storage.js`: `recall(key)`, `remember(key, value)` | Os `try { localStorage } catch` de `Listen` e `learner`. Os do `Layout` ficam: são `is:inline`, rodam antes da pintura e não importam módulo. |
| `src/lib/semif/math.js`: `softmax`, `argmax` | As 3 cópias de `softmax` e os `indexOf(Math.max(...))`. |
| `src/lib/semif/worker-protocol.js`: `serve(handlers)` | O listener de `message` idêntico nos dois workers. |
| `src/lib/semif/grid.js`: `DIRS`, `same`, `add`, `opposite`, `randomOf`, `whereIs(dx, dy)` | As direções, helpers e a frase "N tiles up and M to the left" de `snake.js` e `pacman.js`. |
| `src/lib/semif/arcade.js`: `createLoop`, `bindControls` | Teclas, swipe, direcional, pausa fora da tela, `ResizeObserver` e `frame/loop`, antes duplicados em Snake e PacMan. |
| `src/lib/semif/dom.js`: `within`, `announcer`, `reset`, `bars`, `odds` | O `$` (5×), o `say` (4×), as barras de probabilidade (Lab, Millionaire, Snake) e o texto "↑ 60% · ← 40%". |
| `scripts/lib/fs.mjs`: `walk` | O `walk` dos 3 scripts. |
| `src/pages/[...route].astro` | Os 10 wrappers de página: um `getStaticPaths` gera cada rota nos dois idiomas. |

## Visual

### Base

- HTML semântico. Sem Tailwind, sem framework CSS. `check:css` continua: confere classes contra o CSS próprio.
- Um arquivo de entrada, `src/styles/index.css`, com `@layer reset, tokens, base, layouts, components, utilities`. Nada fora de camada.
- Estilo de componente vai no `<style>` do `.astro`, com escopo. `is:global` só para DOM montado por JS.
- Proibido: `!important`, `html.dark .x`, cor literal fora de `tokens.css` (exceção: paleta dos canvas), `style=""` (exceção: largura calculada de barra).

### Tokens (`tokens.css`)

Semânticos, poucos, em `:root`. Tema com `light-dark()`; o `html.dark` só muda `color-scheme`.

```css
--color-bg, --color-surface, --color-text, --color-text-muted,
--color-accent, --color-accent-strong, --color-accent-soft, --color-line,
--color-ok, --color-error, --color-warning, --color-warning-soft
--space-1…6   --radius-sm/md/lg   --text-xs…3xl   --measure (70ch)
```

Open Props: não adotar. Copiar o valor, não a dependência.

### Larguras

Página: `min(100% - 3rem, 76rem)` (Layout). Leitura: `70ch`, 18→20px, entrelinha 1,75. O post é uma grade de três faixas (`[full-start] 1fr [content-start] 70ch [content-end] 1fr [full-end]`) com `subgrid` no corpo: texto na do meio; código, tabelas, diagramas, embeds e `<Wide>` ocupam as três, centrados, com `fit-content` entre a coluna e a página.

### Primitivas de layout (`layouts.css`)

Inspiradas em Every Layout, só as que o site usa: `.stack` (ritmo vertical `> * + *`), `.cluster` (flex wrap + gap), `.center` (largura máxima centrada), `.grid` (`auto-fit, minmax`). Grid de 3 colunas alinhadas (barras) usa `subgrid`.

### Componentes semânticos (`components.css`)

Só quando há comportamento ou identidade compartilhada: `.btn` (+ `[data-variant=ghost]`), `.chip` (+ `[data-tone]`), `.card`, `.field`, `.label`, `.kicker`, `.muted`, `.meter`, `.status[data-kind]`. Substituem os pares `.btn`/`.semif-btn`, `.semif-card`, os 4 chips verdes, os 2 badges "Draft", as 3 linhas de metadados.

### Moderno quando clareia

`@scope (.post-content)` no lugar do prefixo repetido; nesting para estados; `:has()` para estado do pai; container queries nos cards e grids da demo, media queries só para `pointer` e `prefers-reduced-motion`.

## Atomic Design

Pastas por nível em `src/components/`, não por feature.

| Nível | Critério | Hoje |
|---|---|---|
| `atoms/` | Um elemento, sem filhos próprios | Monogram, Icon (arquivos); Chip, Button, Field, Meter, Kicker (só classe) |
| `molecules/` | Átomos com um propósito | StackCard, ProjectCard, PostMeta, SectionHeading, SocialLinks, Callout, Embed, Wide, Stats (barras: `bars` em `src/lib/semif/dom.js`) |
| `organisms/` | Seção autônoma, com estado ou dados | TopMenu, Footer, StackList, PostList, BlogPost, Listen, `semif/*` |
| `substances/` | Template e página: Layout e as rotas | Layout, HomeRoute, StackRoute, ProjectsRoute, ContactRoute, MetaRoute |

Um componente só sobe de nível quando ganha filhos ou estado; só existe quando há segunda ocorrência ou comportamento. Átomo sem marcação própria (Chip, Button, Field, Meter, Kicker) é só a classe em `components.css`, não um arquivo.

## Migração

Feita em outubro de 2026, nesta ordem, cada passo num commit que passou no `verify`: tokens e base → primitivas e componentes → átomos e moléculas → organismos, substâncias e rota única → extrações de lógica → uma rota por vez → remoção do Tailwind. O CSS do site foi de 37 para 13 KB.
