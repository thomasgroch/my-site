## 2026-06-16 - Tree-shaking FontAwesome icons

**Aprendizado:** O uso de imports globais para bibliotecas de ícones como FontAwesome (`fas`, `fab`, `far`) impede o tree-shaking, resultando em bundles extremamente grandes (2MB+ no caso deste projeto). Importar ícones individualmente permite que o bundler remova milhares de ícones não utilizados.

**Aplicação futura:** Sempre verificar `main.js` ou arquivos de configuração de ícones em projetos Vue/React. Substituir imports de "sets" inteiros por ícones específicos. No Vite, o ganho de performance no carregamento inicial (LCP) é drástico e mensurável através do comando `npm run build`.

## 2025-05-13 - Otimização de bundle via Lazy Loading e Pruning

**Aprendizado:** A combinação de remoção de dependências pesadas e não utilizadas (`moment`, `faunadb`, `vee-validate`) com o carregamento preguiçoso (lazy loading) de rotas e assets pesados (`brasil.json` de 134KB) resultou em uma redução de ~38% do bundle principal (de 443KB para 275KB).

**Aplicação futura:**
1. Auditar `package.json` para remover bibliotecas obsoletas ou não utilizadas.
2. Implementar `import()` dinâmico para rotas em `vue-router`.
3. Mover grandes arquivos estáticos (JSON, grandes constantes) para imports dinâmicos dentro dos componentes que os utilizam, retirando-os do caminho crítico de carregamento.

## 2026-06-16 - Bundle optimization and Security hardening

**Aprendizado:**
1. Remover `date-fns` em favor de `Date` nativo reduziu drasticamente o número de transformações do Vite (de 790 para 486) e o tamanho do chunk da rota `MeetPage` (de ~45KB para ~11KB).
2. Converter assets estáticos como `resume.json` para imports dinâmicos (`import()`) retira esse peso do bundle principal, melhorando o tempo de carregamento inicial.
3. O uso de `rel="noopener noreferrer"` em links `target="_blank"` é uma medida de segurança essencial e de baixo custo para prevenir ataques de tabnabbing.

**Aplicação futura:**
- Auditar rotas que usam bibliotecas de data pesadas e avaliar se lógica nativa é suficiente.
- Isolar grandes arquivos JSON em chunks sob demanda.
- Padronizar segurança de links externos em todos os componentes.
