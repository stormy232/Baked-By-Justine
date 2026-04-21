import { showToast } from "../components/permissions.js";

/**
 * Name: Vardaan Randev
 * Date: April 20, 2026
 * Description: UserRequest API
 */

const url = "/~randevv/Justine_Bakes/POS_BACK/api/users/register.php";
const updateURL = "/~randevv/Justine_Bakes/POS_BACK/api/users/updateUser.php";
const logoutURL = "/~randevv/Justine_Bakes/POS_BACK/api/users/logoutUser.php"

/**
 * Fetches the full list of registered staff users from the server.
 *
 * @returns {Promise<Object|null>} A promise resolving to the parsed JSON user list, or null if the request fails
 */
export async function getUsers() {
  try {
    const response = await fetch(updateURL);
    if (!response.ok) { 
      showToast("Failed to retrieve staff list.", "error"); 
      return null; 
    }
    return await response.json();
  } catch (err) {
    showToast("Network error: Could not reach user server.", "error");
    return null;
  }
}

/**
 * Submits a new user registration request to the server.
 *
 * @param {FormData} formData - Form data containing the new user's registration details (e.g., username, password, privilege)
 * @returns {Promise<Object|null>} A promise resolving to the parsed JSON response on success, or null if the request fails
 */
export async function registerUser(formData) {
  try {
    const response = await fetch(url, { method: "POST", body: formData });
    if (!response.ok) { 
      showToast("Could not register new user.", "error"); 
      return null; 
    }
    showToast("User registered successfully!", "success");
    return await response.json();
  } catch (err) {
    showToast("Error connecting to registration service.", "error");
    return null;
  }
}


/**
 * Sends updated profile information for an existing user to the server.
 *
 * @param {FormData} formData - Form data containing the updated user fields (e.g., username, password, privilege)
 * @returns {Promise<Object|null>} A promise resolving to the parsed JSON response on success, or null if the request fails
 */
export async function updateUser(formData) {
  try {
    const response = await fetch(updateURL, { method: "POST", body: formData });
    if (!response.ok) { 
      showToast("Update failed: Server rejected the changes.", "error"); 
      return null; 
    }
    showToast("User profile updated.", "success");
    return await response.json();
  } catch (err) {
    showToast("Connection lost: User update failed.", "error");
    return null;
  }
}


/**
 * Sends a request to delete a user account by their ID.
 *
 * @param {Number} id - The unique ID of the user to delete
 * @returns {Promise<Object|null>} A promise resolving to the parsed JSON response on success, or null if the request fails
 */
export async function deleteUser(id) {
  try {
    const response = await fetch(url + `?userid=${id}`);
    if (!response.ok) { 
      showToast("Update failed: Server rejected the changes.", "error"); 
      return null; 
    }
    showToast("User profile updated.", "success");
    return await response.json();
  } catch (err) {
    showToast("Connection lost: User update failed.", "error");
    return null;
  }
}


/**
 * Sends a logout request to end the current user's session.
 *
 * @returns {Promise<Object|null>} A promise resolving to the parsed JSON response on success, or null if the request fails
 */
export async function logoutUser() {
  try {
    const response = await fetch(url);
    if (!response.ok) { 
      showToast("Update failed: Server rejected the changes.", "error"); 
      return null; 
    }
    showToast("User profile updated.", "success");
    return await response.json();
  } catch (err) {
    showToast("Connection lost: User update failed.", "error");
    return null;
  }
}