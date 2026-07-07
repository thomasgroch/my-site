## 2026-07-07 - Mitigação de Reverse Tabnabbing

**Vulnerabilidade:** Uso de `target="_blank"` sem o atributo `rel="noopener noreferrer"`.

**Aprendizado:** Páginas abertas via `target="_blank"` podem acessar o objeto `window.opener` da página original, permitindo redirecionar o usuário para sites maliciosos (phishing) ou manipular o contexto da sessão original.

**Prevenção:** Sempre incluir `rel="noopener noreferrer"` em links externos que utilizam `target="_blank"`. No Vue.js, deve-se auditar componentes de lista (como `ProjectCard` ou `CardProfile`) onde links são gerados dinamicamente a partir de dados JSON.
