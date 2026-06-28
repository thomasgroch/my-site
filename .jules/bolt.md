## 2026-06-16 - Tree-shaking FontAwesome icons

**Aprendizado:** O uso de imports globais para bibliotecas de ícones como FontAwesome (`fas`, `fab`, `far`) impede o tree-shaking, resultando em bundles extremamente grandes (2MB+ no caso deste projeto). Importar ícones individualmente permite que o bundler remova milhares de ícones não utilizados.

**Aplicação futura:** Sempre verificar `main.js` ou arquivos de configuração de ícones em projetos Vue/React. Substituir imports de "sets" inteiros por ícones específicos. No Vite, o ganho de performance no carregamento inicial (LCP) é drástico e mensurável através do comando `npm run build`.

## 2025-05-13 - Otimização de bundle via Lazy Loading e Pruning

**Aprendizado:** A combinação de remoção de dependências pesadas e não utilizadas (`moment`, `faunadb`, `vee-validate`) com o carregamento preguiçoso (lazy loading) de rotas e assets pesados (`brasil.json` de 134KB) resultou em uma redução de ~38% do bundle principal (de 443KB para 275KB).

**Aplicação futura:**
1. Auditar `package.json` para remover bibliotecas obsoletas ou não utilizadas.
2. Implementar `import()` dinâmico para rotas em `vue-router`.
3. Mover grandes arquivos estáticos (JSON, grandes constantes) para imports dinâmicos dentro dos componentes que os utilizam, retirando-os do caminho crítico de carregamento.

## 2026-06-28 - Replacing date-fns with native Date arithmetic

**Learning:** Libraries like `date-fns` can significantly bloat route chunks even when only a few utility functions are used. For simple countdown logic or date comparisons, native JavaScript `Date` arithmetic (`date1 - date2` returns milliseconds) is often sufficient and zero-cost in terms of bundle size. Additionally, using a reactive `ref` for current time within `setInterval` ensures `computed` properties depending on time remain reactive.

**Action:** Before adding a date library for simple features like countdowns or relative time, evaluate if native `Date` methods and simple math can achieve the same result. This reduced a route chunk size by ~76% and build transformation count by ~39% in this project.
