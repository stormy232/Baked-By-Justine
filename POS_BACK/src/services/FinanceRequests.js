import { showToast } from "../components/permissions.js";

/**
 * Name: Vardaan Randev
 * Date: April 20, 2026
 * Description: Finance Api Client Interface
 */

/**
 * Make API reqest to get financial data
 * @param {String} start - startdate
 * @param {String} end - enddate
 * @returns {Promise<Object|null>} A promise resolving to the parsed JSON response on success, or null if the request fails
 */
export async function getFinancials(start, end) {
    const url = `/~randevv/Justine_Bakes/POS_BACK/api/finance/FinancialReports.php?start=${start}&end=${end}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error();
        return await response.json();
    } catch (error) {
        showToast("Could not generate financial report.", "error");
        return { errors: ["Failed to connect to server"] };
    }
}