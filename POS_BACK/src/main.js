import { sideButton, userProfileButton } from "./components/sidebar.js";
import { createSearchBar, createTopBarIcons } from "./components/searchbar.js";
import { buildInventoryCards, createItemsPage } from "./components/inventory.js";
import { getInventory } from "./services/InventoryRequests.js";
import { createButton } from "./components/createButton.js";
import { createOrderCards } from "./components/orders.js";

window.addEventListener("load", () => {
  const leftBar = document.getElementById("left-bar");
  const topBar = document.getElementById("top-bar");
  const buttonBar = document.getElementById("content-header");
  const content = document.getElementById("content");

  const routes = {
    orders: {
      keepToolbar: false,

      mount: () => { 
        content.className = "p-4 grid grid-cols-1 gap-4";
        createOrderCards("#content") 
      },
      unmount: () => { content.className = ''; content.innerHTML = ''; }
    },
    inventory: {
      keepToolbar: false,

      mount: () => {
content.className = "p-4 grid grid-cols-[repeat(auto-fill,minmax(288px,1fr))] gap-4";
        createButton("#content-header", "Add Products", () => {
          router.keepToolbar = true;
          router.go('addProduct');
        });
        getInventory().then(result => buildInventoryCards(result.products, "#content"));
      },
      unmount: () => { content.className = ''; content.innerHTML = ''; }
    },
    addProduct: {
      keepToolbar: true,
      mount: () => {
        content.className = 'p-4 flex flex-col';
        content.append(createItemsPage());
      },
      unmount: () => { content.className = ''; content.innerHTML = ''; }
    }, financials: {
      keepToolbar: false,

      mount: () => { },
      unmount: () => { content.className = ''; content.innerHTML = ''; }
    },
    users: {
      keepToolbar: false,
      mount: () => { },
      unmount: () => { content.className = ''; content.innerHTML = ''; }
    },
    // ...
  };

  const router = {
    current: null,
    keepToolbar: false,
    go(page) {
      if (this.current === page) return;
      if (this.current) {
        routes[this.current].unmount();
      }
      if (!this.keepToolbar) buttonBar.innerHTML = '';
      this.keepToolbar = false;
      this.current = page;
      routes[page].mount();
    }
  };

  if (leftBar) {
    const ordersBtn = sideButton("Orders", "fa-house", () => router.go('orders'));
    const usersBtn = sideButton("Users", "fa-user", () => router.go('users'));
    const inventoryBtn = sideButton("Inventory", "fa-folder-closed", () => router.go('inventory'));
    const financialsBtn = sideButton("Financials", "fa-money-bills", () => router.go('financials'));

    leftBar.append(ordersBtn, usersBtn, inventoryBtn, financialsBtn);

    const user1 = userProfileButton("Vardaan", "Active", () => { });
    leftBar.append(user1);
  } else {
    console.error("Could not find element with ID 'left-bar'");
  }

  if (topBar) {
    const searchBar = createSearchBar(() => { });
    const topBarIcons = createTopBarIcons();
    topBar.append(searchBar, topBarIcons);
  } else {
    console.error("Could not find element with ID 'top-bar'");
  }
  window.router = router;
  router.go('orders');
});