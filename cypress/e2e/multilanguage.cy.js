describe('i18n com prefixo de URL', () => {
  it('visitante com navegador em inglês é redirecionado de / para /en/', () => {
    cy.visit('/')
    cy.url().should('include', '/en')
    cy.contains('Web developer').should('be.visible')
  })

  it('depois de escolher um idioma manualmente, / não redireciona mais', () => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('locale-chosen', '1')
      }
    })
    cy.url().should('not.include', '/en')
    cy.contains('Desenvolvedor web').should('be.visible')
  })

  it('/en/ mostra o conteúdo em inglês', () => {
    cy.visit('/en/')
    cy.contains('Web developer').should('be.visible')
  })

  it('os links do footer navegam para o idioma certo', () => {
    cy.visit('/')
    cy.get('.locale-link').eq(1).click()
    cy.url().should('include', '/en')
    cy.contains('Web developer').should('be.visible')
  })
})
