// Texto: interpolação e plural. Sem dependências, usado no site, na função de
// contato e na demo.

// fill('Olá {nome}', { nome }) → 'Olá Thomas'. Chave ausente fica como está.
export const fill = (text, params = {}) =>
  String(text).replace(/\{(\w+)\}/g, (_, key) => (key in params ? params[key] : `{${key}}`))

// plural(2, 'tile') → '2 tiles'. Só o plural regular do inglês.
export const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`
