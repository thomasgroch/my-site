## 2026-06-16 - Tree-shaking FontAwesome icons

**Aprendizado:** O uso de imports globais para bibliotecas de ícones como FontAwesome (`fas`, `fab`, `far`) impede o tree-shaking, resultando em bundles extremamente grandes (2MB+ no caso deste projeto). Importar ícones individualmente permite que o bundler remova milhares de ícones não utilizados.

**Aplicação futura:** Sempre verificar `main.js` ou arquivos de configuração de ícones em projetos Vue/React. Substituir imports de "sets" inteiros por ícones específicos. No Vite, o ganho de performance no carregamento inicial (LCP) é drástico e mensurável através do comando `npm run build`.

## 2025-05-13 - Otimização de bundle via Lazy Loading e Pruning

**Aprendizado:** A combinação de remoção de dependências pesadas e não utilizadas (`moment`, `faunadb`, `vee-validate`) com o carregamento preguiçoso (lazy loading) de rotas e assets pesados (`brasil.json` de 134KB) resultou em uma redução de ~38% do bundle principal (de 443KB para 275KB).

**Aplicação futura:**
1. Auditar `package.json` para remover bibliotecas obsoletas ou não utilizadas.
2. Implementar `import()` dinâmico para rotas em `vue-router`.
3. Mover grandes arquivos estáticos (JSON, grandes constantes) para imports dinâmicos dentro dos componentes que os utilizam, retirando-os do caminho crítico de carregamento.

## 2026-07-01 - Redução de bundle e otimização de reatividade no MeetPage

**Aprendizado:** Bibliotecas de utilitários de data como `date-fns` podem aumentar significativamente o tamanho de chunks específicos (de 10KB para 45KB neste caso) quando apenas operações básicas de aritmética de data são necessárias. Além disso, centralizar a reatividade de um timer em um único `ref` (`now`) e usar `computed properties` para as unidades de tempo é mais eficiente do que atualizar múltiplos `ref` dentro de um `setInterval`.

**Aplicação futura:** Em componentes de countdown ou timers, usar nativo `Date` e uma única fonte de verdade reativa para o tempo atual. Sempre auditar o tamanho dos chunks após adicionar ou remover bibliotecas de utilitários.
