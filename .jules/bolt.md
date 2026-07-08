## 2026-06-16 - Tree-shaking FontAwesome icons

**Aprendizado:** O uso de imports globais para bibliotecas de ícones como FontAwesome (`fas`, `fab`, `far`) impede o tree-shaking, resultando em bundles extremamente grandes (2MB+ no caso deste projeto). Importar ícones individualmente permite que o bundler remova milhares de ícones não utilizados.

**Aplicação futura:** Sempre verificar `main.js` ou arquivos de configuração de ícones em projetos Vue/React. Substituir imports de "sets" inteiros por ícones específicos. No Vite, o ganho de performance no carregamento inicial (LCP) é drástico e mensurável através do comando `npm run build`.

## 2025-05-13 - Otimização de bundle via Lazy Loading e Pruning

**Aprendizado:** A combinação de remoção de dependências pesadas e não utilizadas (`moment`, `faunadb`, `vee-validate`) com o carregamento preguiçoso (lazy loading) de rotas e assets pesados (`brasil.json` de 134KB) resultou em uma redução de ~38% do bundle principal (de 443KB para 275KB).

**Aplicação futura:**
1. Auditar `package.json` para remover bibliotecas obsoletas ou não utilizadas.
2. Implementar `import()` dinâmico para rotas em `vue-router`.
3. Mover grandes arquivos estáticos (JSON, grandes constantes) para imports dinâmicos dentro dos componentes que os utilizam, retirando-os do caminho crítico de carregamento.

## 2025-07-08 - Otimização de bundle via Tree-shaking e Native APIs

**Aprendizado:** A remoção do uso da biblioteca `date-fns` em favor de operações nativas com `Date` no componente `MeetPage.vue` reduziu o tamanho do chunk de 44.97 kB para 10.86 kB (~75% de redução). Mesmo quando restrições de projeto impedem a alteração do `package.json`, o benefício de performance é alcançado no bundle final através do tree-shaking do Vite, desde que não restem imports para a biblioteca.

**Aplicação futura:** Identificar bibliotecas de utilitários pesadas usadas de forma pontual. Substituir por implementações nativas sempre que a complexidade for baixa. Validar a eficácia através da comparação de tamanhos de chunks no build de produção.
