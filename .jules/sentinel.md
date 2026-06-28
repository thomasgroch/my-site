## 2025-06-28 - Restrição de CORS em Netlify Functions

**Vulnerabilidade:** O uso de \`Access-Control-Allow-Origin: '*'\` permitia que qualquer site fizesse requisições para as funções da API, aumentando o risco de abuso e ataques CSRF em cenários específicos.

**Aprendizado:** Netlify e outros ambientes de deploy modernos costumam injetar a URL do site em variáveis de ambiente (como \`URL\` no Netlify).

**Prevenção:** Sempre utilizar \`process.env.URL\` ou uma whitelist explícita de domínios em vez de curingas (\`*\`) nos cabeçalhos de CORS, especialmente em funções que processam dados de formulários ou interagem com serviços externos (como envio de e-mail).
