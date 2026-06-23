## 2026-06-23 - Restrição de CORS em funções serverless

**Vulnerabilidade:** Uso de wildcard (`*`) no cabeçalho `Access-Control-Allow-Origin`, permitindo que qualquer domínio fizesse requisições às funções da API.

**Aprendizado:** Cabeçalhos permissivos em funções serverless aumentam a superfície de ataque para CSRF e exfiltração de dados por sites maliciosos.

**Prevenção:** Sempre restringir o `Access-Control-Allow-Origin` ao domínio oficial de produção da aplicação.
