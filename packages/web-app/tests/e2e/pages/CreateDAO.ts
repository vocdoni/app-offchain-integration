export default class CreateDAO {
  goToCreateDAOPage() {
    cy.visit('/#/create');
    cy.get('button').contains('Build your DAO').click();
    cy.wait(5000);
    cy.switchToCypressWindow();
  }

  shouldBeConnected() {
    cy.get('nav button span').should('include.text', '0x');
  }
}
