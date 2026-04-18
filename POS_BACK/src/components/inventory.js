function InventoryCard(Title, Image, Price, Units, Category) {
  const wrapper = document.createElement('div');
  
  // Added transition, hover translate, shadow, and cursor classes
  wrapper.className = "bg-white rounded-xl overflow-hidden w-72 flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-xl cursor-pointer border border-transparent hover:border-stone-100";
  
  wrapper.innerHTML = `
    <div class="h-48 w-full overflow-hidden flex-shrink-0 bg-stone-100 flex items-center justify-center">
      ${Image
        ? `<img src="${Image}" class="h-full w-full object-cover transition-transform duration-500 hover:scale-110" />`
        : `<i class="fa-regular fa-image text-4xl text-stone-300"></i>`
      }
    </div>
    <div class="p-4 flex flex-col gap-3">
      <div class="flex justify-between items-start">
        <div class="flex flex-col gap-1">
          <div class="text-sm text-gray-400">${Category}</div>
          <div class="font-medium">${Title}</div>
        </div>
        <div class="font-medium">$${parseFloat(Price).toFixed(2)}</div>
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
    const imageUrl = p.image_link ? `${p.image_link}` : null;
    const card = InventoryCard(p.name, imageUrl, p.price, p.quantity, p.category);
    container.appendChild(card);
  });
}

export function createItemsPage() {
  const container = document.createElement('div');
  container.className = "min-h-screen bg-stone-100 p-6 flex w-full justify-center items-center";
  container.innerHTML = `
    <form class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-200" id="addProductForm">
      <h2 class="text-2xl font-bold text-yellow-950 mb-1">Add Product</h2>
      <p class="text-stone-600 mb-6">Enter your details to continue.</p>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-amber-900">Name</label>
          <input type="text" name="name" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2.5 border" placeholder="Product Name">
        </div>
        <div>
          <label class="block text-sm font-medium text-amber-900">Price</label>
          <input type="number" step="0.01" name="price" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2.5 border" placeholder="Price..">
        </div>
        <div>
          <label class="block text-sm font-medium text-amber-900">Quantity</label>
          <input type="number" step="1" name="quantity" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2.5 border" placeholder="Quantity...">
        </div>
        <div>
          <label class="block text-sm font-medium text-amber-900">Description</label>
          <input type="text" name="description" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2.5 border" placeholder="Description...">
        </div>
        <div>
          <label class="block text-sm font-medium text-amber-900">Discount</label>
          <input type="number" step="0.01" max="100" min="0" name="discount" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2.5 border" placeholder="Discount...">
        </div>
        <div>
          <label class="block text-sm font-medium text-amber-900">Category</label>
          <input type="text" name="category" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2.5 border" placeholder="Category...">
        </div>
        <div>
          <label class="block text-sm font-medium text-amber-900">Image</label>
          <input type="file" name="fileToUpload" id="fileToUpload" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2.5 border">
        </div>
      </div>
      <input type="submit" value="Add Product" class="mt-6 w-full bg-yellow-950 text-white py-2.5 px-4 rounded-md hover:bg-amber-900 transition duration-200 font-semibold text-sm">
    </form>
  `;

  container.querySelector('#addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch('http://cs1xd3.cas.mcmaster.ca/~randevv/Justine_Bakes/POS_BACK/php/inventory.php', {
      method: 'POST',
      body: formData
    });
  });

  return container;
}
