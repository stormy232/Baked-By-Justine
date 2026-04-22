
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
            throw new Error("Could not load inventory data.");
        }
        return await response.json();
    } catch (error) {
        throw new Error("Server unreachable: Inventory offline.");
    }
}

/**
 * Make API reqest to update inventory product
 * @param {FormData} formData
 * @returns {Object || null} response
 */
export async function updateInventory(formData) {
  try {
    const response = await fetch(updateURL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Could not update inventory.");
    }

    return await response.json();
  } catch (error) {
    throw new Error("Server unreachable: Inventory offline.");
  }
}


/**
 * Make API reqest to remove inventory product
 * @param {Number} inventoryId
 * @returns {Object || null} response
 */
export async function removeInventory(inventoryId) {
  try {
    const response = await fetch(updateURL + `?id=${inventoryId}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error("Couldn't delete product.");
    }

    return await response.json();
  } catch (error) {
    throw new Error("Server unreachable: Inventory offline.");
  }
}

/**
 * Make API reqest to create inventory product
 * @param {FormData} formData
 * @returns {Object || null} response
 */
export async function createInventory(formData) {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Couldn't create product.");
    }

    return await response.json();
  } catch (error) {
    throw new Error("Server unreachable: Inventory offline.");
  }
}