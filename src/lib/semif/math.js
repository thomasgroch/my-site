// Contas das probabilidades da demo.
export function softmax(values) {
  const top = Math.max(...values)
  const exps = values.map((value) => Math.exp(value - top))
  const total = exps.reduce((sum, value) => sum + value, 0)
  return exps.map((value) => value / total)
}

// Índice do maior valor.
export const argmax = (values) => values.indexOf(Math.max(...values))
