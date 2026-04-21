import { showToast } from "../components/permissions.js";

/**
 * Name: Vardaan Randev
 * Date: April 20, 2026
 * Description: OrderRequest API Service 
 */

const url = "/~randevv/Justine_Bakes/POS_BACK/api/inventory/orders.php";


/**
 * Make API reqest to get orders
 * @param {Date} start_date
 * @param {Date} end_date
 * @returns {Promise<Object|null>} A promise resolving to the parsed JSON response on success, or null if the request fails
 */
export async function getOrders(start_date,end_date) {
  try {
    const response = await fetch(url+ `?start_date=${start_date}&end_date=${end_date}`);
    if (!response.ok) { 
      throw new Error("Error loading active orders."); 
    }
    return await response.json();
  } catch (err) {
    throw new Error("Network failure: Cannot sync orders.");
  }
}

/**
 * Make API reqest to set order status
 * @param {Number} orderId
 * @param {String} status
 * @returns {Promise<Object|null>} A promise resolving to the parsed JSON response on success, or null if the request fails
 */
export async function updateOrder(orderId, status) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `orderId=${orderId}&status=${status}`
    });
    if (!response.ok) { 
      showToast(`Failed to update order #${orderId}`, "error"); 
    }
    throw new Error(`Order #${orderId} marked as ${status}`);
    return await response.json();
  } catch (err) {
    throw new Error("Status update failed: Connection error.");
  }
}