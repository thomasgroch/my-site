## 2026-06-16 - Tree-shaking FontAwesome icons

**Aprendizado:** O uso de imports globais para bibliotecas de ícones como FontAwesome (`fas`, `fab`, `far`) impede o tree-shaking, resultando em bundles extremamente grandes (2MB+ no caso deste projeto). Importar ícones individualmente permite que o bundler remova milhares de ícones não utilizados.

**Aplicação futura:** Sempre verificar `main.js` ou arquivos de configuração de ícones em projetos Vue/React. Substituir imports de "sets" inteiros por ícones específicos. No Vite, o ganho de performance no carregamento inicial (LCP) é drástico e mensurável através do comando `npm run build`.

## 2025-05-13 - Otimização de bundle via Lazy Loading e Pruning

**Aprendizado:** A combinação de remoção de dependências pesadas e não utilizadas (`moment`, `faunadb`, `vee-validate`) com o carregamento preguiçoso (lazy loading) de rotas e assets pesados (`brasil.json` de 134KB) resultou em uma redução de ~38% do bundle principal (de 443KB para 275KB).

**Aplicação futura:**
1. Auditar `package.json` para remover bibliotecas obsoletas ou não utilizadas.
2. Implementar `import()` dinâmico para rotas em `vue-router`.
3. Mover grandes arquivos estáticos (JSON, grandes constantes) para imports dinâmicos dentro dos componentes que os utilizam, retirando-os do caminho crítico de carregamento.

## 2026-06-26 - Substituição de bibliotecas de data por Date nativo

**Aprendizado:** Bibliotecas como `date-fns` podem adicionar overhead significativo (~34kB gzipped no caso deste projeto) para operações simples de parse e aritmética de datas. O uso de `new Date()` nativo com lógica customizada de cálculo de intervalos (`diff / (1000 * 60 * ...)`) elimina a dependência e reduz drasticamente o tamanho do chunk do componente.

**Aplicação futura:** Em componentes de "cold path" ou utilitários simples (como um countdown), priorizar o objeto `Date` nativo do JavaScript. No Vue, usar um `ref` reativo para o tempo atual (`currentTime`) garante que propriedades computadas baseadas em tempo sejam atualizadas corretamente a cada tick do `setInterval`.
