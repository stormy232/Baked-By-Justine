export function userCard(userName, userRole, userImage = null, onClick) {
  const card = document.createElement('div');
  card.className = 'flex items-center gap-4 p-4 bg-white rounded-xl border border-stone-100 hover:shadow-md transition-shadow cursor-pointer';
  
  card.innerHTML = `
    <div class="w-12 h-12 rounded-full bg-stone-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-stone-50">
      ${userImage 
        ? `<img src="${userImage}" class="w-full h-full object-cover" />`
        : `<i class="fa-solid fa-user text-stone-300 text-lg"></i>`
      }
    </div>

    <div class="flex flex-col gap-0.5 flex-1">
      <div class="flex justify-between items-center">
        <span class="font-medium text-sm text-stone-800">${userName}</span>
        <span class="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md bg-stone-50 text-stone-500 border border-stone-100">
          ${userRole}
        </span>
      </div>
      <span class="text-xs text-stone-400">View profile & activity</span>
    </div>

    <i class="fa-solid fa-chevron-right text-[10px] text-stone-300 px-2"></i>
  `;
  return card;
}
export function createUserCards(containerSelector, data, onclick) {
  const container = document.querySelector(containerSelector);
            data.users.forEach(order => {
                const card = userCard(
                    `Order #${user.user_name}`, 
                    `User ${user.privilege}`, 
                     () => onclick(user);
                );
                container.append(card);
            });
        }

export function createUserPage(product) {
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
