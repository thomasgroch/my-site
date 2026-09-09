# Plano de Modernização my-site: Astro + Vue Islands rumo ao 512KB Club

> Este plano substitui a abordagem do `ANALISE_MODERNIZACAO_512KB.md` anterior. Aquele documento propunha jogar fora Vue/Tailwind inteiramente e reescrever em HTML puro — bom para o peso final, ruim para produtividade e manutenção. Este plano mantém o conceito de **Single File Component (SFC)** e baixa entropia de declaração — só troca a ferramenta de "Vue SPA completo" para "Astro com Vue nas partes que precisam de interatividade".

## 📊 Estado atual real (12/08/2026)

Números levantados diretamente do projeto, não estimativas antigas:

- **41 dependências diretas** (24 `dependencies` + 17 `devDependencies`) — não as "127" citadas no doc anterior, que provavelmente contavam o `node_modules` transitivo (~2000 pacotes, majoritariamente ferramental de build/teste que nunca chega ao navegador)
- **`public/` continua em 4.2MB** — este número do doc antigo ainda procede, e é de longe o maior vilão do peso da página
- **Bundle JS já é razoável**: chunk principal ~209KB (77KB gzip), rotas com code-splitting via `vue-router`, dataset de cidades (`brazil.json`, 85KB) já carrega sob demanda

### Onde o peso de verdade está

| Pasta/arquivo | Tamanho | Causa |
|---|---|---|
| `public/favicon/` | 1.1MB (29 arquivos) | PNG para cada tamanho imaginável (Android, Apple, FirefoxOS) |
| `public/projects/` | 1.3MB | Imagens de projeto não otimizadas |
| `public/stack/` | 924KB | Logos de tecnologia, mesmo problema |
| `public/font/` | 468KB | Inter self-hosted |
| `public/avatar.png` + `avatar.jpg` | 128KB+ | Duplicado em dois formatos |

**Conclusão importante: 90% do peso está em `public/`, não no framework.** Nenhuma troca de ferramenta resolve isso sozinha — por isso a Fase 0 abaixo é independente da decisão de framework.

## 🧹 Fase 0: Dieta de dependências (independente do framework)

Ganhos rápidos, sem esperar a migração para Astro. Podem ser feitos a qualquer momento.

| Dependência | Situação | Ação |
|---|---|---|
| `stylus` | **Morta** — zero arquivos `.styl` no projeto | Remover |
| `@fortawesome/*` (4 pacotes: core, brands, solid, vue-wrapper) | Usado em só 2 pontos do código (chevron + ícones de rede social) | Consolidar em `@heroicons/vue` (já instalado, já usado corretamente) + SVG inline para os 3-4 logos de marca (GitHub/LinkedIn/GitLab raramente mudam) |
| `vue-meta ^3.0.0-alpha.10` | **Alpha nunca estabilizada**, import via `vue-meta/dist/vue-meta.esm-browser` (workaround porque o pacote não exporta certo). Usado de verdade em 4 páginas (title/description) | Trocar por `@unhead/vue` (sucessor oficial mantido) ou um composable de ~15 linhas, já que o uso é simples |
| Imagens de `public/` | Não otimizadas, formatos legados (PNG/JPG) | Converter para WebP/AVIF, gerar favicon único em SVG + 1-2 PNG de fallback, eliminar duplicata `avatar.jpg`/`avatar.png` |
| `@jitsi/vue-sdk` | Uso legítimo (embed de videochamada) | Avaliar se `<iframe src="https://8x8.vc/...">` puro cobre o caso de uso sem dependência — não decidido, avaliar depois |

**Estimativa de impacto da Fase 0 isolada**: `public/` de 4.2MB → ~300-500KB; bundle JS com uma dependência de ícones a menos e sem o alpha do vue-meta.

## 🧩 Por que Astro (e não Vue puro nem Svelte)

Três caminhos foram avaliados para manter o conceito de SFC:

