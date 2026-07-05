## 2026-07-05 - Mitigação de Reverse Tabnabbing e Endurecimento de CORS

**Vulnerabilidade:** Uso de `target="_blank"` sem `rel="noopener noreferrer"`, permitindo ataques de reverse tabnabbing onde a página de destino pode controlar a página de origem via `window.opener`. Além disso, políticas de CORS permissivas (`*`) em funções de backend.

**Aprendizado:** A segurança do frontend deve incluir a proteção de links externos. A adição global de `rel="noopener noreferrer"` é uma prática essencial de higiene de segurança. No backend (Netlify Functions), restringir `Access-Control-Allow-Origin` a domínios conhecidos ou variáveis de ambiente de produção reduz a superfície de ataque para CSRF e vazamento de dados.

**Prevenção:** Automatizar a verificação de `rel="noopener noreferrer"` em pipelines de CI/CD e nunca deixar `Access-Control-Allow-Origin: *` em código que lida com dados de usuários ou comunicações.
