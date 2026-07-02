## 2026-07-02 - Hardening External Links

**Vulnerabilidade:** Tabnabbing através de `target="_blank"` sem `rel="noopener noreferrer"`.

**Aprendizado:** Links que abrem em novas abas sem os atributos de segurança adequados permitem que a página de destino acesse o objeto `window.opener`, possibilitando ataques de redirecionamento malicioso da página original.

**Prevenção:** Automatizar ou garantir via linting que todos os links com `target="_blank"` incluam `rel="noopener noreferrer"`.
