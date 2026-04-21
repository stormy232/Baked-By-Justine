import { showToast } from "../components/permissions.js";

/**
 * Name: Vardaan Randev
 * Date: April 20, 2026
 * Description: Inventory Request API client interface
 */

const url = "/~randevv/Justine_Bakes/POS_BACK/api/inventory/inventory.php";
const updateURL = "/~randevv/Justine_Bakes/POS_BACK/api/inventory/updateInventory.php";


/**
 * Make API reqest to get inventory products
 * @param {String} category 
 * @param {String} searchTerm
 * @param {Number} limit 
 * @returns {Object} response
 */
export async function getInventory(category = "All", searchTerm = "", limit = 50, start = 0) {
    try {
        const response = await fetch(url + `?category=${category}&name=${searchTerm}&limit=${limit}&start=${start}`);
        if (!response.ok) {
            showToast("Could not load inventory data.", "error");
            return null;
        }
        return await response.json();
    } catch (error) {
        showToast("Server unreachable: Inventory offline.", "error");
    }
}

/**
 * Make API reqest to update inventory product
 * @param {FormData} formData
 * @returns {Object || null} response
 */
export function updateInventory(formData) {
    fetch(updateURL, {
        method: "POST",
        body: formData,
    })
    .then(response => {
        if (!response.ok) throw new Error();
        showToast("Inventory updated successfully!", "success");
        return response.json();
    })
    .catch(() => showToast("Failed to save inventory changes.", "error"));
}


/**
 * Make API reqest to remove inventory product
 * @param {Number} inventoryId
 * @returns {Object || null} response
 */
export function removeInventory(inventoryId){
  fetch(updateURL+`?id=${inventoryId}` , {
    method: "GET" 
  })
  .then(response => {if(!response.ok){console.error("ISSUE");} return response.json()})
  .catch(error => console.error(`error: ${error}`)); 
}

/**
 * Make API reqest to create inventory product
 * @param {FormData} formData
 * @returns {Object || null} response
 */
export function createInventory(formData){
  fetch(url, {
    method: "POST",
    body: formData
  })
   .then(response => {
        if (!response.ok) throw new Error();
        showToast("Inventory updated successfully!", "success");
        return response.json();
    })
    .catch(() => showToast("Failed to save inventory changes.", "error"));
}