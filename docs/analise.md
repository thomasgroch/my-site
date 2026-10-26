# Análise

Visão de negócio do site: que problema ele resolve, como resolve hoje e onde estão os riscos. O que é e onde fica está no README; o porquê técnico, em `arquitetura.md`.

## Problema

Um desenvolvedor independente precisa ser encontrado, avaliado e contratado. Para isso precisa de:

1. **Vitrine confiável**: quem é, o que já fez (projetos) e com o quê (stack), em português e inglês.
2. **Prova de competência**: algo além de uma lista, que mostre como pensa e entrega.
3. **Canal de contato** que funcione sempre, sem expor o e-mail a robôs.
4. **Custo de manutenção perto de zero**: sem servidor, sem atualizações de framework quebrando o site, sem conta de hospedagem.

## Solução hoje

| Necessidade | Como o site resolve |
|---|---|
| Vitrine | Páginas estáticas em Astro (`/`, `/stack`, `/projetos`), pt-BR em `/` e inglês em `/en/`. Identidade num `resume.json` (JSON Resume), projetos e stack em YAML validado por esquema. |
| Prova de competência | O próprio site é o portfólio: abaixo de 512 KB por página, sem framework no navegador, `/meta` explicando como é feito. O blog (inglês) traz a série "LLMs in the browser", com modelos rodando no navegador, jogos (cobrinha, Pac-Man, Millionaire) e narração em português com karaokê. |
| Contato | Formulário com htmx + Netlify Function sem dependências, envio pelo Mailgun, honeypot contra spam. Sem JavaScript, funciona por redirect. |
| Manutenção | Netlify (plano gratuito), painel Sveltia CMS em `/admin/` para editar sem abrir o código, e um único comando (`npm run verify`) que trava a publicação se algo quebrar. |

## Fluxo de ponta a ponta

1. **Editar**: no código, ou no painel (`/admin/`). Posts viram PR com deploy preview; o resto vira commit na `main`.
2. **Verificar**: `pre-push` e o build do Netlify rodam `verify` (lint, build, testes, links, classes de CSS, peso).
3. **Publicar**: o Netlify só troca o deploy se tudo passar. Commits que só mexem em docs não geram build.
4. **Servir**: HTML estático com cache imutável nos assets; Edge Function protege rascunhos do blog; função de contato sob demanda.
5. **Medir**: Umami (fora do orçamento de peso).

## Pontos fortes

- **Risco operacional baixo**: estático, quase sem dependências em produção (Astro, htmx, mermaid), deploy atômico com rollback implícito.
- **Qualidade obrigatória, não opcional**: o mesmo `verify` local e no CI; esquemas de conteúdo quebram o build.
- **Acessível e leve**: funciona sem JavaScript, respeita tema do sistema e `prefers-reduced-motion`.
- **Documentação acima da média**: README (o quê/onde), `arquitetura.md` (porquê), `convencoes.md` (regras).

## Riscos e lacunas

| Risco | Impacto | Sugestão |
|---|---|---|
| Configuração fora do repositório (variáveis `DRAFT_KEY`, `GIT_LFS_*`, chaves do Mailgun, OAuth, plugin do Cypress na interface) | Recriar o site no Netlify do zero esquece algo; já aconteceu com o áudio em LFS | Manter uma lista única de "configuração do painel do Netlify" no README |
| Esquema duplicado entre `src/content.config.js` e `public/admin/config.yml` | Campo novo some do painel | Só `src/locales/` é testado (`admin.test.js`); estender o teste às coleções |
| Narração depende de um Mac com mlx-audio | Só o autor gera áudio | Aceitável para um site pessoal; está documentado |
| Blog só em inglês, vitrine bilíngue | Público pt-BR vê menos conteúdo | Decisão de produto; vale registrar o motivo |
| Cypress fora do `verify` | O htmx pode quebrar sem aviso | Rodar o e2e manualmente antes de mudar o contato |
| Sem métrica de conversão | Não se sabe quantos contatos vêm de cada página | Evento do Umami no envio do formulário |

## Estado da documentação (outubro de 2026)

Conferida contra o código no commit `8276e3b`. Estava correta no essencial; as divergências foram corrigidas junto com este arquivo:

- A tabela de testes do README listava 3 dos 9 arquivos de `test/`.
- `convencoes.md` listava como átomos e moléculas componentes que só existem como classe (Chip, Button, Field, Meter, Kicker) ou como função (`Bars`), e falava da duplicação em Snake e PacMan no presente, já extraída para `arcade.js`.
- `.entire/`, `public/humans.txt`, `public/privacy` e `public/random` não eram citados.
