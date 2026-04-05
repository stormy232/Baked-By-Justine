import { sideButton, userProfileButton } from "./components/sidebar.js";
import { createSearchBar, createTopBarIcons } from "./components/searchbar.js"
import { buildInventoryCards } from "./components/inventory.js";
import { getInventory } from "./services/InventoryRequests.js";

window.addEventListener("load", () => {

  const leftBar = document.getElementById("left-bar");
  const topBar = document.getElementById("top-bar");
  const content = document.getElementById("content");

  if (leftBar) {
    // Example of adding the side buttons we discussed
    const ordersBtn = sideButton("Orders", "fa-house", () => {});
    const usersBtn = sideButton("Users", "fa-user", () => {});
    const inventoryBtn = sideButton("Inventory", "fa-folder-closed", () => {
      getInventory().then(result => buildInventoryCards(result.products, "#content"))}
    );
    const financialsBtn = sideButton("Financials", "fa-money-bills", () => {});
    leftBar.append(ordersBtn, usersBtn, inventoryBtn, financialsBtn);

    // This is likely where the "One button" issue is happening
    // Ensure you are creating NEW instances for each user
    const user1 = userProfileButton("Vardaan", "Active", () => {});

    leftBar.append(user1);
  } else {
    console.error("Could not find element with ID 'left-bar'");
  }
  if(topBar){
    const searchBar = createSearchBar(() => {});
    const topBarIcons = createTopBarIcons();
    topBar.append(searchBar, topBarIcons);
  }else{
        console.error("Could not find element with ID 'top-bar'");
  }
});
  
