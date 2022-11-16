describe('formulario de contato', () => {
  // it('it fills and submit the form', () => {
  //   cy.visit('http://localhost:3000/contato')
  //   // cy.get('.todo-list li').should('have.length', 2)

  //   cy.get('#grid-nome').type('Teste');
  //   cy.get('#grid-email').type('teste@teste.com');
  //   cy.get('#grid-telefone').type('12123456789');
  //   cy.get('#grid-mensagem').type('Esta é uma mensagem de teste com muitas letras. Esta é uma mensagem de teste com muitas letras.');
  //   cy.get('#grid-estado').select('AC');
  //   cy.get('#grid-cidade').select('Assis Brasil');
  //   cy.get(':nth-child(6) > .flex > .rounded').click();
  // })

  it('it has a submit button', () => {
    cy.visit('http://localhost:3000/contato')
    // cy.get('.todo-list li').should('have.length', 2)

    cy.get('#grid-nome').type('Teste');
    cy.get('#grid-email').type('teste@teste.com');
    cy.get('#grid-telefone').type('12123456789');
    cy.get('#grid-mensagem').type('Esta é uma mensagem de teste com muitas letras. Esta é uma mensagem de teste com muitas letras.');
    cy.get('#grid-estado').select('AC');
    cy.get('#grid-cidade').select('Assis Brasil');
    cy.get(':nth-child(6) > .flex > .rounded').should('be.visible');

    // cy.get(':nth-child(6) > .flex > .rounded').click();
    // cy.get('div[role=alert]').should('not.be.visible')
  })

  // it('and the submit button works', () => {
  //   cy.visit('http://localhost:3000/contato')

  //   cy.get('#grid-nome').type('Teste');
  //   cy.get('#grid-email').type('teste@teste.com');
  //   cy.get('#grid-telefone').type('12123456789');
  //   cy.get('#grid-mensagem').type('Esta é uma mensagem de teste com muitas letras. Esta é uma mensagem de teste com muitas letras.');
  //   cy.get('#grid-estado').select('AC');
  //   cy.get('#grid-cidade').select('Assis Brasil');
  //   cy.get(':nth-child(6) > .flex > .rounded').click();
  //   cy.contains('enviada com sucesso').should('be.visible')
  // })
})