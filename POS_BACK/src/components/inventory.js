import { createInventory, removeInventory, updateInventory } from "../services/InventoryRequests";
import { showToast } from "./permissions";

// Critical alert card (mobile wireframe)
function alertCard(product) {
  return `
    <div class="border-l-2 border-red-400 pl-3 flex flex-col gap-0.5">
      <span class="text-[10px] font-bold text-red-500 uppercase flex items-center gap-1">
        <i class="fa-solid fa-triangle-exclamation text-[9px]"></i> Stock Level: ${product.quantity}
      </span>
      <p class="text-sm font-semibold text-stone-800">${product.name}</p>
      <p class="text-[10px] text-stone-400">SKU: ${product.sku ?? '—'}</p>
    </div>
  `;
}

// Single inventory row for desktop list view
function inventoryRow(product, onSelect) {
  const isLow = product.quantity <= 5;
  const tr = document.createElement('tr');
  tr.className = 'border-b border-stone-50 hover:bg-stone-50 transition-colors cursor-pointer';
  tr.innerHTML = `
    <td class="px-6 py-4">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0">
          ${product.image_link
            ? `<img src="${product.image_link}" class="w-full h-full object-cover" />`
            : `<i class="fa-regular fa-image text-stone-300 text-lg flex items-center justify-center w-full h-full"></i>`}
        </div>
        <div>
          <p class="text-sm font-medium text-stone-800">${product.name}</p>
          <p class="text-xs text-stone-400">${product.category} • ${product.unit ?? ''}</p>
        </div>
      </div>
    </td>
    <td class="px-6 py-4">
      <div class="flex items-center gap-2">
        <span class="text-sm font-semibold ${isLow ? 'text-red-500' : 'text-stone-800'}">${product.quantity} ${product.unit ?? 'units'}</span>
        ${isLow ? '<span class="text-[10px] font-bold text-red-500 uppercase">Low Stock</span>' : ''}
      </div>
      <div class="mt-1 h-1 w-24 rounded-full bg-stone-100 overflow-hidden">
        <div class="h-full rounded-full ${isLow ? 'bg-red-400' : 'bg-[#3d1f0f]'}" style="width: ${Math.min((product.quantity / 50) * 100, 100)}%"></div>
      </div>
    </td>
    <td class="px-6 py-4 text-sm text-stone-600">$${parseFloat(product.price).toFixed(2)}</td>
    <td class="px-6 py-4">
      ${isLow
        ? `<span class="text-xs font-bold text-red-500 flex items-center gap-1"><i class="fa-solid fa-triangle-exclamation"></i> REFILL</span>`
        : `<button class="delete-btn text-stone-400 hover:text-stone-700 p-1"><i class="fa-solid fa-trash"></i></button>`}
    </td>
  `;
  const deleteBtn = tr.querySelector('.delete-btn');
if (deleteBtn) {
  deleteBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevents the row's 'onSelect' (edit) from triggering
    
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      // Use the ID from your product object
      const idToDelete = product.product_id;
      
      removeInventory(idToDelete);
      
      // Update UI feedback
      showToast(`${product.name} removed from inventory`, "success"); //
      window.router.go('inventory', null, true); // Refresh the view
    }
  });
}

// Row selection for editing
tr.addEventListener('click', () => onSelect(product));
  return tr;
}

// Mobile card for inventory
function inventoryCard(product, onSelect) {
  const isLow = product.quantity <= 5;
  const card = document.createElement('div');
  card.className = 'flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-100 hover:shadow-sm transition-shadow cursor-pointer';
  card.innerHTML = `
    <div class="w-14 h-14 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
      ${product.image_link
        ? `<img src="${product.image_link}" class="w-full h-full object-cover" />`
        : `<i class="fa-regular fa-image text-stone-300 text-xl"></i>`}
    </div>
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-stone-800 truncate">${product.name}</p>
      <p class="text-xs text-stone-400">${product.category} • ${product.unit ?? ''}</p>
      <div class="mt-1.5 h-1 w-full rounded-full bg-stone-100 overflow-hidden">
        <div class="h-full rounded-full ${isLow ? 'bg-red-400' : 'bg-[#3d1f0f]'}" style="width: ${Math.min((product.quantity / 50) * 100, 100)}%"></div>
      </div>
    </div>
    <div class="text-right flex-shrink-0">
      <p class="text-sm font-bold ${isLow ? 'text-red-500' : 'text-stone-800'}">${product.quantity} ${product.unit ?? 'units'}</p>
      ${isLow
        ? `<span class="text-[10px] font-bold text-red-500 uppercase">Restock<br>Soon</span>`
        : `<span class="text-[10px] text-stone-400 uppercase">In Stock</span>`}
    </div>
  `;
  card.addEventListener('click', () => onSelect(product));
  return card;
}

