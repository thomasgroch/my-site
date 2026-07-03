## 2024-05-20 - Tabnabbing mitigation

**Vulnerabilidade:** Tabnabbing (Reverse Tabnabbing) via `target="_blank"` sem `rel="noopener noreferrer"`.

**Aprendizado:** Links externos que abrem em nova aba podem permitir que a página de destino controle a página de origem via `window.opener`.

**Prevenção:** Sempre incluir `rel="noopener noreferrer"` em todos os links com `target="_blank"`.
