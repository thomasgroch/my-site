
## 2026-06-22 - Restrição de CORS em funções Netlify

**Vulnerabilidade:** Uso de `Access-Control-Allow-Origin: *` permitia que qualquer domínio fizesse requisições às funções de backend (`index.js` e `contact.cjs`), aumentando o risco de abuso e CSRF.

**Aprendizado:** Mesmo em portfólios simples, expor funções de envio de e-mail ou processamento de dados com políticas de CORS abertas é uma má prática.

**Prevenção:** Sempre restringir o cabeçalho `Access-Control-Allow-Origin` ao domínio de produção da aplicação.
