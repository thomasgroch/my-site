## 2026-06-16 - Tree-shaking FontAwesome icons

**Aprendizado:** O uso de imports globais para bibliotecas de ícones como FontAwesome (`fas`, `fab`, `far`) impede o tree-shaking, resultando em bundles extremamente grandes (2MB+ no caso deste projeto). Importar ícones individualmente permite que o bundler remova milhares de ícones não utilizados.

**Aplicação futura:** Sempre verificar `main.js` ou arquivos de configuração de ícones em projetos Vue/React. Substituir imports de "sets" inteiros por ícones específicos. No Vite, o ganho de performance no carregamento inicial (LCP) é drástico e mensurável através do comando `npm run build`.

## 2025-05-13 - Otimização de bundle via Lazy Loading e Pruning

**Aprendizado:** A combinação de remoção de dependências pesadas e não utilizadas (`moment`, `faunadb`, `vee-validate`) com o carregamento preguiçoso (lazy loading) de rotas e assets pesados (`brasil.json` de 134KB) resultou em uma redução de ~38% do bundle principal (de 443KB para 275KB).

**Aplicação futura:**
1. Auditar `package.json` para remover bibliotecas obsoletas ou não utilizadas.
2. Implementar `import()` dinâmico para rotas em `vue-router`.
3. Mover grandes arquivos estáticos (JSON, grandes constantes) para imports dinâmicos dentro dos componentes que os utilizam, retirando-os do caminho crítico de carregamento.

## 2026-06-17 - Substituição de bibliotecas de data por Date nativo

**Aprendizado:** O uso de bibliotecas como `date-fns` em componentes específicos pode adicionar peso desnecessário ao bundle (neste caso, ~34kB gzipped no chunk da página). Para operações simples como contagens regressivas e diferenças de tempo, a API nativa de `Date` do JavaScript é suficiente e elimina a necessidade de carregar dependências externas.

**Ação:** Antes de importar bibliotecas de manipulação de data, avaliar se a lógica pode ser resolvida com aritmética simples de milissegundos usando `new Date()`. Priorizar o uso de `Date` nativo para reduzir o tamanho dos chunks carregados sob demanda.
