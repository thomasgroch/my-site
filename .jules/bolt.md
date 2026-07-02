## 2026-07-02 - Bundle Optimization and Security Hardening

**Aprendizado:** A substituição de bibliotecas de utilitários de data (como `date-fns`) por aritmética nativa de `Date` e propriedades computadas reativas em Vue 3 pode reduzir drasticamente o tamanho de chunks específicos (de ~45kB para ~11kB neste caso). Além disso, o uso de `import()` dinâmico para arquivos JSON estáticos retira dados do caminho crítico de carregamento, reduzindo o bundle principal.

**Aplicação futura:**
1. Sempre avaliar se funções de data complexas são realmente necessárias antes de importar bibliotecas pesadas.
2. Usar `loading="lazy"` em listas extensas de imagens para melhorar o LCP.
3. Mover dados de configuração/resume de arquivos JSON para imports dinâmicos em componentes Vue.
