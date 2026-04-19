export async function getFinancials(start, end) {
    const url = `POS_BACK/api/finance/FinancialReports.php?start=${start}&end=${end}`;
    try {
        const response = await fetch(url);
        return await response.json();
    } catch (error) {
        console.error("Finance API Error:", error);
        return { errors: ["Failed to connect to server"] };
    }
}
