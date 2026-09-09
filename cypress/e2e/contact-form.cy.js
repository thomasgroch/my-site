// Único teste que precisa de navegador de verdade: o htmx trocando o HTML da
// resposta no lugar certo. Todo o resto (marcação, idioma, links, SEO) é
// verificado sem navegador em test/dist.test.js.
//
// Roda contra um servidor já no ar: `npm run dev` em outro terminal, depois
// `npm run test:e2e`. Não faz parte do build nem do deploy.
describe('formulário de contato pelo htmx', () => {
  beforeEach(() => {
    cy.visit('/contato', {
      onBeforeLoad(win) {
        // A raiz redireciona conforme o idioma do navegador na primeira visita.
        win.localStorage.setItem('locale-chosen', '1')
      },
    })
  })

  it('troca o formulário pela mensagem de sucesso', () => {
    cy.get('#nome').type('Teste')
    cy.get('#email').type('teste@teste.com')
    cy.get('#mensagem').type('Esta é uma mensagem de teste.')
    cy.get('#contact-form button[type=submit]').click()

    cy.get('#contact-form', { timeout: 10000 }).should('not.exist')
    cy.contains('[role="status"]:visible', 'Sua mensagem foi enviada com sucesso!')
  })

  it('mostra o erro da função sem recarregar a página', () => {
    // Desliga a validação nativa para exercitar a resposta do servidor.
    cy.get('#contact-form').invoke('attr', 'novalidate', 'novalidate')
    cy.get('#nome').type('Teste')
    cy.get('#email').type('nao-e-email')
    cy.get('#mensagem').type('Mensagem de teste.')
    cy.get('#contact-form button[type=submit]').click()

    cy.get('#form-status').contains('e-mail válido', { timeout: 10000 }).should('be.visible')
    cy.get('#contact-form').should('exist')
  })
})
