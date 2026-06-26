## 2026-06-16 - Tree-shaking FontAwesome icons

**Aprendizado:** O uso de imports globais para bibliotecas de ícones como FontAwesome (`fas`, `fab`, `far`) impede o tree-shaking, resultando em bundles extremamente grandes (2MB+ no caso deste projeto). Importar ícones individualmente permite que o bundler remova milhares de ícones não utilizados.

**Aplicação futura:** Sempre verificar `main.js` ou arquivos de configuração de ícones em projetos Vue/React. Substituir imports de "sets" inteiros por ícones específicos. No Vite, o ganho de performance no carregamento inicial (LCP) é drástico e mensurável através do comando `npm run build`.

## 2025-05-13 - Otimização de bundle via Lazy Loading e Pruning

**Aprendizado:** A combinação de remoção de dependências pesadas e não utilizadas (`moment`, `faunadb`, `vee-validate`) com o carregamento preguiçoso (lazy loading) de rotas e assets pesados (`brasil.json` de 134KB) resultou em uma redução de ~38% do bundle principal (de 443KB para 275KB).

**Aplicação futura:**
1. Auditar `package.json` para remover bibliotecas obsoletas ou não utilizadas.
2. Implementar `import()` dinâmico para rotas em `vue-router`.
3. Mover grandes arquivos estáticos (JSON, grandes constantes) para imports dinâmicos dentro dos componentes que os utilizam, retirando-os do caminho crítico de carregamento.

## 2026-06-26 - Substituição de date-fns e Pruning de Dependências Legadas

**Aprendizado:** Bibliotecas de datas como `date-fns` podem ser substituídas por lógica nativa `Date` em casos de uso simples (como contagens regressivas), reduzindo o tamanho do bundle e o número de módulos transformados no build. Além disso, a remoção de dependências legadas de "template engines" (atpl, dot, mustache, etc.) simplifica radicalmente o `vite.config.js` e melhora a velocidade de instalação e build.

**Aplicação futura:**
1. Sempre avaliar se uma biblioteca de utilitários (como `date-fns` ou `lodash`) é realmente necessária ou se APIs nativas do JS moderno resolvem o problema.
2. Monitorar o número de módulos transformados no Vite (`transforming...` no log de build); quedas drásticas indicam remoção bem-sucedida de árvores de dependências complexas.
3. Limpar regularmente o `package.json` de dependências de "boilerplate" ou templates que não estão sendo importadas em lugar nenhum do código fonte.
