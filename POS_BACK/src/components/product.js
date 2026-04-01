export function createProductCard(category, name, price, status, units, imageUrl ) {
  const card = document.createElement('div');
  card.className = "bg-white rounded-xl overflow-hidden border border-gray-100";

  const isLowStock = status === 'low';

  card.innerHTML = `
    <div class="relative">
      <img src="${imageUrl}" alt="${name}" class="w-full h-48 object-cover" />
      <span class="absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded ${
        isLowStock 
          ? 'bg-red-700 text-white' 
          : 'bg-white text-gray-600 border border-gray-200'
      }">
        ${isLowStock ? 'LOW STOCK' : 'IN STOCK'}
      </span>
    </div>
    <div class="p-4">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs text-gray-400 uppercase tracking-wide">${category}</span>
        <span class="font-semibold text-[#2d2621]">$${price}</span>
      </div>
      <p class="font-semibold text-[#2d2621] text-lg mb-3">${name}</p>
      <div class="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
        ${isLowStock ? `
          <span class="text-red-600 flex items-center gap-1">
            <i class="fa-solid fa-basket-shopping text-xs"></i> Only ${units} units left
          </span>
          <button class="text-red-700 font-medium hover:underline">Restock</button>
        ` : `
          <span class="flex items-center gap-1">
            <i class="fa-solid fa-basket-shopping text-xs"></i> ${units} units available
          </span>
          <button class="text-gray-400 hover:text-gray-600"><i class="fa-solid fa-ellipsis"></i></button>
        `}
      </div>
    </div>
  `;

  return card;
}
