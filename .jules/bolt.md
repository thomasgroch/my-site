## 2026-06-16 - Tree-shaking FontAwesome icons

**Aprendizado:** O uso de imports globais para bibliotecas de ícones como FontAwesome (`fas`, `fab`, `far`) impede o tree-shaking, resultando em bundles extremamente grandes (2MB+ no caso deste projeto). Importar ícones individualmente permite que o bundler remova milhares de ícones não utilizados.

**Aplicação futura:** Sempre verificar `main.js` ou arquivos de configuração de ícones em projetos Vue/React. Substituir imports de "sets" inteiros por ícones específicos. No Vite, o ganho de performance no carregamento inicial (LCP) é drástico e mensurável através do comando `npm run build`.

## 2025-05-13 - Otimização de bundle via Lazy Loading e Pruning

**Aprendizado:** A combinação de remoção de dependências pesadas e não utilizadas (`moment`, `faunadb`, `vee-validate`) com o carregamento preguiçoso (lazy loading) de rotas e assets pesados (`brasil.json` de 134KB) resultou em uma redução de ~38% do bundle principal (de 443KB para 275KB).

**Aplicação futura:**
1. Auditar `package.json` para remover bibliotecas obsoletas ou não utilizadas.
2. Implementar `import()` dinâmico para rotas em `vue-router`.
3. Mover grandes arquivos estáticos (JSON, grandes constantes) para imports dinâmicos dentro dos componentes que os utilizam, retirando-os do caminho crítico de carregamento.

## 2025-06-21 - Substituição de bibliotecas de data por Date nativo

**Aprendizado:** Bibliotecas como `date-fns` ou `moment` podem adicionar overhead significativo ao bundle quando usadas para operações simples como contagem regressiva. A substituição por aritmética de `Date` nativo em componentes específicos pode reduzir o tamanho do chunk em mais de 75%.

**Aplicação futura:** Avaliar se o uso de bibliotecas de manipulação de data é realmente necessário para operações simples de exibição ou cálculos básicos. Priorizar `Intl.DateTimeFormat` e aritmética de milissegundos nativa para reduzir o footprint da aplicação.
