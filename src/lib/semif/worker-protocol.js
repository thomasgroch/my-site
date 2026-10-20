// Lado do worker do protocolo de engine.js: cada mensagem { id, type, payload }
// chama handlers[type](payload, notify) e responde { id, type: 'done' | 'error' };
// `notify` manda atualizações parciais com o mesmo id.
export function serve(handlers) {
  self.addEventListener('message', async ({ data: { id, type, payload } }) => {
    const notify = (data) => self.postMessage({ id, type: 'update', data })
    try {
      self.postMessage({ id, type: 'done', data: await handlers[type](payload, notify) })
    } catch (error) {
      console.error(error)
      self.postMessage({ id, type: 'error', message: error?.message ?? String(error) })
    }
  })
}
