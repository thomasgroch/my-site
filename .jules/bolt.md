## 2026-07-07 - Bundler transformation reduction by dependency removal

**Aprendizado:** Remover dependências que realizam cálculos simples, como `date-fns` para uma contagem regressiva, pode reduzir significativamente o número de módulos transformados pelo Vite (de 790 para 486 neste caso) e o tamanho do chunk da rota (de ~45kB para ~11kB).

**Aplicação futura:** Antes de utilizar bibliotecas de manipulação de data ou utilitários matemáticos, avaliar se a API nativa do JavaScript (`Date`, `Intl`, `Math`) atende aos requisitos. No Vue 3, o uso de `computed` properties em conjunto com um único `ref` reativo atualizado por `setInterval` é uma alternativa performática e leve para timers e contadores.

## 2026-07-07 - Hardening de links externos em massa

**Aprendizado:** A vulnerabilidade de reverse tabnabbing via `target="_blank"` é recorrente em portfolios com muitos links para redes sociais e projetos. O uso de scripts de verificação baseados em regex é mais confiável do que buscas manuais para garantir que o atributo `rel="noopener noreferrer"` esteja presente em todos os links, inclusive em comentários ou blocos de código desativados que podem ser reativados no futuro.

**Aplicação futura:** Implementar ou executar scripts de auditoria de segurança simples antes de submeter alterações em templates que contenham muitos links externos.
