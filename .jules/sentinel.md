## 2025-05-14 - Restrição de CORS em Serverless Functions

**Vulnerabilidade:** CORS excessivamente permissivo (`Access-Control-Allow-Origin: *`).

**Aprendizado:** Permitir qualquer origem em funções de backend que lidam com dados sensíveis ou envio de e-mails pode expor a aplicação a ataques de CSRF e uso não autorizado dos recursos.

**Prevenção:** Sempre restringir o cabeçalho `Access-Control-Allow-Origin` para a URL específica da aplicação, utilizando variáveis de ambiente (como `URL` no Netlify) com um fallback seguro.
