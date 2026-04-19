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
        getInventory().then(result => buildInventoryCards(result.products, "#content", (clickedProduct) => {
          router.go("editProduct", clickedProduct); }));
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
    },
    editProduct: {
      keepToolbar: true,
      mount: (product) => {
        content.className = 'p-4 flex flex-col';
        content.append(editItemPage(product));
      }
      unmount: () => { content.className = ''; content.innerHTML = ''; }
    },
    financials: {
    keepToolbar: true,
    mount: () => {
        content.className = "p-6 flex flex-col gap-6";
        
        // 1. Setup the Toolbar
        const toolbar = createFinancialsToolbar((start, end) => {
            // Re-render content when form is submitted
            getFinancials(start, end).then(data => {
                renderFinancialsContent(content, data);
            });
        });
        
        document.getElementById("content-header").append(toolbar);

        // 2. Set default dates and trigger initial load
        const endStr = new Date().toISOString().split('T')[0];
        const start = new Date();
        start.setDate(1);
        const startStr = start.toISOString().split('T')[0];

        toolbar.querySelector('#startDate').value = startStr;
        toolbar.querySelector('#endDate').value = endStr;

        // Fetch first view
        getFinancials(startStr, endStr).then(data => {
            renderFinancialsContent(content, data);
        });
    },
    unmount: () => { 
        content.className = ''; 
        content.innerHTML = ''; 
    }
},
    users: {
      keepToolbar: false,
      mount: () => { 
        content.className = "p-4 grid grid-cols-1 gap-4";
        getUsers().then(result => createUserCards("#content", result, (clickedUser) => {
          router.go("editUser", clickedUser);
        }));
      },
      unmount: () => { content.className = ''; content.innerHTML = ''; }
    },
    editUser:{
      keepToolBar: true,
      mount: (user) => { 
        content.className = "p-4 grid grid-cols-1 gap-4";
        content.append(editUserPage(user)); //editUserPage needs to be implemented
      },
      unmount: () => { content.className = ''; content.innerHTML = ''; }
    },
    addUser:{
      keepToolBar: true,
      mount: () => {
        content.className = "p-4 flex flex-col";
        content.append(createUserPage(clickedUser)); //createUserPage needs to be fixed
      },
      unmount: () => { content.className = ''; content.innerHTML = ''; }
    }
    // ...
  };

  const router = {
    current: null,
    params: null,
    keepToolbar: false,
    go(page, params = null) {
      if (this.current === page) return;
      if (this.current) {
        routes[this.current].unmount();
      }
      if (!this.keepToolbar) buttonBar.innerHTML = '';
      this.keepToolbar = false;
      this.current = page;
      this.params = params;
      routes[page].mount(params);
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
