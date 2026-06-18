## 2026-06-18 - Restricting CORS origin

**Vulnerabilidade:** Uso de `Access-Control-Allow-Origin: *` em funções serverless (Netlify Functions).

**Aprendizado:** Permitir qualquer origem em funções que processam dados (como envio de e-mail) aumenta a superfície de ataque para CSRF e uso não autorizado da infraestrutura por terceiros.

**Prevenção:** Sempre restringir o CORS para o domínio específico da aplicação em produção.
