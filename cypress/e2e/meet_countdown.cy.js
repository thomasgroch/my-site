describe('MeetPage Countdown', () => {
  it('displays the countdown for a future date', () => {
    const futureDate = '2030-01-01-12-00'
    cy.visit(`/meet/test-user/${futureDate}`)

    cy.contains('Faltam').should('be.visible')
    cy.contains('dias').should('be.visible')
    cy.contains('horas').should('be.visible')
    cy.contains('minutos').should('be.visible')
    cy.contains('segundos').should('be.visible')
  })

  it('displays the meeting iframe for a past date', () => {
    const pastDate = '2020-01-01-12-00'
    cy.visit(`/meet/test-user/${pastDate}`)

    cy.get('iframe').should('be.visible')
  })
})
