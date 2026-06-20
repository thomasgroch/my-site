## 2026-06-16 - Tree-shaking FontAwesome icons

**Aprendizado:** O uso de imports globais para bibliotecas de ícones como FontAwesome (`fas`, `fab`, `far`) impede o tree-shaking, resultando em bundles extremamente grandes (2MB+ no caso deste projeto). Importar ícones individualmente permite que o bundler remova milhares de ícones não utilizados.

**Aplicação futura:** Sempre verificar `main.js` ou arquivos de configuração de ícones em projetos Vue/React. Substituir imports de "sets" inteiros por ícones específicos. No Vite, o ganho de performance no carregamento inicial (LCP) é drástico e mensurável através do comando `npm run build`.

## 2025-05-13 - Otimização de bundle via Lazy Loading e Pruning

**Aprendizado:** A combinação de remoção de dependências pesadas e não utilizadas (`moment`, `faunadb`, `vee-validate`) com o carregamento preguiçoso (lazy loading) de rotas e assets pesados (`brasil.json` de 134KB) resultou em uma redução de ~38% do bundle principal (de 443KB para 275KB).

**Aplicação futura:**
1. Auditar `package.json` para remover bibliotecas obsoletas ou não utilizadas.
2. Implementar `import()` dinâmico para rotas em `vue-router`.
3. Mover grandes arquivos estáticos (JSON, grandes constantes) para imports dinâmicos dentro dos componentes que os utilizam, retirando-os do caminho crítico de carregamento.

## 2026-06-20 - Substituição de bibliotecas de utilitários por métodos nativos

**Learning:** O uso de bibliotecas de utilitários como `date-fns` em componentes individuais pode aumentar significativamente o tamanho do chunk, especialmente se a árvore de dependências for complexa. Para tarefas simples de manipulação de datas e cálculos de diferença de tempo, os métodos nativos da API `Date` do JavaScript são suficientes e eliminam o overhead de importação de bibliotecas externas. Neste caso, a substituição reduziu o chunk do componente de 45kB para 11kB.

**Action:** Sempre avaliar se uma biblioteca de utilitários é estritamente necessária para a tarefa em mãos. Priorizar implementações nativas para lógica simples em componentes que são carregados via lazy loading para manter os chunks leves.
