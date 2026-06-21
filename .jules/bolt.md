## 2026-06-16 - Tree-shaking FontAwesome icons

**Aprendizado:** O uso de imports globais para bibliotecas de ícones como FontAwesome (`fas`, `fab`, `far`) impede o tree-shaking, resultando em bundles extremamente grandes (2MB+ no caso deste projeto). Importar ícones individualmente permite que o bundler remova milhares de ícones não utilizados.

**Aplicação futura:** Sempre verificar `main.js` ou arquivos de configuração de ícones em projetos Vue/React. Substituir imports de "sets" inteiros por ícones específicos. No Vite, o ganho de performance no carregamento inicial (LCP) é drástico e mensurável através do comando `npm run build`.

## 2025-05-13 - Otimização de bundle via Lazy Loading e Pruning

**Aprendizado:** A combinação de remoção de dependências pesadas e não utilizadas (`moment`, `faunadb`, `vee-validate`) com o carregamento preguiçoso (lazy loading) de rotas e assets pesados (`brasil.json` de 134KB) resultou em uma redução de ~38% do bundle principal (de 443KB para 275KB).

**Aplicação futura:**
1. Auditar `package.json` para remover bibliotecas obsoletas ou não utilizadas.
2. Implementar `import()` dinâmico para rotas em `vue-router`.
3. Mover grandes arquivos estáticos (JSON, grandes constantes) para imports dinâmicos dentro dos componentes que os utilizam, retirando-os do caminho crítico de carregamento.

## 2026-06-21 - Dependency Pruning: Eliminating `date-fns`

**Aprendizado:** A biblioteca `date-fns`, apesar de modular, pode aumentar significativamente o número de módulos transformados durante o build se não for utilizada com cautela. Substituir cálculos de data simples por aritmética nativa de JavaScript `Date` e propriedades reativas (`computed`) eliminou a dependência totalmente de um dos caminhos críticos.

**Aplicação futura:** Antes de adicionar bibliotecas de data para tarefas simples como contagens regressivas ou formatação básica, avaliar se a API nativa `Date` ou `Intl.DateTimeFormat` é suficiente. Ganhos mensuráveis:
- Redução de módulos transformados: de 790 para 486 (~38%).
- Redução de chunk size (`MeetPage`): de 44.97 kB para 10.88 kB (~75%).
