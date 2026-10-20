// localStorage que não explode: em aba privada, preview ou sem permissão ele
// lança, e aí a página segue sem lembrar nada.
export function recall(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function remember(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // sem localStorage
  }
}
