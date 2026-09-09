describe('formulário de contato', () => {
  // A raiz redireciona para /en com base no idioma do navegador na primeira
  // visita. Os testes assumem pt, então simulam uma escolha já feita.
  function visitPt(path) {
    cy.visit(path, {
      onBeforeLoad(win) {
        win.localStorage.setItem('locale-chosen', '1')
      },
    })
  }

  it('mostra os campos e o botão de envio', () => {
    visitPt('/contato')
    cy.get('#nome').should('be.visible')
    cy.get('#email').should('be.visible')
    cy.get('#mensagem').should('be.visible')
    cy.get('#contact-form button[type=submit]').should('be.visible')
  })

  it('envia pelo htmx e troca o formulário pela mensagem de sucesso', () => {
    visitPt('/contato')
    cy.get('#nome').type('Teste')
    cy.get('#email').type('teste@teste.com')
    cy.get('#telefone').type('12123456789')
    cy.get('#mensagem').type('Esta é uma mensagem de teste com muitas letras.')
    cy.get('#contact-form button[type=submit]').click()
    // A caixa de sucesso do fallback sem JS (#enviado) existe escondida na
    // página; o que interessa é a que o htmx coloca no lugar do formulário.
    cy.get('#contact-form', { timeout: 10000 }).should('not.exist')
    cy.contains('[role="status"]:visible', 'Sua mensagem foi enviada com sucesso!')
  })

  it('mostra o erro da função quando o e-mail é inválido', () => {
    visitPt('/contato')
    // Ignora a validação nativa do navegador para exercitar a validação do servidor.
    cy.get('#contact-form').invoke('attr', 'novalidate', 'novalidate')
    cy.get('#nome').type('Teste')
    cy.get('#email').type('nao-e-email')
    cy.get('#mensagem').type('Mensagem de teste.')
    cy.get('#contact-form button[type=submit]').click()
    cy.get('#form-status').contains('e-mail válido', { timeout: 10000 }).should('be.visible')
  })
})
