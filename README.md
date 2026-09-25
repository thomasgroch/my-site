# thomasdev.xyz

[![Netlify Status](https://api.netlify.com/api/v1/badges/0e2b53bc-ab0e-4c27-a171-7ecc29f4ca67/deploy-status)](https://app.netlify.com/sites/thomasdeveloper/deploys)

Site pessoal de Thomas Dev. Estático, em português e inglês, sem framework no navegador, e com todas as páginas abaixo de 512KB sem compressão (meta do [512KB Club](https://512kb.club/)).

## Stack

- **[Astro 7](https://astro.build/)** gera o HTML. Nenhuma página carrega framework JavaScript; o único JS de terceiros é o htmx, e só na página de contato.
- **[Tailwind CSS 4](https://tailwindcss.com/)** pelo plugin do Vite, configurado em `src/tailwind.css`. Tema claro/escuro por classe, com a preferência do sistema como padrão.
- **[htmx 4](https://htmx.org/)** envia o formulário de contato e troca a resposta HTML da função no lugar. Sem JavaScript o formulário continua funcionando por redirect.
- **Netlify Functions** (`functions/contact.mjs`, API v2, zero dependências) valida, aplica honeypot e envia os e-mails pela API REST do Mailgun.
- **Rotas**: `/`, `/stack`, `/projetos` e `/contato` no menu, mais `/meta`, que documenta o que constrói o site e fica fora da navegação.
- **i18n por prefixo de URL**: `/` é pt-BR e `/en/` inglês. Textos em `src/locales/`, tradutor em `src/i18n/`. A primeira visita segue o idioma do navegador. `/jp/*` redireciona para `/en/*`.

## Onde cada coisa fica

| O quê | Onde |
|---|---|
| Nome, cargo e redes | `src/data/resume.json` (JSON Resume), lido pela coleção `resume` |
| Projetos e stack | um YAML por entrada em `src/content/projects/` e `src/content/stack/` |
| Bio e textos da interface | `src/locales/*.json` |
| Textos do formulário e dos e-mails | `src/lib/contact-messages.mjs` (compartilhado com a função) |
| Páginas | `src/pages/` (wrappers por idioma) e `src/components/routes/` (conteúdo) |
| Blog (só em inglês) | posts MDX em `src/content/blog/`, páginas em `src/pages/blog/`, feed em `/rss.xml`. `draft: true` fica fora do build |
| Esquemas do conteúdo | `src/content.config.js`: texto sempre em `{ pt, en }`; conteúdo inválido quebra o build |
| Painel de conteúdo | Sveltia CMS em `/admin/` (`public/admin/config.yml`). No site, login com GitHub: posts viram PR com deploy preview dos rascunhos, o resto é commit direto; no `npm run dev`, grava nos arquivos. Configuração em `docs/arquitetura.md` |
| Imagens | `src/assets/<coleção>/<entrada>/`, otimizadas pelo Astro no build |
| Colofão em `/meta` | `src/content/meta.yaml`, com as versões lidas do `package-lock.json` no build |
| Marca | monograma "TD" em `src/components/Monogram.astro`, `public/favicon.svg`, `public/og.png` |
| Redirects, headers, plugins | `netlify.toml` |

## Scripts

```sh
npm run dev      # site em :3000 + funções em :8888 (proxy pelo Vite)
npm run verify   # a pipeline inteira: lint, build, testes e verificações
npm run build    # só gera dist/
npm run preview  # serve dist/ em :3000
npm run test:e2e # cypress; precisa do dev rodando em outro terminal
```

`verify` é o mesmo comando no seu terminal, no hook de `pre-push` e no build do Netlify. Ele roda, em ordem: `lint`, `build`, `test:unit`, `check:links`, `check:css` e `measure`. Se qualquer etapa falhar, a publicação é cancelada e o deploy anterior continua no ar. Node 22.12 ou superior.

## Testes

Quase tudo roda sem navegador, em Node puro, então o resultado é o mesmo no Mac, no Linux e no build do Netlify:

| Arquivo | O que cobre | Precisa de quê |
|---|---|---|
| `test/i18n.test.js` | tradutor, prefixos de URL, paridade entre idiomas | nada |
| `test/contact.test.js` | função de contato: validação, honeypot, escape, chamadas ao Mailgun | nada |
| `test/dist.test.js` | o HTML publicado: formulário, idiomas, SEO, imagens, script de redirecionamento | `dist/`, gerado pelo `verify` |
| `cypress/e2e/contact-form.cy.js` | o único caso de navegador de verdade: o htmx trocando a resposta no lugar | servidor de dev no ar |

O Cypress fica fora do `verify` de propósito: ele precisa de um servidor e de um binário de navegador, e nada disso pertence ao caminho de publicação.

## Variáveis de ambiente

Veja `.env.example`. A função de contato usa `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM` (remetente), `MAILGUN_SENDER` (destino da notificação) e, opcionalmente, `MAILGUN_HOST` para a região EU. Sem a chave, a função responde sucesso sem enviar nada, o que serve para desenvolvimento e testes.

## Peso

Medido com `npm run measure`, sem compressão, que é como o [512KB Club](https://512kb.club/) conta: HTML, CSS, JavaScript, imagens e o maior ícone declarado. O comando imprime a tabela por página e falha acima de 512 KB, então o orçamento é obrigatório. O analytics do Umami (4,6 KB, de `cloud.umami.is`) fica fora da conta.

## Arquitetura

As decisões por trás da estrutura estão em [`docs/arquitetura.md`](docs/arquitetura.md).
