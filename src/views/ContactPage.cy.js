import ContactPage from './ContactPage.vue'

describe('<ContactPage />', () => {
  it('renders', () => {
    // see: https://test-utils.vuejs.org/guide/
    cy.mount(ContactPage)
  })
})