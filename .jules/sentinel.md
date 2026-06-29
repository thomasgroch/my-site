## 2026-06-29 - CORS Restriction in Serverless Functions

**Vulnerabilidade:** Uso de `Access-Control-Allow-Origin: '*'` em funções serverless expõe a API a chamadas de qualquer origem, facilitando ataques de CSRF ou uso indevido de recursos.

**Aprendizado:** Restringir o cabeçalho CORS para origens específicas (usando variáveis de ambiente como `process.env.URL` ou domínios de produção conhecidos) aumenta a segurança sem quebrar a funcionalidade legítima do frontend.

**Prevenção:** Nunca usar `*` em produção para `Access-Control-Allow-Origin`. Implementar uma política de whitelist baseada no ambiente.
