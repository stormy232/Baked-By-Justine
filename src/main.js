import { sideButton, userProfileButton } from "./components/sidebar.js";

window.addEventListener("load", () => {

  const leftBar = document.getElementById("left-bar");

  if (leftBar) {
    // Example of adding the side buttons we discussed
    const ordersBtn = sideButton("orders", "fa-house", () => {});
    const usersBtn = sideButton("Users", "fa-user", () => {});
    const inventoryBtn = sideButton("inventory", "fa-folder-closed", () => {});
    const financialsBtn = sideButton("financials", "fa-money-bills", () => {});
    leftBar.append(ordersBtn, usersBtn, inventoryBtn, financialsBtn);

    // This is likely where the "One button" issue is happening
    // Ensure you are creating NEW instances for each user
    const user1 = userProfileButton("Vardaan", "Active", true);

    leftBar.append(user1);
  } else {
    console.error("Could not find element with ID 'left-bar'");
  }
});
  
