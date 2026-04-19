// Function to create the metric tile elements
function FinancialTile(label, value, isCurrency = true) {
    const tile = document.createElement('div');
    tile.className = "bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex flex-col gap-1";
    
    const formattedValue = isCurrency 
        ? `$${parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 2})}` 
        : value;

    tile.innerHTML = `
        <span class="text-xs font-bold text-stone-400 uppercase tracking-wider">${label}</span>
        <span class="text-2xl font-bold text-stone-800">${formattedValue}</span>
    `;
    return tile;
}

// Function to create the product sales table
function FinancialTable(products) {
    const wrapper = document.createElement('div');
    wrapper.className = "bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden";
    
    const rows = products.map(p => `
        <tr class="border-b border-stone-50 last:border-0 hover:bg-stone-50 transition-colors">
            <td class="px-6 py-4 text-sm font-medium text-stone-800">${p.product_name}</td>
            <td class="px-6 py-4 text-sm text-stone-600">${p.qty}</td>
            <td class="px-6 py-4 text-sm text-stone-800 font-semibold text-right">$${parseFloat(p.revenue).toFixed(2)}</td>
        </tr>
    `).join('');

    wrapper.innerHTML = `
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-stone-50 border-b border-stone-100">
                    <th class="px-6 py-3 text-xs font-bold text-stone-400 uppercase">Product</th>
                    <th class="px-6 py-3 text-xs font-bold text-stone-400 uppercase">Qty Sold</th>
                    <th class="px-6 py-3 text-xs font-bold text-stone-400 uppercase text-right">Revenue</th>
                </tr>
            </thead>
            <tbody>
                ${rows || '<tr><td colspan="3" class="p-8 text-center text-stone-400 italic">No sales data for this period.</td></tr>'}
            </tbody>
        </table>
    `;
    return wrapper;
}

// THE MAIN PAGE BUILDER
export function createFinancialsPage(data) {
    const container = document.createElement('div');
    container.className = "flex flex-col gap-8 w-full";

    // 1. Grid for Tiles
    const tilesGrid = document.createElement('div');
    tilesGrid.className = "grid grid-cols-1 md:grid-cols-3 gap-6";
    
    if (data.overview_tiles) {
        tilesGrid.append(
            FinancialTile("Gross Revenue", data.overview_tiles.gross_sales),
            FinancialTile("Total Orders", data.overview_tiles.total_orders, false),
            FinancialTile("Avg. Order Value", data.overview_tiles.aov)
        );
    }

    // 2. The Table
    const tableSection = FinancialTable(data.sales_by_product || []);

    container.append(tilesGrid, tableSection);
    return container;
}
