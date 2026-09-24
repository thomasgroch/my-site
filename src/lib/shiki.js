import {
  transformerMetaHighlight,
  transformerNotationDiff,
  transformerNotationHighlight,
} from '@shikijs/transformers'

// Cabeçalho dos blocos de código: nome do arquivo (```ts title="blog.js") ou a
// linguagem, mais o botão de copiar. O clique é tratado em BlogPost.astro.
function transformerCodeHeader() {
  return {
    name: 'code-header',
    root(root) {
      const pre = root.children.find((node) => node.tagName === 'pre')
      if (!pre) return
      const { lang } = this.options
      const title = this.options.meta?.__raw?.match(/title="([^"]+)"/)?.[1]
      const label = title ?? (lang && lang !== 'plaintext' && lang !== 'text' ? lang : '')
      const el = (tagName, properties, children = []) => ({ type: 'element', tagName, properties, children })
      root.children = [
        el('div', { className: ['code-block'] }, [
          el('div', { className: ['code-header'] }, [
            el('span', { className: title ? ['code-title'] : ['code-lang'] }, [{ type: 'text', value: label }]),
            el('button', { type: 'button', className: ['code-copy'], 'aria-label': 'Copy code' }, [{ type: 'text', value: 'Copy' }]),
          ]),
          pre,
        ]),
      ]
    },
  }
}

export const shikiTransformers = [
  transformerMetaHighlight(), // ```js {2,4-5}
  transformerNotationHighlight(), // // [!code highlight]
  transformerNotationDiff(), // // [!code ++] e // [!code --]
  transformerCodeHeader(),
]
