## 2025-05-13 - Endurecimento de headers CORS e redução de superfície de ataque

**Vulnerabilidade:** Uso de curinga (`*`) em `Access-Control-Allow-Origin` e presença de dezenas de dependências vulneráveis e não utilizadas no `package.json`.

**Aprendizado:** Manter dependências não utilizadas (especialmente engines de template obsoletos) aumenta drasticamente a superfície de ataque e o tempo de instalação. Configurações de CORS permissivas expõem APIs a requisições de origens não autorizadas.

**Prevenção:** Restringir explicitamente as origens permitidas em funções serverless. Auditar periodicamente o `package.json` e remover qualquer pacote que não seja estritamente necessário para o funcionamento ou teste da aplicação.
