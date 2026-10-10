import { describe, it, expect } from 'vitest'
import { gate } from '../netlify/edge-functions/drafts.js'

const url = (path) => new URL(`https://thomasdev.xyz${path}`)
const draft = '<html><head><meta name="robots" content="noindex"></head></html>'
const published = '<html><head><title>Post</title></head></html>'

describe('rascunhos pela rota', () => {
  it('post publicado passa, com ou sem cookie', () => {
    expect(gate({ url: url('/blog/x'), key: 's', cookie: undefined, html: published })).toBe('pass')
    expect(gate({ url: url('/blog/x'), key: 's', cookie: 'errado', html: published })).toBe('pass')
  })

  it('rascunho só passa com o cookie certo', () => {
    expect(gate({ url: url('/blog/x'), key: 's', cookie: undefined, html: draft })).toBe('hide')
    expect(gate({ url: url('/blog/x'), key: 's', cookie: 'errado', html: draft })).toBe('hide')
    expect(gate({ url: url('/blog/x'), key: 's', cookie: 's', html: draft })).toBe('pass')
  })

  it('?key= certo grava o cookie; errado não', () => {
    expect(gate({ url: url('/blog/x?key=s'), key: 's', html: '' })).toBe('login')
    expect(gate({ url: url('/blog/x?key=outro'), key: 's', html: draft })).toBe('hide')
  })

  it('com o cookie, /blog/ vira a lista com rascunhos; sem ele, a lista pública passa e a escondida some', () => {
    expect(gate({ url: url('/blog/'), key: 's', cookie: 's', html: '' })).toBe('drafts')
    expect(gate({ url: url('/blog'), key: 's', cookie: 's', html: '' })).toBe('drafts')
    expect(gate({ url: url('/blog/'), key: 's', cookie: undefined, html: published })).toBe('pass')
    expect(gate({ url: url('/blog/drafts/'), key: 's', cookie: undefined, html: draft })).toBe('hide')
    expect(gate({ url: url('/blog/drafts/'), key: 's', cookie: 's', html: draft })).toBe('pass')
  })

  it('sem DRAFT_KEY configurada, rascunho fica fechado e ?key= não entra', () => {
    expect(gate({ url: url('/blog/x?key='), key: undefined, html: draft })).toBe('hide')
    expect(gate({ url: url('/blog/x'), key: undefined, cookie: undefined, html: draft })).toBe('hide')
  })
})
