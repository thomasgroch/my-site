## 2026-06-29 - Bundle Optimization and Dependency Pruning

**Aprendizado:** A remoção da biblioteca `date-fns` em favor de aritmética nativa de `Date` no componente `MeetPage.vue` reduziu drasticamente o tamanho do chunk de 44.97kB para 10.89kB (~76% de redução). Além disso, o número de módulos transformados pelo Vite caiu de 790 para 486 (~39% de redução), o que acelera significativamente o tempo de build e melhora a eficiência do carregamento. A limpeza de dependências obsoletas (template engines) reduz a superfície de ataque e o tempo de instalação.

**Aplicação futura:**
1. Sempre avaliar se funções simples de bibliotecas de data como `date-fns` ou `moment` podem ser substituídas por lógica nativa.
2. Manter o `package.json` limpo de experimentos ou dependências de versões anteriores do projeto (ex: múltiplos engines de template).
3. Monitorar o número de "modules transformed" durante o build como um indicador de saúde das dependências.
