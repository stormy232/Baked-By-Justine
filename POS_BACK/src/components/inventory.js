function InventoryCard(Title, Image, Price, Units, Category) {
  const wrapper = document.createElement('div');
  wrapper.className = "bg-white rounded-xl overflow-hidden w-72";
  wrapper.innerHTML = `
    <img src="${Image ?? ''}" class="h-48 w-full object-cover" />
    <div class="p-4 flex flex-col gap-3">
      <div class="flex justify-between items-start">
        <div class="flex flex-col gap-1">
          <div class="text-sm text-gray-400">${Category}</div>
          <div class="font-medium">${Title}</div>
        </div>
        <div class="font-medium">£${parseFloat(Price).toFixed(2)}</div>
      </div>
      <hr class="border-gray-100" />
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-500">${Units} Available</div>
      </div>
    </div>
  `;
  return wrapper;
}

export function buildInventoryCards(products, containerSelector) {
  const container = document.querySelector(containerSelector);
  container.innerHTML = '';
  products.forEach(p => {
    const card = InventoryCard(p.name, p.image_link, p.price, p.quantity, p.category);
    container.appendChild(card);
  });
}

