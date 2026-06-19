## 2025-06-21 - Restrição de CORS em funções serverless

**Vulnerabilidade:** Uso de `Access-Control-Allow-Origin: '*'` em funções de backend (Netlify Functions). Isso permitia que qualquer domínio fizesse requisições às funções de contato e API, aumentando o risco de abuso e ataques de cross-origin.

**Aprendizado:** Configurar cabeçalhos CORS permissivos (`*`) é uma prática comum em desenvolvimento, mas perigosa em produção. Restringir ao domínio específico da aplicação (`https://thomasgroch.xyz`) é um passo fundamental para o hardening da segurança.

**Prevenção:** Sempre revisar cabeçalhos de resposta em funções serverless e APIs. Garantir que o `Access-Control-Allow-Origin` esteja configurado para o domínio esperado em ambientes de produção.
