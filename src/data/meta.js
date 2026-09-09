// Conteúdo da página /meta: o que constrói e serve este site.
//
// Ao contrário do resto do conteúdo, os textos ficam aqui e não em
// `src/locales/`, porque cada nota é inseparável do item que descreve. As
// versões não são escritas à mão: vêm do package-lock.json no build (ver
// `version()` em MetaRoute.astro), então nunca ficam desatualizadas.

export const groups = [
  {
    id: 'browser',
    title: { pt: 'No navegador', en: 'In the browser' },
    intro: {
      pt: 'Tudo que o visitante realmente baixa. Não há framework de JavaScript em página nenhuma.',
      en: 'Everything a visitor actually downloads. No JavaScript framework on any page.',
    },
    items: [
      {
        name: 'htmx',
        pkg: 'htmx.org',
        url: 'https://htmx.org/',
        note: {
          pt: 'Carregado só na página de contato. Envia o formulário e troca a resposta HTML da função no lugar, sem recarregar.',
          en: 'Loaded only on the contact page. It submits the form and swaps the function’s HTML response in place, without a reload.',
        },
      },
      {
        name: 'Tailwind CSS',
        pkg: 'tailwindcss',
        url: 'https://tailwindcss.com/',
        note: {
          pt: 'Uma folha de estilo única para o site inteiro, configurada no próprio CSS. Tema claro e escuro por classe.',
          en: 'A single stylesheet for the whole site, configured in the CSS itself. Light and dark themes by class.',
        },
      },
      {
        name: 'SVG embutido',
        nameEn: 'Inline SVG',
        url: 'https://developer.mozilla.org/docs/Web/SVG',
        note: {
          pt: 'Monograma, ícones de rede social e o favicon. Sem biblioteca de ícones e sem requisição extra.',
          en: 'Monogram, social icons and the favicon. No icon library and no extra request.',
        },
      },
    ],
  },
  {
    id: 'build',
    title: { pt: 'Geração do site', en: 'Site generation' },
    intro: {
      pt: 'Roda no build e desaparece: o resultado é HTML estático.',
      en: 'Runs at build time and disappears: the result is static HTML.',
    },
    items: [
      {
        name: 'Astro',
        pkg: 'astro',
        url: 'https://astro.build/',
        note: {
          pt: 'Gera as páginas nos dois idiomas, otimiza as imagens e não envia JavaScript por padrão.',
          en: 'Generates the pages in both languages, optimizes images and ships no JavaScript by default.',
        },
      },
      {
        name: '@tailwindcss/vite',
        pkg: '@tailwindcss/vite',
        url: 'https://tailwindcss.com/docs/installation/using-vite',
        note: {
          pt: 'Integração do Tailwind 4 com o Vite, que o Astro usa por baixo. Dispensa PostCSS e autoprefixer.',
          en: 'Tailwind 4 integration with Vite, which Astro uses underneath. No PostCSS or autoprefixer needed.',
        },
      },
      {
        name: '@astrojs/sitemap',
        pkg: '@astrojs/sitemap',
        url: 'https://docs.astro.build/en/guides/integrations-guide/sitemap/',
        note: {
          pt: 'Sitemap com as versões alternativas de cada página por idioma.',
          en: 'Sitemap with the alternate language version of each page.',
        },
      },
      {
        name: 'Node.js',
        version: '22',
        url: 'https://nodejs.org/',
        note: {
          pt: 'Versão fixada no Netlify para o build ser igual ao ambiente local.',
          en: 'Pinned on Netlify so the build matches the local environment.',
        },
      },
    ],
  },
  {
    id: 'backend',
    title: { pt: 'Formulário e e-mail', en: 'Form and e-mail' },
    intro: {
      pt: 'A única parte do site que não é estática.',
      en: 'The only part of the site that is not static.',
    },
    items: [
      {
        name: 'Netlify Functions',
        url: 'https://docs.netlify.com/functions/overview/',
        note: {
          pt: 'Uma função, sem dependência nenhuma: valida os campos, barra robôs com honeypot e responde em HTML.',
          en: 'One function, with zero dependencies: it validates the fields, blocks bots with a honeypot and answers in HTML.',
        },
      },
      {
        name: 'Mailgun',
        url: 'https://www.mailgun.com/',
        note: {
          pt: 'Envio dos dois e-mails pela API REST, chamada com fetch. Sem SDK.',
          en: 'Both e-mails sent through the REST API, called with fetch. No SDK.',
        },
      },
    ],
  },
  {
    id: 'quality',
    title: { pt: 'Testes e qualidade', en: 'Tests and quality' },
    intro: {
      pt: 'Um comando só roda tudo isso, no terminal e no build. Se qualquer etapa falhar, a publicação é cancelada.',
      en: 'A single command runs all of it, in the terminal and in the build. If any step fails, publishing is cancelled.',
    },
    items: [
      {
        name: 'Vitest',
        pkg: 'vitest',
        url: 'https://vitest.dev/',
        note: {
          pt: 'Testa o tradutor, a função de contato e o HTML publicado. Sem navegador, então roda igual em qualquer sistema.',
          en: 'Tests the translator, the contact function and the published HTML. No browser, so it behaves the same on any system.',
        },
      },
      {
        name: 'linkedom',
        pkg: 'linkedom',
        url: 'https://github.com/WebReflection/linkedom',
        note: {
          pt: 'Lê o HTML gerado nos testes, no lugar de abrir um navegador.',
          en: 'Reads the generated HTML in tests, instead of opening a browser.',
        },
      },
      {
        name: 'Cypress',
        pkg: 'cypress',
        url: 'https://www.cypress.io/',
        note: {
          pt: 'Reservado ao único caso que precisa de navegador de verdade: o htmx trocando a resposta. Fica fora do caminho de publicação.',
          en: 'Reserved for the one case that needs a real browser: htmx swapping the response. It stays out of the publishing path.',
        },
      },
      {
        name: 'ESLint',
        pkg: 'eslint',
        url: 'https://eslint.org/',
        note: { pt: 'Análise estática do JavaScript.', en: 'Static analysis of the JavaScript.' },
      },
      {
        name: 'Scripts próprios',
        nameEn: 'Custom scripts',
        url: 'https://github.com/thomasgroch/my-site/tree/main/scripts',
        note: {
          pt: 'Três verificações sem dependência: links internos quebrados, classes de CSS que não existem e o orçamento de peso de cada página.',
          en: 'Three dependency-free checks: broken internal links, CSS classes that do not exist, and the weight budget of each page.',
        },
      },
    ],
  },
  {
    id: 'infra',
    title: { pt: 'Infraestrutura', en: 'Infrastructure' },
    intro: { pt: 'Onde o site mora.', en: 'Where the site lives.' },
    items: [
      {
        name: 'Netlify',
        url: 'https://www.netlify.com/',
        note: {
          pt: 'Build, CDN, redirecionamentos e cabeçalhos. Cada publicação passa pela verificação completa antes de ir ao ar.',
          en: 'Build, CDN, redirects and headers. Every publish goes through the full verification before going live.',
        },
      },
      {
        name: 'GitHub',
        url: 'https://github.com/thomasgroch/my-site',
        note: { pt: 'Código-fonte e gatilho de publicação.', en: 'Source code and publishing trigger.' },
      },
      {
        name: 'Umami',
        url: 'https://umami.is/',
        note: {
          pt: 'Analytics sem cookies e sem dados pessoais. É o único recurso de terceiros que a página carrega.',
          en: 'Analytics with no cookies and no personal data. It is the only third-party resource the page loads.',
        },
      },
    ],
  },
]
