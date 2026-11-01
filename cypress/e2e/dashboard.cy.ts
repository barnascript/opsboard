const logViolations = (violations: { id: string; impact?: string | null; nodes: unknown[] }[]) =>
  cy.task("log", violations.map((v) => `${v.impact}: ${v.id} (${v.nodes.length})`).join("\n"));

describe("Overview dashboard", () => {
  beforeEach(() => cy.visit("/"));

  it("loads both micro-frontends into the shell", () => {
    cy.findHeading("Sales");
    cy.findHeading("Customers");
    cy.contains("Revenue").should("be.visible");
    cy.get("table tbody tr").should("have.length", 20);
  });

  it("changes the sales range", () => {
    cy.findHeading("Sales");
    cy.contains("button", "7d").click().should("have.attr", "aria-pressed", "true");
    cy.get(".ob-chart__bar").should("have.length", 7);
  });

  it("filters, searches and pages customers", () => {
    cy.findHeading("Customers");
    cy.get("select").select("gold");
    cy.get("tbody .ob-badge").each(($b) => expect($b.text()).to.eq("gold"));
    cy.get("input[type=search]").type("zzzz-no-match");
    cy.contains("0 customers");
    cy.get("input[type=search]").clear();
    cy.get("select").select("");
    cy.contains("button", "Next").click();
    cy.contains("Page 2 of");
  });

  it("sends a strict Content-Security-Policy", () => {
    cy.request("/").its("headers").its("content-security-policy").should("include", "'strict-dynamic'");
  });

  it("has no serious accessibility violations", () => {
    cy.findHeading("Customers");
    cy.get("tbody tr").should("exist");
    cy.injectAxe();
    cy.checkA11y(undefined, { includedImpacts: ["critical", "serious"] }, logViolations);
  });

  it("keeps working when a remote is down", () => {
    cy.intercept("GET", "http://localhost:3002/**", { forceNetworkError: true });
    cy.visit("/");
    cy.findHeading("Sales");
    cy.contains("Customers is unavailable");
  });
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      findHeading(name: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}
Cypress.Commands.add("findHeading", (name: string) => cy.contains("h2", name, { timeout: 15000 }));
export {};