| Opção | Esforço | Reaproveita o código de hoje? | Peso final estimado |
|---|---|---|---|
| **Vue 3 + dieta agressiva** (sem trocar de framework) | Baixo | 100% | Moderado — continua sendo um SPA completo carregando o runtime Vue em toda página |
| **Astro + Vue como ilhas** ✅ | Médio | Sim — componentes Vue viram ilhas, quase sem reescrita | Baixo — a maioria das páginas não envia JS nenhum |
| **Svelte/SvelteKit** (reescrita total) | Alto | Não — nenhum `.vue` é reaproveitável | Mínimo — framework compila e desaparece |

Astro venceu porque:
- Arquivos `.astro` **também são SFC** (frontmatter + template), sintaxe até mais simples que Vue para conteúdo estático — mantém o critério de baixa entropia
- **Zero JS por padrão** — só as "ilhas" marcadas como interativas (`client:load`, `client:visible`, etc.) enviam JavaScript ao navegador
- **Reaproveita os componentes Vue já refatorados hoje** (`FormField.vue`, `SocialLinks.vue`, `MeetForm.vue`, etc.) — eles continuam existindo como estão, só passam a ser montados como ilhas em vez de rotas de SPA inteiras
- Suporta Vue, React, Svelte e outros lado a lado — não é um beco sem saída se quiser trocar peças depois

Svelte foi descartado por exigir reescrever cada componente do zero. Web Components/Lit puro foi descartado por ter sintaxe de template literal **mais verbosa** que SFC — contradiz o próprio critério de baixa entropia deste plano.

## 🗺️ Fases da migração

### Fase 1: Fundação Astro
- Adicionar Astro ao projeto (`npx astro add vue tailwind`) — Astro já usa Vite por baixo, convivência tranquila
- Configurar roteamento file-based (`src/pages/`) substituindo `vue-router` para as páginas estáticas
- Portar `TopMenu.vue`, `Footer.vue`, `Logo.vue` como componentes Astro ou mantê-los Vue como ilha de baixa prioridade (troca de tema/idioma é interativa)

### Fase 2: Páginas estáticas → `.astro`
Candidatas a virar HTML puro sem nenhum JS no cliente:
- `About.vue` → `src/pages/index.astro`
- `StackPage.vue` → `src/pages/stack.astro`
- `ProjectPage.vue` (listagem) → `src/pages/projetos.astro`
- `NotFound.vue` → `src/pages/404.astro`

`StackCard`/`ProjectCard` viram componentes Astro simples (sem reatividade necessária para exibição estática).

### Fase 3: Ilhas interativas (continuam Vue)
Componentes que genuinamente precisam de JS no cliente, hidratados só onde aparecem:
- `ContactPage.vue` (formulário com validação, submit assíncrono) — ilha com `client:load`
- `MeetForm.vue` + `MeetPage.vue` (Jitsi embed, contagem regressiva) — ilha com `client:load`
- Seletor de tema dark/light e seletor de idioma (no `Footer.vue`) — ilha pequena com `client:load`, ou reimplementado em JS puro (é só toggle de classe + localStorage, cabe em poucas linhas — ver `test/setup.test.ts` como candidato a expandir a cobertura de testes aqui)

### Fase 4: i18n e meta tags
- Avaliar `@astrojs/i18n` (roteamento nativo de idioma do Astro) vs manter o plugin customizado de merge de locales (`vite-i18n-resources`) já existente — o plugin atual pode continuar funcionando dentro do Astro, que também usa Vite
- Meta tags (`title`/`description` por página) via `<head>` nativo do Astro (frontmatter), eliminando de vez a dependência de `vue-meta`/`Unhead` para as páginas que virarem `.astro`

### Fase 5: Assets e validação
- Aplicar a Fase 0 (dieta de dependências e otimização de imagens) se ainda não tiver sido feita
- Medir bundle real por página com `astro build` (relatório nativo de tamanho por rota)
- Rodar Cypress e Vitest existentes, ajustando seletores/URLs conforme necessário
- Validar Netlify Functions (`functions/contact.cjs`, `functions/meet`) sem alteração — Astro não muda o backend

## 📈 Benefícios esperados

