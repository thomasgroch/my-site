## 2026-06-25 - CORS restriction in Netlify functions

**Vulnerabilidade:** Configuração excessivamente permissiva de CORS (`Access-Control-Allow-Origin: '*'`) em funções serverless.

**Aprendizado:** Manter o CORS como `*` em produção permite que qualquer domínio faça requisições para as funções, o que pode facilitar ataques de CSRF ou uso indevido da infraestrutura. Restringir para o domínio específico da aplicação aumenta a postura de segurança.

**Prevenção:** Sempre revisar os headers de resposta em funções serverless e APIs, garantindo que o `Access-Control-Allow-Origin` corresponda apenas aos domínios autorizados.
