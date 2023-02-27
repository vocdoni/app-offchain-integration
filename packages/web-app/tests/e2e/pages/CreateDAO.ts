export default class CreateDAO {
  goToCreateDAOPage() {
    cy.visit('/#/create');

    // Clicks Build your DAO on DAO Overview page
    cy.get('button').contains('Build your DAO').click();

    // Fills out the Select Chain form and proceeds to the next page
    cy.get('button').contains('Testnet').click();
    cy.get('p')
      .contains(/^Goerli$/)
      .click();
    cy.get('button').contains('Next').click();

    // Fills out mandatory fields on the Define DAO metadata page and proceeds to the next page
    cy.get('input[name="daoName"]').type('Cypress test');
    cy.get('input[name="daoEnsName"]').type(Date.now().toString());
    cy.get('textarea[name="daoSummary"]').type(
      'Cypress test to test Multisig DAO Creation'
    );
    cy.get('button[mode="primary"]')
      .contains('Next')
      .parent()
      .should('not.be.disabled')
      .click();

    // Selects multisig DAO type(with current user automatically added as a member) and clicks Next
    cy.get('p')
      .contains(/^Multisig members$/)
      .click();
    cy.get('button[mode="primary"]')
      .contains('Next')
      .parent()
      .should('not.be.disabled')
      .click();

    // Proceeds to next step with minimum approval automatically set as 1
    cy.get('button[mode="primary"]')
      .contains('Next')
      .parent()
      .should('not.be.disabled')
      .click();

    cy.wait(6000);
  }
}
