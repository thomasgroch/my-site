describe('formulario de contato', () => {
  it('and the submit button works', () => {
    cy.visit('/contato')

    cy.get('#grid-nome').type('Teste');
    cy.get('#grid-email').type('teste@teste.com');
    cy.get('#grid-telefone').type('12123456789');
    cy.get('#grid-mensagem').type('Esta é uma mensagem de teste com muitas letras. Esta é uma mensagem de teste com muitas letras.');
    cy.get('#grid-estado').select('AC');
    cy.get('#grid-cidade').select('Assis Brasil');
    cy.get(':nth-child(6) > .flex > .rounded').click();
    cy.contains('enviada com sucesso').should('be.visible')
  })
})