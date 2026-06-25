## 2026-06-16 - Tree-shaking FontAwesome icons

**Aprendizado:** O uso de imports globais para bibliotecas de ícones como FontAwesome (`fas`, `fab`, `far`) impede o tree-shaking, resultando em bundles extremamente grandes (2MB+ no caso deste projeto). Importar ícones individualmente permite que o bundler remova milhares de ícones não utilizados.

**Aplicação futura:** Sempre verificar `main.js` ou arquivos de configuração de ícones em projetos Vue/React. Substituir imports de "sets" inteiros por ícones específicos. No Vite, o ganho de performance no carregamento inicial (LCP) é drástico e mensurável através do comando `npm run build`.

## 2025-05-13 - Otimização de bundle via Lazy Loading e Pruning

**Aprendizado:** A combinação de remoção de dependências pesadas e não utilizadas (`moment`, `faunadb`, `vee-validate`) com o carregamento preguiçoso (lazy loading) de rotas e assets pesados (`brasil.json` de 134KB) resultou em uma redução de ~38% do bundle principal (de 443KB para 275KB).

**Aplicação futura:**
1. Auditar `package.json` para remover bibliotecas obsoletas ou não utilizadas.
2. Implementar `import()` dinâmico para rotas em `vue-router`.
3. Mover grandes arquivos estáticos (JSON, grandes constantes) para imports dinâmicos dentro dos componentes que os utilizam, retirando-os do caminho crítico de carregamento.

## 2026-06-25 - Dependency pruning and native Date migration

**Aprendizado:** A substituição de bibliotecas de manipulação de data (`date-fns`) por APIs nativas do JavaScript (`Date`) em componentes isolados reduz o bundle size final sem perda de funcionalidade. Além disso, a auditoria e remoção de dependências não utilizadas (`mailgun.js`, `@headlessui/vue`) mantém o projeto limpo e evita carregamento de código desnecessário.

**Aplicação futura:** Antes de adicionar uma biblioteca para tarefas comuns (datas, manipulação de arrays), avaliar se as APIs nativas modernas são suficientes. Realizar limpezas periódicas no `package.json` baseadas em buscas no código fonte (`grep`).
