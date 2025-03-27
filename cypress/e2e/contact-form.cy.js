describe('Contact Form', () => {
  beforeEach(() => {
    cy.visit('/contato')
  })

  it('displays the contact form', () => {
    cy.get('#grid-nome').should('be.visible')
    cy.get('#grid-email').should('be.visible')
    cy.get('#grid-telefone').should('be.visible')
    cy.get('#grid-estado').should('be.visible')
    cy.get('#grid-cidade').should('be.visible')
    cy.get('#grid-mensagem').should('be.visible')
  })

  it('successfully submits the form with valid data', () => {
    cy.intercept('POST', '/.netlify/functions/contact', {
      statusCode: 200,
      body: {
        message: 'Message sent successfully!',
        success: true
      }
    }).as('submitForm')

    cy.get('#grid-nome').type('Test User')
    cy.get('#grid-email').type('test@example.com')
    cy.get('#grid-telefone').type('1234567890')
    cy.get('#grid-mensagem').type('This is a test message')
    cy.get('#grid-estado').select('SP')
    cy.get('#grid-cidade').select('São Paulo')
    cy.get('button[type="submit"]').click()

    cy.wait('@submitForm')
    cy.contains('Sua mensagem foi enviada com sucesso').should('be.visible')
  })

  it('shows error message for missing required fields', () => {
    cy.intercept('POST', '/.netlify/functions/contact', {
      statusCode: 422,
      body: {
        error: 'Required information is missing.',
        missingFields: ['nome', 'email', 'telefone', 'estado', 'cidade', 'mensagem']
      }
    }).as('submitIncomplete')

    cy.get('button[type="submit"]').click()
    cy.wait('@submitIncomplete')
    cy.contains('Verifique se os campos estão preenchidos corretamente').should('be.visible')
  })

  it('handles server errors gracefully', () => {
    cy.intercept('POST', '/.netlify/functions/contact', {
      statusCode: 500,
      body: {
        error: 'Internal server error'
      }
    }).as('submitError')

    cy.get('#grid-nome').type('Test User')
    cy.get('#grid-email').type('test@example.com')
    cy.get('#grid-telefone').type('1234567890')
    cy.get('#grid-mensagem').type('This is a test message')
    cy.get('#grid-estado').select('SP')
    cy.get('#grid-cidade').select('São Paulo')
    cy.get('button[type="submit"]').click()

    cy.wait('@submitError')
    cy.contains('Ocorreu um erro ao enviar sua mensagem').should('be.visible')
  })
})
