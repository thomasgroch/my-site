## 2026-06-16 - Tree-shaking FontAwesome icons

**Aprendizado:** O uso de imports globais para bibliotecas de ícones como FontAwesome (`fas`, `fab`, `far`) impede o tree-shaking, resultando em bundles extremamente grandes (2MB+ no caso deste projeto). Importar ícones individualmente permite que o bundler remova milhares de ícones não utilizados.

**Aplicação futura:** Sempre verificar `main.js` ou arquivos de configuração de ícones em projetos Vue/React. Substituir imports de "sets" inteiros por ícones específicos. No Vite, o ganho de performance no carregamento inicial (LCP) é drástico e mensurável através do comando `npm run build`.

## 2025-05-13 - Otimização de bundle via Lazy Loading e Pruning

**Aprendizado:** A combinação de remoção de dependências pesadas e não utilizadas (`moment`, `faunadb`, `vee-validate`) com o carregamento preguiçoso (lazy loading) de rotas e assets pesados (`brasil.json` de 134KB) resultou em uma redução de ~38% do bundle principal (de 443KB para 275KB).

**Aplicação futura:**
1. Auditar `package.json` para remover bibliotecas obsoletas ou não utilizadas.
2. Implementar `import()` dinâmico para rotas em `vue-router`.
3. Mover grandes arquivos estáticos (JSON, grandes constantes) para imports dinâmicos dentro dos componentes que os utilizam, retirando-os do caminho crítico de carregamento.

## 2025-10-24 - Substituição de bibliotecas de utilitários por nativo e Pruning massivo

**Aprendizado:**
1. Bibliotecas de datas como `date-fns` ou `moment` podem ser pesadas (~30KB+ minified/gzipped). Para casos simples de parsing e cálculos de diferença, o objeto `Date` nativo e aritmética simples são suficientes e reduzem o tamanho do chunk da rota significativamente (neste caso, de 45KB para 11KB).
2. Manter dezenas de dependências de "template engines" (ejs, marko, mustache, etc.) herdadas de boilerplates ou de configurações como `consolidate.js` aumenta o tempo de build e a complexidade do `package.json` sem necessidade.

**Aplicação futura:**
1. Avaliar se utilitários (dates, strings, arrays) realmente necessitam de bibliotecas externas.
2. Realizar auditorias periódicas no `package.json` para remover "dead weight" de dependências que não são mais referenciadas no código fonte.