| Métrica | Hoje | Com Astro + ilhas (estimado) |
|---|---|---|
| JS enviado em páginas estáticas (About, Stack, Projects) | ~77KB gzip (runtime Vue completo) | ~0KB |
| JS enviado em páginas interativas (Contact, Meet) | ~77KB + chunk da página | Só o runtime Vue + componente da ilha, isolado |
| Peso de `public/` | 4.2MB | ~300-500KB (Fase 0) |
| Dependências client-side de ícones | 5 pacotes (FontAwesome ×4 + Heroicons) | 1 pacote (Heroicons) + SVG inline |

## ⚠️ Riscos e mitigação

- **Curva de aprendizado do Astro**: mitigado por reaproveitar os componentes Vue como estão, migrando página por página, não tudo de uma vez
- **Roteamento muda de `vue-router` (client-side) para file-based (Astro)**: URLs atuais (`/contato`, `/projetos`) precisam de path mapping cuidadoso para não quebrar links existentes/SEO
- **i18n**: decisão pendente entre manter o plugin customizado ou adotar `@astrojs/i18n` — impacta estrutura de URLs por idioma
- **Netlify Functions**: sem risco, já são independentes do frontend e não mudam

## 🎯 Conclusão

Diferente do plano anterior (que descartava Vue inteiramente), esta abordagem preserva o investimento já feito na refatoração de componentes de hoje (`FormField`, `SocialLinks`, i18n completo) e ainda assim mira uma redução drástica de peso: a maior parte do site passa a não enviar JavaScript nenhum, e as partes interativas continuam em Vue — a ferramenta de menor entropia declarativa que o projeto já domina.

A Fase 0 (dieta de dependências + otimização de `public/`) é o maior ganho por esforço e não depende de decidir sobre Astro — vale considerar independentemente do resto deste roadmap.

**Status**: ✅ executado em 12/08/2026, na branch `feat/astro-migration`.

## 🔁 Revisão pós-execução: i18n sem prefixo de URL

O feedback depois da primeira execução foi claro: URLs com prefixo (`/en/`,
`/jp/`) trazem complexidade que não era desejada — a expectativa é que o
site "se comporte como uma aplicação que decide sozinha o idioma", sem expor
isso na URL.

Duas formas de resolver isso sem prefixo foram avaliadas: (a) voltar a algo
parecido com o SPA original, com Vue reativo em todo lugar decidindo o
idioma no cliente — mas isso reintroduziria JS nas páginas hoje estáticas
(Stack, Projects, menu, rodapé), perdendo parte do ganho da migração; ou (b)
uma **Netlify Edge Function** decidindo o idioma no servidor/borda, antes da
resposta chegar ao navegador. Optamos por (b).

**Como funciona agora**: as URLs canônicas continuam únicas (`/`, `/stack`,
`/projetos`, `/contato`) para todo mundo. As páginas por idioma (`/en/*`,
`/jp/*`) continuam existindo como saída do build (o Astro ainda as gera via
`getStaticPaths`), mas passam a ser um detalhe de implementação — a Edge
Function (`netlify/edge-functions/locale.js`) intercepta as URLs canônicas e
faz um *rewrite* interno (não um redirect: a barra de endereço nunca muda)
para a variante certa, decidindo por: 1) cookie `locale` (troca manual, ver
botões do Footer) → 2) header `Accept-Language` → 3) fallback pt. O idioma
detectado fica fixado num cookie de 1 ano na primeira visita.

O script de detecção client-side (que existia no `Layout.astro` e causava
inclusive uma corrida de condição com os testes) foi removido — a detecção
agora é 100% no servidor, sem flash de conteúdo errado.

**Limitação de teste**: Edge Functions do Netlify só rodam em produção/preview
do Netlify, não sob `astro dev` nem localmente. A lógica da função foi
validada isoladamente rodando-a sob Deno (o runtime real usado pelo Netlify)
com Request/context simulados, cobrindo os 6 cenários de cookie vs
Accept-Language — mas o comportamento ponta-a-ponta (rewrite de verdade,
mudança de conteúdo sem mudar a URL) só pode ser confirmado num deploy real.

## 🔁 Segunda revisão: de volta ao prefixo de URL, sem Edge Function