export function buildInventoryPage(products, container, onCardSelected) {
  container.innerHTML = '';

  const lowStock = products.filter(p => p.quantity <= 5);

  // Critical alerts banner (shown if any low stock)
  if (lowStock.length > 0) {
    const alertBanner = document.createElement('div');
    alertBanner.className = 'bg-white rounded-xl border border-red-100 p-4 mb-4';
    alertBanner.innerHTML = `
      <div class="flex items-center justify-between mb-3">
        <span class="text-xs font-bold text-stone-500 uppercase tracking-wider">Critical Alerts</span>
        <span class="text-xs font-bold text-red-500">${lowStock.length} Items Low</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${lowStock.map(alertCard).join('')}
      </div>
    `;
    container.append(alertBanner);
  }

  // Category filter pills
  const categories = ['All Items', ...new Set(products.map(p => p.category).filter(Boolean))];
  let activeCategory = 'All Items';

  const pillBar = document.createElement('div');
  pillBar.className = 'flex gap-2 flex-wrap mb-4';
  const renderPills = () => {
    pillBar.innerHTML = '';
    categories.forEach(cat => {
      const pill = document.createElement('button');
      const isActive = cat === activeCategory;
      pill.className = `px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${isActive ? 'bg-[#3d1f0f] text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'}`;
      pill.textContent = cat;
      pill.addEventListener('click', () => {
        activeCategory = cat;
        renderPills();
        renderProducts();
      });
      pillBar.append(pill);
    });
  };
  renderPills();
  container.append(pillBar);

  // Mobile list / desktop table wrapper
  const productArea = document.createElement('div');
  container.append(productArea);

  const renderProducts = () => {
    productArea.innerHTML = '';
    const filtered = activeCategory === 'All Items'
      ? products
      : products.filter(p => p.category === activeCategory);

    // Mobile list
    const mobileList = document.createElement('div');
    mobileList.className = 'flex flex-col gap-3 md:hidden';
    filtered.forEach(p => mobileList.append(inventoryCard(p, onCardSelected)));
    productArea.append(mobileList);

    // Desktop table
    const tableWrap = document.createElement('div');
    tableWrap.className = 'hidden md:block bg-white rounded-xl border border-stone-100 overflow-hidden';
    tableWrap.innerHTML = `
      <div class="flex items-center justify-between px-6 py-4 border-b border-stone-50">
        <span class="text-xs font-bold text-stone-400 uppercase tracking-wider">All Products</span>
        <span class="text-xs text-stone-400">Showing ${filtered.length} items</span>
      </div>
      <table class="w-full text-left">
        <thead>
          <tr class="bg-stone-50 border-b border-stone-100">
            <th class="px-6 py-3 text-xs font-bold text-stone-400 uppercase">Product</th>
            <th class="px-6 py-3 text-xs font-bold text-stone-400 uppercase">Stock</th>
            <th class="px-6 py-3 text-xs font-bold text-stone-400 uppercase">Price</th>
            <th class="px-6 py-3 text-xs font-bold text-stone-400 uppercase"></th>
          </tr>
        </thead>
        <tbody id="inv-table-body"></tbody>
      </table>
    `;
    const tbody = tableWrap.querySelector('#inv-table-body');
    filtered.forEach(p => tbody.append(inventoryRow(p, onCardSelected)));
    productArea.append(tableWrap);
  };
  renderProducts();
}

