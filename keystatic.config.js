// Painel de conteúdo (Keystatic), em http://localhost:3000/keystatic durante o
// `npm run dev`. Modo local: grava direto nos arquivos de src/content, e a
// publicação continua sendo um commit. Os esquemas do Astro
// (src/content.config.js) seguem sendo o contrato: o que o painel gravar de
// errado derruba o build.
//
// Fora do painel só fica o src/data/resume.json: o painel regravaria o
// arquivo inteiro com apenas os campos que conhece.
import { collection, config, fields, singleton } from '@keystatic/core'
import { block, mark, wrapper } from '@keystatic/core/content-components'
import { createElement } from 'react'
import { Icon } from '@keystar/ui/icon'
import { highlighterIcon } from '@keystar/ui/icon/icons/highlighterIcon'
import { keyboardIcon } from '@keystar/ui/icon/icons/keyboardIcon'
import { listCollapseIcon } from '@keystar/ui/icon/icons/listCollapseIcon'
import { quoteIcon } from '@keystar/ui/icon/icons/quoteIcon'
import { subscriptIcon } from '@keystar/ui/icon/icons/subscriptIcon'
import { superscriptIcon } from '@keystar/ui/icon/icons/superscriptIcon'
import { wholeWordIcon } from '@keystar/ui/icon/icons/wholeWordIcon'

// O editor MDX do Keystatic recusa tags HTML que não conhece ("Missing component
// definition"). Registrar um componente com o mesmo nome da tag resolve: o
// Astro renderiza nomes em minúsculas como HTML nativo, então o site não muda.
const icon = (src) => createElement(Icon, { src })
const htmlTags = {
  kbd: mark({ label: 'Keyboard key', tag: 'kbd', icon: icon(keyboardIcon), schema: {} }),
  mark: mark({ label: 'Highlight', tag: 'mark', icon: icon(highlighterIcon), schema: {} }),
  sub: mark({ label: 'Subscript', tag: 'sub', icon: icon(subscriptIcon), schema: {} }),
  sup: mark({ label: 'Superscript', tag: 'sup', icon: icon(superscriptIcon), schema: {} }),
  abbr: mark({
    label: 'Abbreviation',
    tag: 'abbr',
    icon: icon(wholeWordIcon),
    schema: { title: fields.text({ label: 'Full form', validation: { length: { min: 1 } } }) },
  }),
  cite: mark({ label: 'Citation', tag: 'span', icon: icon(quoteIcon), schema: {} }),
  figure: wrapper({ label: 'Figure', description: 'Image with a caption: add a line marked as Figure caption.', schema: {} }),
  // Legenda e título ficam numa linha só, então o MDX os lê como inline.
  figcaption: mark({ label: 'Figure caption', tag: 'small', icon: icon(quoteIcon), schema: {} }),
  details: wrapper({ label: 'Details', description: 'Collapsible content: start with a line marked as Details summary.', schema: {} }),
  summary: mark({ label: 'Details summary', tag: 'strong', icon: icon(listCollapseIcon), schema: {} }),
}

// Texto que o visitante lê: os dois idiomas são obrigatórios.
const translated = (label, { multiline = false } = {}) =>
  fields.object(
    {
      pt: fields.text({ label: 'Português', multiline, validation: { isRequired: true } }),
      en: fields.text({ label: 'English', multiline, validation: { isRequired: true } }),
    },
    { label }
  )

// Grava em src/assets/<pasta>/<entrada>/<campo>.<ext>, o mesmo padrão em
// todas as coleções.
const image = (label, folder, options = {}) =>
  fields.image({ label, directory: `src/assets/${folder}`, publicPath: `../../assets/${folder}/`, ...options })

