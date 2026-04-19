function InventoryCard(Title, Image, Price, Units, Category, onClick) {
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
  wrapper.addEventListener("click", () => onClick());
  return wrapper;
}

export function buildInventoryCards(products, containerSelector, onCardSelected) {
  const container = document.querySelector(containerSelector);
  container.innerHTML = '';
  products.forEach(p => {
    const imageUrl = p.image_link ? `${p.image_link}` : null;
    const card = InventoryCard(
      p.name, 
      imageUrl, 
      p.price, 
      p.quantity, 
      p.category, 
      () => onCardSelected(p)
    );
    container.appendChild(card);
  });
}

export function createItemsPage(product) {
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

export function editItemPage(Title, Image, Price, Category){
  //Form Values Need to be Changed But we will get back to this
  const container = document.createElement('div');
  container.className = "bg-white rounded-xl shadow-2xl border border-stone-100 overflow-hidden w-full max-w-2xl flex flex-col md:flex-row transition-all duration-300";
  container.innerHTML = `<div class="w-full md:w-2/5 bg-stone-50 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-stone-100">
    <div class="w-full h-48 md:h-64 rounded-lg overflow-hidden shadow-inner bg-white flex items-center justify-center">
      <img src="https://via.placeholder.com/300" alt="Product Preview" class="object-cover w-full h-full" id="form-image-preview">
    </div>
    <div class="mt-4 text-center">
      <span class="text-xs font-bold uppercase tracking-wider text-stone-400">Current Preview</span>
      <p class="text-sm text-stone-500 italic mt-1">Image aspect ratio 1:1 recommended</p>
    </div>
  </div>

  <form class="w-full md:w-3/5 p-8 flex flex-col gap-5" id="editItemPage">
    <div>
      <h2 class="text-xl font-semibold text-stone-800">Edit Product</h2>
      <p class="text-sm text-stone-500">Update the inventory details below.</p>
    </div>

    <div class="space-y-4">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-bold text-stone-600 uppercase">Product Name</label>
        <input type="text" value="Gourmet Sourdough Bread" 
          class="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none transition-all text-stone-700 shadow-sm" />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-stone-600 uppercase">Price ($)</label>
          <input type="number" step="0.01" value="12.50" 
            class="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none transition-all text-stone-700 shadow-sm" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold text-stone-600 uppercase">Stock Units</label>
          <input type="number" value="24" 
            class="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none transition-all text-stone-700 shadow-sm" />
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-bold text-stone-600 uppercase">Category</label>
        <select class="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-stone-800 focus:border-transparent outline-none transition-all text-stone-700 bg-white shadow-sm appearance-none">
          <option>Bakery</option>
          <option>Dairy</option>
          <option>Produce</option>
        </select>
      </div>
    </div>

    <div class="flex gap-3 pt-4 mt-auto">
      <button type="button" class="flex-1 px-4 py-3 rounded-lg border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors">
        Cancel
      </button>
      <button type="submit" class="flex-1 px-4 py-3 rounded-lg bg-stone-900 text-white font-medium hover:bg-black shadow-lg shadow-stone-200 transition-all active:scale-95">
        Save Changes
      </button>
    </div>
  </form>
</div>`;

  container.querySelector('#editItemPage').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    //This Link may have to be changed
    await fetch('http://cs1xd3.cas.mcmaster.ca/~randevv/Justine_Bakes/POS_BACK/php/inventory.php', {
      method: 'PUT',
      body: formData
    });
  });
}
