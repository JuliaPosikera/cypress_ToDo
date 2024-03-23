import { preraredList } from "../../testData/preparedData";

Cypress.Commands.add("getLiCount", () => {
  return cy.get("ul.todo-list li").its("length");
});

Cypress.Commands.add("getNumberFromFooter", () => {
  cy.get("span.todo-count strong")
    .invoke("text")
    .then((number) => {
      const parsedNumber = Number(number.trim());
      return parsedNumber;
    });
});

describe("TODO", () => {
  beforeEach(() => {
    cy.visit("https://example.cypress.io/todo#/");
    cy.window().then((win) => {
      win.localStorage.removeItem("todos-vanillajs");
      win.localStorage.setItem("todos-vanillajs", JSON.stringify(preraredList));
    });
    cy.reload();
  });

  it("Add new list item", () => {
    let itemsQuantity;

    // Get initial count of <li> elements
    cy.getLiCount().then((count) => {
      itemsQuantity = count;
    });

    // Add new item
    cy.get(`[data-test="new-todo"]`).type("Buy groceries").type(`{enter}`);
    cy.get("ul.todo-list li")
      .last()
      .then((lastLi) => {
        // Check if the item item is not visible
        cy.wrap(lastLi).find("label").should("have.text", "Buy groceries");
        // Check if the item item is not checked like completed
        cy.wrap(lastLi).find("input[type='checkbox']").should("not.be.checked");
      });
    // Check if the count inscreased by 1 after deletion
    cy.getLiCount().then((count) => {
      expect(count).to.eq(itemsQuantity + 1);
    });
    cy.getNumberFromFooter().then((number) => {
      expect(number).to.eq(3);
    });
  });

  it("Delete list item", () => {
    let itemsQuantity;
    let nameItemToDelete;
    // Get initial count of <li> elements
    cy.getLiCount().then((count) => {
      itemsQuantity = count;
      // Get name of the first item
      cy.get("ul.todo-list li")
        .first()
        .find("label")
        .invoke("text")
        .then((itemName) => {
          nameItemToDelete = itemName;

          // Delete the first item
          cy.get("ul.todo-list li")
            .first()
            .find("button.destroy.todo-button")
            .invoke("show") // Show the hidden button before triggering mouseover
            .click();
          // Check if the count decreased by 1 after deletion
          cy.getLiCount().then((newCount) => {
            expect(newCount).to.eq(itemsQuantity - 1);
          });
          //Check number of left tasks
          cy.getNumberFromFooter().then((number) => {
            expect(number).to.eq(1);
          });
          // Check if the deleted item is not visible
          cy.contains(nameItemToDelete).should("not.exist");
        });
    });
  });

  it("Rename list item", () => {
    let itemsQuantity;
    let nameItemToRename;
    // Get initial count of <li> elements
    cy.getLiCount().then((count) => {
      itemsQuantity = count;
      // Get name of the first item
      cy.get("ul.todo-list li")
        .first()
        .find("label")
        .invoke("text")
        .then((itemName) => {
          nameItemToRename = itemName;
        });
      // Renane item
      cy.get("ul.todo-list li")
        .first()
        .dblclick()
        .type("{backspace}")
        .type("Newtext")
        .type(`{enter}`);
      //Check number of left tasks
      cy.getNumberFromFooter().then((number) => {
        expect(number).to.eq(2);
      });
      // Check if the count doesn't change
      cy.getLiCount().then((newCount) => {
        expect(newCount).to.eq(itemsQuantity);

        // Check if the deleted item is not visible
        cy.get("ul.todo-list li")
          .contains(nameItemToRename)
          .should("not.exist");
      });
    });
  });

  it("check item like completed", () => {
    let itemsQuantity;
    let nameItemToCompleted;
    // Get initial count of <li> elements
    cy.getLiCount().then((count) => {
      itemsQuantity = count;
    });
    // Get name of the first item
    cy.get("ul.todo-list li")
      .first()
      .find("label")
      .invoke("text")
      .then((itemName) => {
        nameItemToCompleted = itemName;

        // Check item like completed
        cy.get("ul.todo-list li")
          .first()
          .then((item) => {
            cy.wrap(item).find("input[type='checkbox']").click();
            expect(cy.wrap(item).should("have.class", "completed"));
          });
        // Check if the count doesn't change
        cy.getLiCount().then((newCount) => {
          expect(newCount).to.eq(itemsQuantity);
        });
        // Check correct view of completed item
        cy.get('a[href="#/completed"]').click();
        cy.getLiCount().then((count) => {
          expect(count).to.eq(2);
        });

        cy.log("nameItemToCompleted =" + nameItemToCompleted);
        cy.get("ul.todo-list li")
          .contains(nameItemToCompleted)
          .should("be.visible");

        //Check number of left tasks
        cy.getNumberFromFooter().then((number) => {
          expect(number).to.eq(1);
        });

        //check if all completed tasks have correct class
        cy.get("ul.todo-list li").each(($li) => {
          cy.wrap($li).should("have.class", "completed");
        });
      });
  });

  it("check filter of completed and uncompleted tasks", () => {
    cy.getLiCount().then((count) => {
      expect(count).to.eq(3);
    });
    // Check correct view of completed item
    cy.get('a[href="#/completed"]').click();
    cy.getLiCount().then((count) => {
      expect(count).to.eq(1);
    });
    // Check correct view of uncompleted item
    cy.get('a[href="#/active"]').click();
    cy.getLiCount().then((count) => {
      expect(count).to.eq(2);
    });
  });

  it("check clear completed function", () => {
    cy.get('button[class="todo-button clear-completed"]').click();

    // Check correct view of completed item

    cy.getLiCount().then((count) => {
      expect(count).to.eq(2);
    });
    // Check correct view of uncompleted item

    cy.get('button[class="todo-button clear-completed"]').should(
      "not.be.visible"
    );
    //Check number of left tasks

    cy.getNumberFromFooter().then((number) => {
      expect(number).to.eq(2);
    });
    // Check correct view of completed item
    cy.get('a[href="#/completed"]').click();
    cy.get("ul.todo-list").should("not.be.visible");
  });
});
