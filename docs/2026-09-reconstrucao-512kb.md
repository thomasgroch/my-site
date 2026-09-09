# Reconstrução para o 512KB Club (setembro/2026)

Terceira rodada depois de `2026-06-analise-512kb.md` (ideia: HTML puro) e `2026-08-plano-astro.md` (execução: Astro + ilhas Vue). Esta rodada tira o Vue por completo e fecha o orçamento de peso em todas as páginas.

## O que mudou

- **Zero framework no navegador.** As ilhas Vue (bio da home, formulário de contato) viraram HTML. O único JavaScript de terceiros é o htmx (37KB), carregado só em `/contato`; o resto do site usa dois listeners inline (tema e menu mobile).
- **Formulário de contato.** Nome, e-mail e mensagem obrigatórios; telefone e cidade/estado opcionais em texto livre. Saiu a lista de cidades do Brasil (`brazil.json`, 86KB) e a obrigatoriedade de estado, que impedia quem não é do Brasil de enviar. O htmx faz o POST e troca a resposta HTML da função no lugar; sem JavaScript, a função redireciona para `#enviado`/`#erro` e a caixa aparece via CSS `:target`.
- **Função Netlify** (`functions/contact.mjs`, API v2). Zero dependências: chama a API REST do Mailgun com `fetch`. Honeypot, validação, escape de HTML, `Reply-To` com o e-mail de quem escreveu, textos por idioma em `src/lib/contact-messages.mjs` (compartilhado com a página). Os templates Stripo de 16KB viraram um e-mail simples com o mesmo texto.
- **Imagens.** Avatar e ícones derivados removidos; no lugar, um monograma "TG" em SVG (mesma arte no favicon e no `og.png`). Logos e capturas foram para `src/assets/` e passam pelo `<Image>` do Astro (64px para logos, 384px para projetos). O GIF externo de 4,5MB virou um frame estático; a imagem do Cloudinary foi baixada.
- **SEO.** Canonical, `hreflang` entre pt-BR/en/ja, Open Graph, sitemap com alternates, `robots.txt`, description por página e idioma, `<html lang>` correto (`ja` em vez de `jp`; o prefixo de URL `/jp/` foi mantido por compatibilidade).
- **Tema.** `darkMode: 'class'` no Tailwind (antes o botão não fazia nada), padrão pelo `prefers-color-scheme`, `color-scheme` acompanhando.
- **Conteúdo.** Todos os textos foram mantidos, com correção de erros de digitação. Stack: Stylus, FaunaDB, Nobackend e Heroku foram para a seção "Histórico". As descrições da stack em en/jp estavam deslocadas uma seção (Back-end recebia o texto de Front-end etc.) e foram remapeadas por significado. Currículo em PDF passou a ser linkado na home.

## Medição

`npm run measure` depois do build, sem compressão:

| Página | Peso | Faixa |
|---|---|---|
| Home | 36 KB | verde |
| Contato | 73 KB | verde |
| Stack | 106 KB | laranja |
| Projetos | 130 KB | laranja |

Antes: home ~300KB, stack ~600KB, projetos ~5.300KB, contato ~400KB.

## Decisões abertas

- `hx-boost` não foi ligado: com páginas de 40KB a navegação completa é instantânea e evita o cuidado com `<head>`/tema entre trocas. É um atributo no `<body>` se quiser experimentar.
- Descrições dos projetos existem só em português (`src/data/resume.json`). As páginas em en/jp mostram o texto em pt.
- Envio real pelo Mailgun confirmado em produção em 2026-09-09: notificação e agradecimento chegaram em contato@thomasdev.xyz.

## Atualização, 2026-09-09 à noite

- **Japonês removido** por decisão do dono do site: sobram pt-BR (`/`) e inglês (`/en/`). As URLs `/jp/*` respondem 301 para `/en/*` (`netlify.toml`), então links antigos não caem em 404.
- `MAILGUN_SENDER` no Netlify passou de `contato@thomasgroch.xyz` (domínio fora do ar) para `contato@thomasdev.xyz`.
- Branch `feat/astro-migration` apagada e PRs do Dependabot obsoletos fechados; `main` é a única linha.

## Astro 7 e Tailwind 4, 2026-09-09

Motivado pelos alertas de segurança do GitHub (todos em Astro < 7.2.8, um crítico no serviço de imagens, mais um no Vitest).

- `astro` 5.18 → 7.3, `@astrojs/tailwind` (só suporta Astro ≤ 5) → `@tailwindcss/vite` com Tailwind 4.3; `vitest` 3 → 5; `cypress` 14 → 16; `netlify-cli` 26 → 27. `postcss` e `autoprefixer` saíram (o Tailwind 4 cuida disso).
- A configuração do Tailwind virou CSS (`@theme`, `@custom-variant dark`, `@plugin`), gerada pela ferramenta oficial `@tailwindcss/upgrade`. Os utilitários renomeados no v4 (`rounded` → `rounded-sm`) foram trocados à mão nos templates; `scripts/check-classes.mjs` confere que toda classe usada existe no CSS gerado e falha se não existir.
- Astro 7: `compressHTML` passou a seguir regras JSX (espaço entre texto e `<span>` na home precisou ficar na mesma linha) e o compilador exige tags de fechamento em elementos não vazios (`<div set:html>`).
- `NODE_VERSION = "22"` explícito no `netlify.toml`; `engines.node >= 22.12` no `package.json`.
- Pesos: CSS foi de 24,7KB para 29,4KB por causa do preflight e da camada de compatibilidade de `border-color`; as páginas continuam entre 40KB e 135KB.

## Identidade e privacidade, 2026-09-09

- O site passa a usar **Thomas Dev** como nome (título, H1, rodapé, marca, og.png) e o monograma **TD**; o sobrenome não aparece mais no site nem nos docs. E-mails saem assinados só como Thomas e o remetente em `MAILGUN_FROM` virou `Thomas Dev <contato@thomasdev.xyz>`.
- O e-mail pessoal do `resume.json` foi trocado por `contato@thomasdev.xyz`.
- Os currículos em PDF saíram do site e do repositório (`public/cv/`); o botão da home virou um atalho para Projetos. A limpeza do histórico do git fica a cargo do dono do repositório.

## Reinício do histórico público, 2026-09-09

O repositório público ficou com **um único commit**. Motivo principal: os 281 commits anteriores traziam o sobrenome e o e-mail pessoal nos metadados de autor, além de 40MB de objetos antigos (artefatos de build commitados, vídeos do Cypress, imagens) para uma árvore de 1,3MB. O histórico completo continua no repositório privado `my-site-history`. Novos commits usam `Thomas Dev <contato@thomasdev.xyz>`.

Limpeza que acompanhou: memória de bot (`.jules/`), teste de exemplo do Cypress e boilerplate de suporte, `prettier` sem uso, chaves de tradução mortas, config de editor, `.gitignore` reduzido ao que o projeto usa.
