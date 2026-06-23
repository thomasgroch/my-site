## 2026-06-16 - Tree-shaking FontAwesome icons

**Aprendizado:** O uso de imports globais para bibliotecas de ícones como FontAwesome (`fas`, `fab`, `far`) impede o tree-shaking, resultando em bundles extremamente grandes (2MB+ no caso deste projeto). Importar ícones individualmente permite que o bundler remova milhares de ícones não utilizados.

**Aplicação futura:** Sempre verificar `main.js` ou arquivos de configuração de ícones em projetos Vue/React. Substituir imports de "sets" inteiros por ícones específicos. No Vite, o ganho de performance no carregamento inicial (LCP) é drástico e mensurável através do comando `npm run build`.

## 2025-05-13 - Otimização de bundle via Lazy Loading e Pruning

**Aprendizado:** A combinação de remoção de dependências pesadas e não utilizadas (`moment`, `faunadb`, `vee-validate`) com o carregamento preguiçoso (lazy loading) de rotas e assets pesados (`brasil.json` de 134KB) resultou em uma redução de ~38% do bundle principal (de 443KB para 275KB).

**Aplicação futura:**
1. Auditar `package.json` para remover bibliotecas obsoletas ou não utilizadas.
2. Implementar `import()` dinâmico para rotas em `vue-router`.
3. Mover grandes arquivos estáticos (JSON, grandes constantes) para imports dinâmicos dentro dos componentes que os utilizam, retirando-os do caminho crítico de carregamento.

## 2026-06-23 - Removendo date-fns e pruning de dependências

**Aprendizado:** Substituir bibliotecas de manipulação de datas como `date-fns` por lógica nativa de JavaScript `Date` pode reduzir drasticamente a complexidade de transformação do build e o tamanho dos chunks de rota (no caso do MeetPage, redução de ~75%). Além disso, a remoção de ~30 motores de template não utilizados e dependências desnecessárias do React/React-DOM simplifica o grafo de dependências e acelera a instalação/build.

**Aplicação futura:** Sempre avaliar se bibliotecas externas de utilitários são estritamente necessárias para operações simples. Auditar periodicamente o `package.json` para identificar "dependências fantasmagóricas" ou legadas de boilerplates.
