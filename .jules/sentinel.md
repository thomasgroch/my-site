## 2026-06-16 - Restrição de CORS Origin

**Vulnerabilidade:** Uso de `Access-Control-Allow-Origin: *` em funções serverless expostas publicamente.

**Aprendizado:** Permitir qualquer origem em funções que processam dados sensíveis ou enviam e-mails (como o formulário de contato) aumenta o risco de ataques Cross-Origin e abuso da infraestrutura.

**Prevenção:** Sempre restringir o CORS para domínios específicos e autorizados (`https://thomasgroch.xyz`) em vez de usar o curinga `*`.
