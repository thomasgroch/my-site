describe('empty spec', () => {
  it('passes', () => {
    cy.visit('/')
    cy.contains('Desenvolvedor web').should('be.visible')

    cy.get(':nth-child(1) > .w-10').click();
    cy.contains('Web developer').should('be.visible')

    cy.get(':nth-child(3) > .w-10').click();
    cy.contains('ウェブ開発者').should('be.visible')
  })
})
