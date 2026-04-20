/**
 * Name: Vardaan Randev
 * Date: April 20, 2026
 * Description: Manages frontend interactions, including mobile menu toggling, 
 * modal visibility, and dynamic display logic for the dashboard.
 */

import { sideButton, userProfileButton } from "./components/sidebar.js";
import { createSearchBar, createTopBarIcons } from "./components/searchbar.js";
import { buildInventoryPage, createItemsPage, editItemPage } from "./components/inventory.js";
import { getInventory } from "./services/InventoryRequests.js";
import { createButton } from "./components/createButton.js";
import { createOrdersPage } from "./components/orders.js";
import { createUsersPage, createUserPage, editUserPage } from "./components/users.js";
import { showToast } from "./components/permissions.js";
import { getFinancials } from "./services/FinanceRequests.js";
import { getUsers } from "./services/UserRequests.js";
import { createFinancialsPage } from "./components/financials.js";

//Dynamically Construcing Page
window.addEventListener("load", () => {
  const leftBar = document.getElementById("left-bar");
  const topBar = document.getElementById("top-bar");
  const buttonBar = document.getElementById("content-header");
  const content = document.getElementById("content");

  const userId = localStorage.getItem('user_id');
  const userRole = localStorage.getItem('privilege');

  let ordersCleanup = null; // holds FAB cleanup fn from orders page

  //List of Page Routes
  const routes = {
    orders: {
      role: ["owner", "employee"],
      mount: () => {
        content.className = "p-4 flex flex-col gap-4";
        createOrdersPage(content).then(cleanup => { ordersCleanup = cleanup; });
      },
      unmount: () => {
        content.className = ''; content.innerHTML = '';
        if (ordersCleanup) { ordersCleanup(); ordersCleanup = null; }
      }
    },
    inventory: {
      role: ["owner", "employee"],
      mount: () => {
        content.className = "p-4 flex flex-col gap-4";
        createButton(buttonBar, "New Item", () => {
          routes['inventory'].unmount();
          router.go('addProduct');
        });
        getInventory().then(result => {
          buildInventoryPage(result.products, content, (clickedProduct) => {
            router.go("editProduct", clickedProduct);
          });
        });
      },
      unmount: () => { content.className = ''; content.innerHTML = ''; }
    },
    addProduct: {
      role: ["owner"],
      mount: () => {
        content.className = 'p-4 flex flex-col';
        content.append(createItemsPage());
      },
      unmount: () => { content.className = ''; content.innerHTML = ''; }
    },
    editProduct: {
      role: ["owner"],
      mount: (product) => {
        content.className = 'p-4 flex items-center justify-center';
        content.append(editItemPage(product));
      },
      unmount: () => { content.className = ''; content.innerHTML = ''; }
    },
    financials: {
      role: ["owner"],
      mount: () => {
        content.className = "p-6 flex flex-col gap-6";
        getFinancials(
          new Date(new Date().setDate(1)).toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        ).then(data => {
          content.innerHTML = "";
          content.append(createFinancialsPage(data));
          console.log('Financials data:', data);
        }).catch(err => {
      content.innerHTML = `<p class="text-red-500">Error loading financials: ${err.message}</p>`;
    });
      },
      unmount: () => { content.className = ''; content.innerHTML = ''; }
    },
    users: {
      role: ["owner", "employee"],
      mount: () => {
        content.className = "p-4 md:p-6 flex flex-col gap-4";
        buttonBar.innerHTML = `
          <div class="hidden md:flex items-center gap-2">
            <button id="add-staff-btn" class="px-4 py-2 bg-[#3d1f0f] text-white rounded-xl text-sm flex items-center gap-2 hover:bg-[#2a1508]">
              <i class="fa-solid fa-user-plus text-xs"></i> Add Staff
            </button>
          </div>
          <button id="add-staff-btn-mobile" class="md:hidden px-4 py-2 bg-[#3d1f0f] text-white rounded-xl text-sm flex items-center gap-2">
            <i class="fa-solid fa-user-plus text-xs"></i> Add Staff
          </button>
        `;
        buttonBar.querySelector('#add-staff-btn')?.addEventListener('click', () => router.go('addUser'));
        buttonBar.querySelector('#add-staff-btn-mobile')?.addEventListener('click', () => router.go('addUser'));

        getUsers().then(result => {
          content.append(createUsersPage(result, (clickedUser) => router.go("editUser", clickedUser)));
        });
      },
      unmount: () => { content.className = ''; content.innerHTML = ''; }
    },
    editUser: {
      role: ["owner"],
      mount: (user) => {
        content.className = "p-4 flex flex-col";
        content.append(editUserPage(user));
      },
      unmount: () => { content.className = ''; content.innerHTML = ''; }
    },
    addUser: {
      role: ["owner"],
      mount: () => {
        content.className = "p-4 flex flex-col";
        content.append(createUserPage());
      },
      unmount: () => { content.className = ''; content.innerHTML = ''; }
    }
  };

  //Page Router
  const router = {
    current: null,
    params: null,
    go(page, params = null, force = false) {
      if (this.current === page && !force) return;
      const route = routes[page];
      if (!route.role.includes(userRole)) {
        showToast("You don't have permission to access this page.", "error");
        return;
      }
      if (this.current) routes[this.current].unmount();
      buttonBar.innerHTML = '';
      this.current = page;
      this.params = params;
      route.mount(params);
    }
  };

  if (leftBar) {
    const ordersBtn     = sideButton("Orders",     "fa-receipt",       () => router.go('orders'));
    const usersBtn      = sideButton("Users",      "fa-user",          () => router.go('users'));
    const inventoryBtn  = sideButton("Inventory",  "fa-folder-closed", () => router.go('inventory'));
    const financialsBtn = sideButton("Financials", "fa-money-bills",   () => router.go('financials'));
    leftBar.append(ordersBtn, usersBtn, inventoryBtn, financialsBtn);

    const userProfile = userProfileButton("Vardaan", "Active", () => {});
    leftBar.append(userProfile);
  } else {
    console.error("Could not find element with ID 'left-bar'");
  }

if (topBar) {
    // 1. Define the pages you want to show in the search dropdown
    const searchablePages = [
        { name: "Manage Orders",     route: "orders",     icon: "fa-receipt" },
        { name: "User Management",   route: "users",      icon: "fa-user" },
        { name: "Product Inventory", route: "inventory",  icon: "fa-folder-closed" },
        { name: "Financial Reports", route: "financials", icon: "fa-money-bills" }
    ];

    // 2. Initialize searchBar with filtering and navigation logic
    const searchBar = createSearchBar(
        // onInput logic
        (term, dropdown) => {
            const cleanTerm = term.toLowerCase().trim();
            if (!cleanTerm) {
                dropdown.classList.add('hidden');
                return;
            }

            // Filter by name and check if userRole is allowed to see that route
            const matches = searchablePages.filter(p => 
                p.name.toLowerCase().includes(cleanTerm) && 
                routes[p.route].role.includes(userRole) // Permission check
            );

            if (matches.length > 0) {
                dropdown.innerHTML = matches.map(page => `
                    <div data-route="${page.route}" class="px-4 py-3 hover:bg-stone-50 cursor-pointer flex items-center gap-3 border-b border-stone-100 last:border-0 transition-colors">
                        <i class="fa-solid ${page.icon} text-stone-400 text-xs"></i>
                        <span class="text-sm font-medium text-stone-700">${page.name}</span>
                    </div>
                `).join('');
                dropdown.classList.remove('hidden');
            } else {
                dropdown.innerHTML = `<div class="px-4 py-3 text-sm text-stone-400 italic">No pages found</div>`;
                dropdown.classList.remove('hidden');
            }
        },
        // onNavigate logic (triggers your router)
        (route) => router.go(route)
    );

    const topBarIcons = createTopBarIcons();
    topBar.append(searchBar, topBarIcons);
}

  window.router = router;
  router.go('orders');
});