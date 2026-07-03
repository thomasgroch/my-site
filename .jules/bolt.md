## 2026-06-16 - Tree-shaking FontAwesome icons

**Aprendizado:** O uso de imports globais para bibliotecas de ícones como FontAwesome (`fas`, `fab`, `far`) impede o tree-shaking, resultando em bundles extremamente grandes (2MB+ no caso deste projeto). Importar ícones individualmente permite que o bundler remova milhares de ícones não utilizados.

**Aplicação futura:** Sempre verificar `main.js` ou arquivos de configuração de ícones em projetos Vue/React. Substituir imports de "sets" inteiros por ícones específicos. No Vite, o ganho de performance no carregamento inicial (LCP) é drástico e mensurável através do comando `npm run build`.

## 2025-05-13 - Otimização de bundle via Lazy Loading e Pruning

**Aprendizado:** A combinação de remoção de dependências pesadas e não utilizadas (`moment`, `faunadb`, `vee-validate`) com o carregamento preguiçoso (lazy loading) de rotas e assets pesados (`brasil.json` de 134KB) resultou em uma redução de ~38% do bundle principal (de 443KB para 275KB).

**Aplicação futura:**
1. Auditar `package.json` para remover bibliotecas obsoletas ou não utilizadas.
2. Implementar `import()` dinâmico para rotas em `vue-router`.
3. Mover grandes arquivos estáticos (JSON, grandes constantes) para imports dinâmicos dentro dos componentes que os utilizam, retirando-os do caminho crítico de carregamento.

## 2024-05-20 - Substituted date-fns for native Date logic

**Aprendizado:** Bibliotecas de manipulação de data como `date-fns` podem adicionar peso desnecessário quando apenas operações básicas de aritmética de data são necessárias. Substituir por `new Date()` e cálculos nativos reduziu o chunk da rota em ~75%.

**Aplicação futura:** Antes de adicionar ou manter bibliotecas de utilitários de data, avaliar se os requisitos (ex: countdowns, formatação simples) podem ser resolvidos nativamente para economizar bundle size.

## 2024-05-20 - Dynamic import de assets JSON

**Aprendizado:** Importar arquivos JSON estaticamente os inclui no bundle principal. Usar `import()` dinâmico permite o code-splitting desses dados, reduzindo o LCP.

**Aplicação futura:** Mover dados de configuração ou conteúdo (como `resume.json`) para imports dinâmicos em `onMounted` para otimizar o caminho crítico.