export function createItemsPage() {
  const container = document.createElement('div');
  container.className = "min-h-screen bg-stone-100 p-6 flex w-full justify-center items-center";
  container.innerHTML = `
    <form class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-stone-200" id="addProductForm">
      <h2 class="text-2xl font-bold text-yellow-950 mb-1">Add Product</h2>
      <p class="text-stone-600 mb-6">Enter product details below.</p>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-amber-900">Name</label>
          <input type="text" name="name" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2.5 border" placeholder="Product Name">
        </div>
        <div>
          <label class="block text-sm font-medium text-amber-900">Price</label>
          <input type="number" step="0.01" name="price" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2.5 border" placeholder="Price">
        </div>
        <div>
          <label class="block text-sm font-medium text-amber-900">Quantity</label>
          <input type="number" step="1" name="quantity" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2.5 border" placeholder="Quantity">
        </div>
        <div>
          <label class="block text-sm font-medium text-amber-900">Description</label>
          <input type="text" name="description" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2.5 border" placeholder="Description">
        </div>
        <div>
          <label class="block text-sm font-medium text-amber-900">Category</label>
          <input type="text" name="category" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-sm p-2.5 border" placeholder="Category">
        </div>
        <div>
          <label class="block text-sm font-medium text-amber-900">Image</label>
          <input type="file" name="fileToUpload" id="fileToUpload" class="mt-1 block w-full rounded-md border-stone-300 shadow-sm text-sm p-2.5 border">
        </div>
      </div>
      <input type="submit" value="Add Product" class="mt-6 w-full bg-yellow-950 text-white py-2.5 px-4 rounded-md hover:bg-amber-900 transition duration-200 font-semibold text-sm">
    </form>
  `;
  container.querySelector('#addProductForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createInventory(formData);
  });
  return container;
}

export function editItemPage(product) {
  const container = document.createElement('div');
  container.className = "min-h-screen bg-stone-100 p-6 flex w-full justify-center items-center";
  container.innerHTML = `
    <div class="bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden w-full max-w-2xl flex flex-col md:flex-row">
      <div class="w-full md:w-2/5 bg-stone-50 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-stone-100">
        <div class="w-full h-48 md:h-64 rounded-lg overflow-hidden bg-white flex items-center justify-center">
          ${product?.image_link
            ? `<img src="${product.image_link}" class="object-cover w-full h-full" id="form-image-preview" />`
            : `<i class="fa-regular fa-image text-4xl text-stone-200" id="form-image-preview"></i>`}
        </div>
        <p class="text-xs text-stone-400 italic mt-3">Image aspect ratio 1:1 recommended</p>
      </div>
      <form class="w-full md:w-3/5 p-8 flex flex-col gap-5" id="editItemForm">
        <div>
          <h2 class="text-xl font-semibold text-stone-800">Edit Product</h2>
          <p class="text-sm text-stone-500">Update the inventory details below.</p>
        </div>
        <div class="space-y-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-stone-600 uppercase">Product Name</label>
            <input type="text" name="name" value="${product?.name ?? ''}" class="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-stone-800 outline-none text-stone-700" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-stone-600 uppercase">Price ($)</label>
              <input type="number" step="0.01" name="price" value="${product?.price ?? ''}" class="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-stone-800 outline-none text-stone-700" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold text-stone-600 uppercase">Stock Units</label>
              <input type="number" name="quantity" value="${product?.quantity ?? ''}" class="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-stone-800 outline-none text-stone-700" />
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-bold text-stone-600 uppercase">Category</label>
            <input type="text" name="category" value="${product?.category ?? ''}" class="w-full px-4 py-2.5 rounded-lg border border-stone-200 focus:ring-2 focus:ring-stone-800 outline-none text-stone-700" />
          </div>
        </div>
        <input type="hidden" name="product_id" value="${product?.product_id ?? ''}">
        <div class="flex gap-3 pt-2">
          <button type="button" onclick="window.router.go('inventory')" class="flex-1 px-4 py-3 rounded-lg border border-stone-200 text-stone-600 font-medium hover:bg-stone-50 transition-colors">
            Cancel
          </button>
          <button type="submit" class="flex-1 px-4 py-3 rounded-lg bg-stone-900 text-white font-medium hover:bg-black transition-all active:scale-95">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  `;
  container.querySelector('#editItemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateInventory(formData);
  });
  return container;
}