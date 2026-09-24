# Arquitetura

As decisões que o código sozinho não explica. O que é e onde fica está no README.

## Princípios

- **Toda página abaixo de 512KB sem compressão** ([512KB Club](https://512kb.club/)). O `measure` falha acima disso, então o limite trava a publicação.
- **Zero framework no navegador.** O único JavaScript de terceiros é o htmx, e só em `/contato`. O resto são dois listeners inline (tema e menu mobile).
- **Um comando, um caminho.** `npm run verify` roda igual no terminal, no `pre-push` e no build do Netlify. Qualquer falha cancela o deploy e mantém o anterior no ar.

## Conteúdo

- Tudo passa por coleções do Astro (`src/content.config.js`). O esquema é o contrato: se o conteúdo estiver inválido, o build quebra.
- Todo texto que o visitante lê vem como `{ pt, en }`, com os dois idiomas obrigatórios. Não existe fallback de idioma.
- As imagens ficam em `src/assets/<coleção>/<entrada>/<campo>.<ext>`, o mesmo caminho que o Keystatic grava. Com isso, editar à mão ou pelo painel dá o mesmo resultado.
- Os conteúdos de arquivo único (`meta.yaml` e o `basics` do `resume.json`) viram uma entrada só, lida com `getEntry`. No `/meta`, a ordem dos grupos é a ordem da lista.
- O `src/data/resume.json` segue o formato [JSON Resume](https://jsonresume.org/) e é a fonte da identidade (nome, cargo e redes). A coleção `resume` lê esse arquivo sem copiá-lo. Ele fica fora do Keystatic porque o painel regravaria o arquivo inteiro só com os campos que conhece.
- O Keystatic roda em modo `local` e só no `astro dev`: as rotas dele não são pré-renderizáveis. O build continua estático, sem adapter e sem React.

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
