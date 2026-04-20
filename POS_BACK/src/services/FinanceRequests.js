import { showToast } from "../components/permissions.js";

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