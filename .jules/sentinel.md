## 2026-07-06 - Hardening de links externos e CORS

**Vulnerabilidade:** Tabnabbing (via links target="_blank" sem rel="noopener noreferrer") e CORS excessivamente permissivo (wildcard '*').

**Aprendizado:** O uso de `target="_blank"` sem `rel="noopener noreferrer"` permite que a página de destino tenha acesso parcial à janela de origem via `window.opener`, possibilitando ataques de phishing. Além disso, o uso de `Access-Control-Allow-Origin: *` em funções serverless expõe a API a chamadas de qualquer origem.

**Prevenção:**
1. Sempre adicionar `rel="noopener noreferrer"` em links externos.
2. Restringir CORS ao domínio de produção ou via variável de ambiente (ex: `process.env.URL`).