export default config({
  storage: { kind: 'local' },
  ui: { brand: { name: 'thomasdev.xyz' } },
  collections: {
    blog: collection({
      label: 'Blog',
      path: 'src/content/blog/*',
      slugField: 'title',
      entryLayout: 'content',
      format: { contentField: 'content' },
      columns: ['pubDate', 'draft'],
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        description: fields.text({ label: 'Description', multiline: true, validation: { isRequired: true } }),
        pubDate: fields.date({ label: 'Published', defaultValue: { kind: 'today' }, validation: { isRequired: true } }),
        updatedDate: fields.date({ label: 'Updated' }),
        draft: fields.checkbox({ label: 'Draft', description: 'Drafts show up in dev and stay out of the production build.', defaultValue: true }),
        tags: fields.array(fields.text({ label: 'Tag' }), { label: 'Tags', itemLabel: (props) => props.value }),
        cover: image('Cover', 'blog'),
        coverAlt: fields.text({ label: 'Cover alt text' }),
        content: fields.mdx({
          label: 'Content',
          extension: 'mdx',
          options: { image: { directory: 'src/assets/blog', publicPath: '../../assets/blog/' } },
          components: {
            ...htmlTags,
            // Mesmos componentes que o layout do blog entrega ao MDX
            // (src/components/blog, registrados em src/pages/blog/[slug].astro).
            Callout: wrapper({
              label: 'Callout',
              schema: {
                type: fields.select({
                  label: 'Type',
                  options: [
                    { label: 'Note', value: 'note' },
                    { label: 'Tip', value: 'tip' },
                    { label: 'Warning', value: 'warning' },
                    { label: 'Danger', value: 'danger' },
                  ],
                  defaultValue: 'note',
                }),
              },
            }),
            Wide: wrapper({
              label: 'Wide',
              description: 'Content wider than the text column, like a large screenshot.',
              schema: {},
            }),
            Embed: block({
              label: 'Embed',
              description: 'Interactive demo in an iframe (CodePen, canvas, a page of your own).',
              schema: {
                src: fields.url({ label: 'URL', validation: { isRequired: true } }),
                title: fields.text({ label: 'Title', description: 'What the demo shows, for screen readers.', validation: { length: { min: 1 } } }),
                caption: fields.text({ label: 'Caption' }),
                ratio: fields.select({
                  label: 'Aspect ratio',
                  options: [
                    { label: '16:9', value: '16 / 9' },
                    { label: '4:3', value: '4 / 3' },
                    { label: '1:1', value: '1 / 1' },
                  ],
                  defaultValue: '16 / 9',
                }),
                height: fields.text({ label: 'Fixed height', description: 'CSS value such as 480px. Overrides the aspect ratio.' }),
                wide: fields.checkbox({ label: 'Wide', description: 'Wider than the text column.' }),
              },
            }),
          },
        }),
      },
    }),

    projects: collection({
      label: 'Projetos',
      path: 'src/content/projects/*',
      slugField: 'company',
      format: { data: 'yaml' },
      columns: ['startDate'],
      schema: {
        company: fields.slug({ name: { label: 'Empresa', validation: { isRequired: true } } }),
        position: translated('Cargo'),
        // O valor é o índice das chaves general.project.type_N.
        type: fields.select({
          label: 'Tipo',
          options: [
            { label: 'Acadêmico', value: '0' },
            { label: 'Profissional', value: '1' },
            { label: 'Freelancer', value: '2' },
            { label: 'Pessoal', value: '3' },
          ],
          defaultValue: '1',
        }),
        startDate: fields.text({ label: 'Ano de início', validation: { isRequired: true, pattern: { regex: /^\d{4}$/, message: 'Use só o ano, com quatro dígitos' } } }),
        website: fields.url({ label: 'Site' }),
        image: image('Imagem', 'projects'),
        summary: translated('Resumo', { multiline: true }),
        order: fields.integer({ label: 'Ordem', description: 'Desempate entre projetos do mesmo ano: menor aparece antes.', defaultValue: 0 }),
      },
    }),

    stack: collection({
      label: 'Stack',
      path: 'src/content/stack/*',
      slugField: 'name',
      format: { data: 'yaml' },
      columns: ['group'],
      schema: {
        name: fields.slug({ name: { label: 'Nome', validation: { isRequired: true } } }),
        group: fields.select({
          label: 'Grupo',
          options: ['back', 'front', 'database', 'infra', 'misc', 'history'].map((value) => ({ label: value, value })),
          defaultValue: 'misc',
        }),
        href: fields.url({ label: 'Link', validation: { isRequired: true } }),
        logo: image('Logo', 'stack', { validation: { isRequired: true } }),
        order: fields.integer({ label: 'Ordem', defaultValue: 0 }),
      },
    }),
  },

  singletons: {
    meta: singleton({
      label: 'Colofão (/meta)',
      path: 'src/content/meta',
      format: { data: 'yaml' },
      schema: {
        groups: fields.array(
          fields.object({
            title: translated('Título'),
            intro: translated('Introdução', { multiline: true }),
            items: fields.array(
              fields.object({
                name: translated('Nome'),
                pkg: fields.text({ label: 'Pacote npm', description: 'A versão é lida do package-lock.json no build.' }),
                version: fields.text({ label: 'Versão fixa', description: 'Só para o que não é pacote npm.' }),
                url: fields.url({ label: 'Link', validation: { isRequired: true } }),
                note: translated('Nota', { multiline: true }),
              }),
              { label: 'Itens', itemLabel: (props) => props.fields.name.fields.pt.value }
            ),
          }),
          { label: 'Grupos', description: 'Aparecem nesta ordem.', itemLabel: (props) => props.fields.title.fields.pt.value }
        ),
      },
    }),
  },
})
