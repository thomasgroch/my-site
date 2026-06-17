## 2025-10-24 - Restrição de CORS em funções serverless

**Vulnerabilidade:** Uso de `Access-Control-Allow-Origin: '*'` em funções serverless (Netlify Functions).

**Aprendizado:** Permitir qualquer origem (`*`) em funções que lidam com dados (como formulários de contato ou APIs internas) expõe o endpoint a ataques de CSRF (se houver cookies/sessão) e uso não autorizado por terceiros.

**Prevenção:** Sempre restringir o cabeçalho `Access-Control-Allow-Origin` ao domínio de produção específico da aplicação (ex: `https://thomasgroch.xyz`). Isso garante que somente o frontend legítimo possa interagir com os serviços de backend.
