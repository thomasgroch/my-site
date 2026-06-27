## 2025-05-14 - CORS Hardening in Netlify Functions

**Vulnerabilidade:** Uso de `Access-Control-Allow-Origin: '*'` em funções serverless, permitindo que qualquer site faça requisições ao backend da aplicação.

**Aprendizado:** Funções Netlify/Lambda frequentemente vêm com templates permissivos. É fundamental restringir o CORS para o domínio da aplicação usando variáveis de ambiente como `process.env.URL` que o Netlify injeta automaticamente.

**Prevenção:** Sempre auditar os cabeçalhos de resposta em novas funções backend e utilizar uma whitelist de origens ou a URL base da aplicação.
