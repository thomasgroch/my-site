## 2026-06-16 - CORS hardening and Link protection

**Vulnerabilidade:** Exposição excessiva de CORS e risco de tabnabbing.

**Aprendizado:**
1. `Access-Control-Allow-Origin: *` em funções serverless é perigoso em produção. Usar variáveis de ambiente (`process.env.URL`) para restringir a origem é uma prática recomendada.
2. Links externos sem `rel="noopener noreferrer"` permitem que a página de destino acesse o objeto `window.opener` da página de origem.

**Prevenção:**
- Restringir CORS sempre que possível ao domínio da aplicação.
- Adicionar automaticamente proteções a links externos durante revisões de código.
