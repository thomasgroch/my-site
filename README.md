# thomasdev.xyz

[![Netlify Status](https://api.netlify.com/api/v1/badges/0e2b53bc-ab0e-4c27-a171-7ecc29f4ca67/deploy-status)](https://app.netlify.com/sites/thomasdeveloper/deploys)

Site pessoal de Thomas Dev. Estático, em português e inglês, sem framework no navegador, e com todas as páginas abaixo de 512KB sem compressão (meta do [512KB Club](https://512kb.club/)).

## Stack

- **[Astro 7](https://astro.build/)** gera o HTML. Nenhuma página carrega framework JavaScript; o único JS de terceiros é o htmx, e só na página de contato.
- **[Tailwind CSS 4](https://tailwindcss.com/)** pelo plugin do Vite, configurado em `src/tailwind.css`. Tema claro/escuro por classe, com a preferência do sistema como padrão.
- **[htmx 4](https://htmx.org/)** envia o formulário de contato e troca a resposta HTML da função no lugar. Sem JavaScript o formulário continua funcionando por redirect.
- **Netlify Functions** (`functions/contact.mjs`, API v2, zero dependências) valida, aplica honeypot e envia os e-mails pela API REST do Mailgun.
- **i18n por prefixo de URL**: `/` é pt-BR e `/en/` inglês. Textos em `src/locales/`, tradutor em `src/i18n/`. A primeira visita segue o idioma do navegador. `/jp/*` redireciona para `/en/*`.

## Onde cada coisa fica

| O quê | Onde |
|---|---|
| Bio, projetos, stack | `src/data/resume.json` e `src/locales/*.json` |
| Textos do formulário e dos e-mails | `src/lib/contact-messages.mjs` (compartilhado com a função) |
| Páginas | `src/pages/` (wrappers por idioma) e `src/components/routes/` (conteúdo) |
| Imagens | `src/assets/` (otimizadas pelo Astro no build) |
| Marca | monograma "TD" em `src/components/Monogram.astro`, `public/favicon.svg`, `public/og.png` |
| Redirects, headers, plugins | `netlify.toml` |

## Scripts

```sh
npm run dev        # site em :3000 + funções em :8888 (proxy pelo Vite)
npm run build      # gera dist/
npm run preview    # serve dist/ em :3000
npm run measure    # peso de cada página do build, falha acima de 512KB
npm run check:css  # confere se toda classe dos templates existe no CSS gerado
npm run test:unit  # vitest: i18n e função de contato
npm run test:e2e   # cypress contra CYPRESS_BASE_URL (padrão :3000, precisa do dev rodando)
npm run lint
```

O hook de `pre-push` roda `test:unit` e `build`. Node 22.12 ou superior.

## Variáveis de ambiente

Veja `.env.example`. A função de contato usa `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM` (remetente), `MAILGUN_SENDER` (destino da notificação) e, opcionalmente, `MAILGUN_HOST` para a região EU. Sem a chave, a função responde sucesso sem enviar nada, o que serve para desenvolvimento e testes.

## Peso

Medido com `npm run measure`, sem compressão:

| Página | Peso | Faixa |
|---|---|---|
| Home | 41 KB | verde |
| Contato | 78 KB | verde |
| Stack | 110 KB | laranja |
| Projetos | 135 KB | laranja |

Cada página carrega ainda o script do Umami (analytics, ~2KB) de `cloud.umami.is`.

## Histórico

O repositório público começa em setembro de 2026, quando o site foi reconstruído. Os documentos em `docs/` contam as decisões dessa reconstrução. O histórico anterior fica em um repositório privado.
