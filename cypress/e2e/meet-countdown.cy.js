describe('Meet Countdown', () => {
  it('displays the countdown correctly for a future date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1); // Tomorrow
    futureDate.setHours(futureDate.getHours() + 1); // +1 hour

    const year = futureDate.getFullYear();
    const month = String(futureDate.getMonth() + 1).padStart(2, '0');
    const day = String(futureDate.getDate()).padStart(2, '0');
    const hours = String(futureDate.getHours()).padStart(2, '0');
    const minutes = String(futureDate.getMinutes()).padStart(2, '0');

    const dateParam = `${year}-${month}-${day}-${hours}-${minutes}`;
    const nameParam = 'test-user';

    cy.visit(`/meet/${nameParam}/${dateParam}`);

    cy.contains('Faltam').should('be.visible');
    cy.contains('1 dias').should('be.visible');
    // It might be 0 hours or 1 hour depending on the exact second, let's just check for 'horas'
    cy.contains('horas').should('be.visible');
  });

  it('shows the meeting room when it is time', () => {
    const pastDate = new Date();
    pastDate.setMinutes(pastDate.getMinutes() - 10); // 10 minutes ago

    const year = pastDate.getFullYear();
    const month = String(pastDate.getMonth() + 1).padStart(2, '0');
    const day = String(pastDate.getDate()).padStart(2, '0');
    const hours = String(pastDate.getHours()).padStart(2, '0');
    const minutes = String(pastDate.getMinutes()).padStart(2, '0');

    const dateParam = `${year}-${month}-${day}-${hours}-${minutes}`;
    const nameParam = 'test-user';

    cy.visit(`/meet/${nameParam}/${dateParam}`);

    // Jitsi iframe or container should be present
    cy.get('iframe').should('exist');
  });
});
