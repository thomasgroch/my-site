# Arquitetura

As decisões que o código sozinho não explica. O que é e onde fica está no README.

## Princípios

- **Toda página abaixo de 512KB sem compressão** ([512KB Club](https://512kb.club/)). O `measure` falha acima disso, então o limite trava a publicação.
- **Zero framework no navegador.** O único JavaScript de terceiros é o htmx, e só em `/contato`. O resto são dois listeners inline (tema e menu mobile).
- **Um comando, um caminho.** `npm run verify` roda igual no terminal, no `pre-push` e no build do Netlify. Qualquer falha cancela o deploy e mantém o anterior no ar.

## Conteúdo

- Tudo passa por coleções do Astro (`src/content.config.js`). O esquema é o contrato: se o conteúdo estiver inválido, o build quebra.
- Todo texto que o visitante lê vem como `{ pt, en }`, com os dois idiomas obrigatórios. Não existe fallback de idioma.
- As imagens ficam em `src/assets/<coleção>/<entrada>/`, com caminho relativo à entrada (`../../assets/...`), que é o que o `image()` do Astro espera. O painel grava na mesma pasta, com o nome do arquivo enviado.
- Os conteúdos de arquivo único (`meta.yaml` e o `basics` do `resume.json`) viram uma entrada só, lida com `getEntry`. No `/meta`, a ordem dos grupos é a ordem da lista.
- O `src/data/resume.json` segue o formato [JSON Resume](https://jsonresume.org/) e é a fonte da identidade (nome, cargo e redes). A coleção `resume` lê esse arquivo sem copiá-lo. Ele fica fora do painel porque seria regravado inteiro só com os campos que o painel conhece.
- O painel é o [Sveltia CMS](https://sveltiacms.app/), uma página estática em `public/admin/` que carrega o script do unpkg, com versão fixa. A configuração (`public/admin/config.yml`) repete os esquemas de `src/content.config.js`: mudou um, muda o outro. O corpo dos posts só tem o modo raw, porque o rich text reescreveria o MDX.

## Painel de conteúdo

- **No site** (`/admin/`): login com GitHub pelo OAuth do Netlify, o padrão do Sveltia. Também aceita um token do GitHub (fine-grained, só este repositório, com Contents e Pull requests em read and write).
- **Posts passam pelo Editorial Workflow**: salvar cria um branch e um PR, e o Netlify gera um deploy preview com os rascunhos visíveis (`BLOG_DRAFTS=1` no contexto `deploy-preview` do `netlify.toml`). Publicar é o merge, feito pelo painel. Depois do merge, `draft: true` ainda segura o post fora de produção.
- **O resto salva direto na `main`**, com mensagem `content(<coleção>): ...`. Todo deploy passa pelo `npm run verify`: conteúdo inválido cancela a publicação.
- **Textos do site**: `src/locales/*.json` aparece no painel com pt e en lado a lado. O painel só grava os campos que conhece, então chave nova no JSON precisa do campo em `public/admin/config.yml`, na mesma ordem. O `test/admin.test.js` confere isso.
- **Preview**: `public/admin/preview.css` imita a tipografia dos posts. Componentes MDX aparecem como texto; o post de verdade está no deploy preview.
- **No `npm run dev`**: `http://localhost:3000/admin/index.html` num navegador Chromium, "Work with Local Repository", e escolha a pasta do projeto. Grava direto nos arquivos; o commit é seu.
- **Configurar o OAuth**, uma vez:
  1. No GitHub, em Settings > Developer settings > OAuth Apps > New OAuth App: homepage `https://thomasdev.xyz` e callback `https://api.netlify.com/auth/done`. Gere um client secret.
  2. No Netlify, no site, em Project configuration > Access & security > OAuth > Install provider: GitHub, com o client ID e o secret do passo anterior.
  3. O login só funciona no domínio do site (`site_id` é o hostname). Em `localhost`, use o repositório local.

## Idiomas

- `/` é pt-BR e `/en/` é inglês, com prefixo de URL e um tradutor próprio (`src/i18n/`). A primeira visita segue o idioma do navegador. `/jp/*` responde 301 para `/en/*`.
- O blog existe só em inglês, em `/blog`, sem prefixo: `Layout` recebe `alternates={false}`. Rascunhos (`draft: true`) aparecem no dev, ficam fora do build e nunca entram no feed. `BLOG_DRAFTS=1` os inclui no build. Posts com o mesmo `series` formam uma série: cada um ganha a lista das partes, na ordem de `seriesPart`, e o link para a próxima (`seriesOf` em `src/lib/blog.js`).

## Contato

- O formulário faz POST para `functions/contact.mjs` (Netlify Functions v2, zero dependências, API REST do Mailgun). Os textos ficam em `src/lib/contact-messages.mjs` e são compartilhados entre a página e a função.
- Com JavaScript, o htmx troca a resposta HTML no lugar. Sem JavaScript, a função redireciona para `#enviado` ou `#erro`, e a caixa aparece via `:target`.
- Sem `MAILGUN_API_KEY`, a função responde sucesso sem enviar nada. Isso vale para o desenvolvimento e para os testes.

## Navegação

- A navegação é por página completa, sem `hx-boost`. Com páginas de ~50KB ela já é instantânea, e o boost exigiria o htmx em todas as páginas (+36KB), além de cuidar de `<head>`, tema e analytics entre as trocas.

## Testes

- Quase tudo roda em Node puro: `test/dist.test.js` lê o `dist/` com `linkedom`. Nada no caminho de publicação depende de um binário de navegador, que muda de plataforma para plataforma.
- O Cypress cobre só o que exige navegador de verdade, o htmx trocando a resposta, e fica fora do `verify`.
- Os scripts de `scripts/` (links internos, classes de CSS inexistentes, orçamento de peso) não têm dependências.

## Repositório

- O histórico público começa em setembro de 2026, com um único commit. O histórico anterior tinha dados pessoais nos metadados e 40MB de objetos antigos, e fica no repositório privado `my-site-history`.
- Os commits usam `Thomas Dev <contato@thomasdev.xyz>`. O sobrenome não aparece no site nem no repositório.
