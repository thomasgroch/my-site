## 2026-06-16 - Tree-shaking FontAwesome icons

**Aprendizado:** O uso de imports globais para bibliotecas de ícones como FontAwesome (`fas`, `fab`, `far`) impede o tree-shaking, resultando em bundles extremamente grandes (2MB+ no caso deste projeto). Importar ícones individualmente permite que o bundler remova milhares de ícones não utilizados.

**Aplicação futura:** Sempre verificar `main.js` ou arquivos de configuração de ícones em projetos Vue/React. Substituir imports de "sets" inteiros por ícones específicos. No Vite, o ganho de performance no carregamento inicial (LCP) é drástico e mensurável através do comando `npm run build`.

## 2025-05-13 - Otimização de bundle via Lazy Loading e Pruning

**Aprendizado:** A combinação de remoção de dependências pesadas e não utilizadas (`moment`, `faunadb`, `vee-validate`) com o carregamento preguiçoso (lazy loading) de rotas e assets pesados (`brasil.json` de 134KB) resultou em uma redução de ~38% do bundle principal (de 443KB para 275KB).

**Aplicação futura:**
1. Auditar `package.json` para remover bibliotecas obsoletas ou não utilizadas.
2. Implementar `import()` dinâmico para rotas em `vue-router`.
3. Mover grandes arquivos estáticos (JSON, grandes constantes) para imports dinâmicos dentro dos componentes que os utilizam, retirando-os do caminho crítico de carregamento.

## 2025-05-14 - Redução de dependências e substituição de bibliotecas de data

**Aprendizado:**
1. Bibliotecas como `date-fns` podem adicionar overhead desnecessário (40KB+) quando usadas apenas para cálculos simples de data e contagem regressiva. O objeto nativo `Date` do JavaScript é suficiente para a maioria desses casos.
2. Projetos baseados em templates legados frequentemente acumulam dezenas de `devDependencies` (motores de template como `ejs`, `pug`, `mustache`) que nunca são usados no código fonte, mas aumentam o tempo de `npm install` e a superfície de ataque.

**Aplicação futura:**
1. Auditar o bundle chunk a chunk para identificar bibliotecas pesadas em rotas específicas.
2. Limpar agressivamente o `package.json` de qualquer dependência que não possua um `import` ou `require` correspondente no código.
3. Priorizar APIs nativas do navegador (como `Date`, `fetch`, `Intl`) sobre bibliotecas utilitárias externas.
