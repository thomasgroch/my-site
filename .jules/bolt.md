## 2026-06-16 - Tree-shaking FontAwesome icons

**Aprendizado:** O uso de imports globais para bibliotecas de ícones como FontAwesome (`fas`, `fab`, `far`) impede o tree-shaking, resultando em bundles extremamente grandes (2MB+ no caso deste projeto). Importar ícones individualmente permite que o bundler remova milhares de ícones não utilizados.

**Aplicação futura:** Sempre verificar `main.js` ou arquivos de configuração de ícones em projetos Vue/React. Substituir imports de "sets" inteiros por ícones específicos. No Vite, o ganho de performance no carregamento inicial (LCP) é drástico e mensurável através do comando `npm run build`.

## 2025-05-13 - Otimização de bundle via Lazy Loading e Pruning

**Aprendizado:** A combinação de remoção de dependências pesadas e não utilizadas (`moment`, `faunadb`, `vee-validate`) com o carregamento preguiçoso (lazy loading) de rotas e assets pesados (`brasil.json` de 134KB) resultou em uma redução de ~38% do bundle principal (de 443KB para 275KB).

**Aplicação futura:**
1. Auditar `package.json` para remover bibliotecas obsoletas ou não utilizadas.
2. Implementar `import()` dinâmico para rotas em `vue-router`.
3. Mover grandes arquivos estáticos (JSON, grandes constantes) para imports dinâmicos dentro dos componentes que os utilizam, retirando-os do caminho crítico de carregamento.

## 2026-07-05 - Redução de bundle via pruning de bibliotecas de data

**Aprendizado:** Bibliotecas como `date-fns` podem adicionar peso significativo ao bundle se usadas para operações simples. Substituir `date-fns` por aritmética nativa de JavaScript `Date` e refatorar a lógica para usar propriedades computadas sincronizadas por um único `ref` de tempo reduziu o chunk do `MeetPage` de 44.97 KB para 10.92 KB (~75% de redução).

**Aplicação futura:** Sempre avaliar se bibliotecas utilitárias externas são realmente necessárias para operações básicas. No Vue 3, centralizar a reatividade de tempo em um único `setInterval` que atualiza um `ref` central é mais eficiente do que múltiplos timers ou cálculos pesados em templates.