A Edge Function não pegou bem: infraestrutura específica do Netlify, não
testável localmente (provavelmente a causa do "trocador de idioma não
funciona" reportado), e uma comparação de linhas/arquivos mostrou que ela
não era nem a opção mais enxuta — ficou em ~307 linhas contra ~287 do
prefixo simples.

Mas a comparação também expôs um problema real nas duas versões com prefixo
que eu tinha implementado: os 8 arquivos de página (`index/stack/projetos/
contato.astro` + suas versões em `[locale]/`) **duplicavam o conteúdo
inteiro**, diferindo em só 5-9 linhas de resolução de locale. Confirmado via
diff: 156 linhas nesses 8 arquivos, ~70 delas puramente duplicadas.

Solução final: **URLs com prefixo (`/en/`, `/jp/`) + conteúdo extraído para
componentes compartilhados** (`src/components/routes/*Route.astro` — um por
página, ~70 linhas ao todo, escritas uma única vez). Os 8 arquivos em
`src/pages/` viram wrappers finos (~60 linhas ao todo) que só resolvem o
`locale` (fixo `'pt'` na raiz, via `getStaticPaths` em `[locale]/`) e
delegam pro componente de conteúdo. Removida a Edge Function e o
`netlify/edge-functions/` inteiro. Restaurados: o script de auto-detecção
de idioma do navegador no `Layout.astro` (roda 100% no cliente, sem
dependência de plataforma) e os links `<a>` com prefixo no `TopMenu`/
`Footer` (troca de idioma volta a ser navegação normal, com
`localStorage` marcando escolha manual pra não ser sobrescrita).

**Resultado**: 156 → 130 linhas nas páginas, zero duplicação de conteúdo
(confirmado via diff — só resta a diferença da resolução de rota), URLs
reais e indexáveis por idioma, testável 100% localmente, sem nenhuma
dependência de infraestrutura específica de plataforma.

## ✅ Checklist de execução

### Decisões tomadas durante a execução (divergências deste plano)
- **Jitsi**: em vez de trocar por iframe, a funcionalidade de reunião/videochamada foi **removida por completo** do site (MeetPage, MeetForm, rotas `/entrevista`/`/meet`/`/reuniao`/`/interview`, locales `meet.*.json`). A função Netlify `meet` referenciada pelo formulário nem existia — o recurso já estava parcialmente quebrado.
- **i18n**: em vez de manter URLs sem prefixo, foi implementado roteamento com prefixo (`/en/`, `/jp/`, `pt` sem prefixo como padrão), com **detecção automática pelo idioma do navegador** no primeiro acesso (redirecionamento client-side, respeitando escolha manual salva em `localStorage`).
- **vue3-i18n removido**: como cada ilha Vue passou a ser independente (sem um app Vue global cobrindo a página inteira), a tradução baseada em plugin global deixou de fazer sentido. Foi substituída por um tradutor puro (`src/i18n/index.js`, ~30 linhas) que cada página/ilha instancia com o locale já resolvido pela URL.
- **TopMenu e Footer viraram componentes Astro puros (zero JS)** — a troca de idioma deixou de ser uma ação reativa (agora é navegação normal entre URLs), então o menu e rodapé não precisam mais de Vue. Só o toggle do menu mobile usa um pequeno script vanilla inline.

### Fase 0 — Dieta de dependências
- [x] Removido `stylus` (dependência morta, zero arquivos `.styl` — incluindo o `<style lang="stylus">` remanescente em `StackList`, convertido para CSS puro)
- [x] Removido FontAwesome (4 pacotes) → consolidado em `@heroicons/vue` (chevron do CardProfile) + SVG inline (ícones de marca em `SocialLinks`)
- [x] Removido `vue-meta` (alpha não mantida) → título/descrição por página agora são nativos do Astro (frontmatter), sem dependência
- [x] Removido `@jitsi/vue-sdk` e `date-fns` (junto com a remoção da feature Meet)
- [x] Removido `vue-router`, `vue3-i18n` (substituídos pelo roteamento file-based do Astro e pelo tradutor local)
- [x] Removida a página `About.vue` (boilerplate do Vite, nunca linkada no menu — dead code)

### Fase 0.5 — Otimização de assets
- [x] `public/favicon/` (1.1MB, 29 arquivos, **não usado em lugar nenhum** — nem havia `<link rel="icon">`) → substituído por um conjunto mínimo gerado a partir do avatar (`favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`), agora efetivamente linkado no `<head>`
- [x] `public/font/` (468KB, Inter self-hosted, **nunca referenciado** em nenhum lugar) → removido
- [x] `public/stack/*.png` e `public/projects/*.png` (54 arquivos) → convertidos para WebP (qualidade 82)
- [x] Corrigido bug latente de paths relativos em `resume.json` (`stack/x.png` → `/stack/x.webp`) — com URLs mais profundas (`/en/projetos`) esse bug teria quebrado todas as imagens
- [x] `public/evento.ics` removido (arquivo de exemplo/placeholder, não relacionado a dados reais)
- **Resultado**: `public/` foi de **4.2MB → 1.7MB** (-60%)

### Fase 1-3 — Astro + Vue islands
- [x] Astro 5 + `@astrojs/vue` + `@astrojs/tailwind` instalados e configurados
- [x] Páginas estáticas (Home/About, Stack, Projects, 404) portadas para `.astro`, zero JavaScript no HTML gerado (validado: só o `ClientRouter` de ~5KB gzip aparece nessas páginas)
- [x] `StackCard`, `StackList`, `ProjectCard` portados de `.vue` para `.astro` (eram puramente apresentacionais)
- [x] Ilhas Vue mantidas: `CardProfile` (bio com toggle) e `ContactPage` (formulário, com `States`/`Cities`/`FormField` aninhados)
- [x] Layout raiz (`Layout.astro`) com toggle de tema (script vanilla, igual antes), analytics Umami, transições de página via `<ClientRouter />` nativo do Astro (substitui o `<transition name="fade">` do Vue Router)

### Fase 4 — i18n e roteamento
- [x] Roteamento por prefixo: `/`, `/stack`, `/projetos`, `/contato` (pt, padrão) e `/en/...`, `/jp/...`
- [x] Detecção de idioma do navegador na primeira visita, com fallback pt e respeito à escolha manual

### Fase 5 — Infraestrutura e validação
- [x] Hook de pre-push (Husky) rodando `test:unit` + `build` automaticamente
- [x] Removidos: `router.js`, `App.vue`, `main.js` (antigo), `vite.config.js` (antigo), `index.html`, e as views/componentes órfãos (`StackPage.vue`, `ProjectPage.vue`, `Home.vue`, `NotFound.vue`, `ContactPage.cy.js` — teste órfão nunca conectado a nenhum script)
- [x] `netlify.toml`: removido o redirect catch-all `/* → /index.html` (próprio de SPA, quebraria o roteamento estático do Astro); `public/_redirects` também ajustado
- [x] `npm run build` (Astro), `npm run test:unit` (Vitest) e `npm run test:e2e` (Cypress, 8 testes incluindo `multilanguage.cy.js` reescrito para navegação por URL) passando
- [x] Testado manualmente no navegador: preenchimento e envio do formulário de contato funcionando ponta a ponta (incluindo a função Netlify)

### Resultado mensurável
- Páginas estáticas (Stack, Projects): **0KB de JS de framework** (antes: ~77KB gzip de runtime Vue completo em toda navegação)
- `public/`: 4.2MB → 1.7MB
- Dependências diretas: 41 → substancialmente menos após remover FontAwesome (4), Jitsi, date-fns, stylus, vue-meta, vue-router, vue3-i18n (7 pacotes só de dependencies), adicionando Astro + 2 integrações
- Build: 13 páginas geradas em ~1s

### Não feito nesta rodada (oportunidades futuras)
- Tradução das URLs por locale (hoje `/en/projetos` mantém o slug em português — decisão consciente de menor complexidade, ver seção de i18n)
- `eslint.config.js` não tem suporte nativo a `.astro` (precisaria de `eslint-plugin-astro`)
- Página 404 não é localizada (sempre em pt)
- Compressão adicional de `public/cv/`, `public/projects/`, `public/stack/` (WebP em qualidade mais agressiva, ou AVIF)
