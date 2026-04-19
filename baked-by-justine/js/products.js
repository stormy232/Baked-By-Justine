/* ============================================================
   BAKED BY JUSTINE — products.js
   Fetches products from PHP API, renders cards with Add to Cart
   ============================================================ */

const CATEGORY_EMOJI = {
  'breads': '&#127838;',
  'pastries': '&#129360;',
  'cakes': '&#127874;',
  'desserts': '&#127874;',
  'cookies': '&#127850;',
  'treats': '&#127850;',
  'drinks': '&#9749;',
};

function getCategoryEmoji(category) {
  if (!category) return '&#128717;';
  const key = category.toLowerCase().trim();
  for (const [k, v] of Object.entries(CATEGORY_EMOJI)) {
    if (key.includes(k)) return v;
  }
  return '&#128717;';
}

const grid = document.getElementById('productsGrid');
const catTabs = document.getElementById('catTabs');
const searchInput = document.getElementById('searchInput');
const stateLoad = document.getElementById('stateLoading');
const stateEmpty = document.getElementById('stateEmpty');
const stateError = document.getElementById('stateError');
const errorMsg = document.getElementById('errorMsg');

let allProducts = [];
let activeCategory = 'all';
let searchTerm = '';

function showState(state) {
  stateLoad.classList.add('hidden');
  stateEmpty.classList.add('hidden');
  stateError.classList.add('hidden');
  grid.classList.add('hidden');
  if (state === 'loading') stateLoad.classList.remove('hidden');
  if (state === 'empty') stateEmpty.classList.remove('hidden');
  if (state === 'error') stateError.classList.remove('hidden');
  if (state === 'grid') grid.classList.remove('hidden');
}

function buildCard(p) {
  const card = document.createElement('div');
  card.className = 'product-card';
  const isOutOfStock = parseInt(p.quantity) === 0;

  if (p.discount_percent > 0) {
    const badge = document.createElement('div');
    badge.className = 'discount-badge';
    badge.textContent = p.discount_percent + '% OFF';
    card.appendChild(badge);
  }

  if (isOutOfStock) {
    const oos = document.createElement('div');
    oos.className = 'out-of-stock-overlay';
    oos.innerHTML = '<span>Out of Stock</span>';
    card.appendChild(oos);
  }

  const ph = document.createElement('div');
  ph.className = 'product-img-placeholder';
  ph.innerHTML = getCategoryEmoji(p.category);
  card.appendChild(ph);

  const body = document.createElement('div');
  body.className = 'product-card-body';

  if (p.category) {
    const catTag = document.createElement('div');
    catTag.className = 'product-category-tag';
    catTag.textContent = p.category;
    body.appendChild(catTag);
  }

  const name = document.createElement('h3');
  name.className = 'product-name';
  name.textContent = p.name;
  body.appendChild(name);

  if (p.description) {
    const desc = document.createElement('p');
    desc.className = 'product-description';
    desc.textContent = p.description;
    body.appendChild(desc);
  }

  const priceRow = document.createElement('div');
  priceRow.className = 'product-price-row';
  const displayPrice = p.discounted_price !== null ? p.discounted_price : p.price;
  const priceEl = document.createElement('span');
  priceEl.className = 'product-price';
  priceEl.textContent = '$' + parseFloat(displayPrice).toFixed(2);
  priceRow.appendChild(priceEl);
  if (p.discounted_price !== null) {
    const origEl = document.createElement('span');
    origEl.className = 'product-price-original';
    origEl.textContent = '$' + parseFloat(p.price).toFixed(2);
    priceRow.appendChild(origEl);
  }
  body.appendChild(priceRow);

  const footer = document.createElement('div');
  footer.className = 'product-footer';
  const stockEl = document.createElement('span');
  stockEl.className = 'stock-label';
  const qty = parseInt(p.quantity);
  if (qty === 0) {
    stockEl.classList.add('stock-out');
    stockEl.textContent = 'Out of Stock';
  } else if (qty <= 5) {
    stockEl.classList.add('stock-low');
    stockEl.textContent = 'Only ' + qty + ' left';
  } else {
    stockEl.classList.add('stock-in');
    stockEl.textContent = 'In Stock';
  }
  footer.appendChild(stockEl);
  body.appendChild(footer);

  // Add to Cart button
  const addBtn = document.createElement('button');
  addBtn.className = 'add-to-cart-btn';
  addBtn.disabled = isOutOfStock;
  addBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
    ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}`;
  addBtn.addEventListener('click', function () {
    var email = sessionStorage.getItem('bbj_customer_email');
    if (!email || !email.includes('@')) {
      email = prompt('Enter your email to add items to your cart:');
      if (!email.includes('@')) return;
  sessionStorage.setItem('bbj_customer_email', email);
}

var existing = cart.items[p.product_id];
if (existing) {
  existing.qty += 1;
} else {
  cart.items[p.product_id] = {
    product_id: p.product_id,
    name: p.name,
    category: p.category,
    price: parseFloat(p.price),
    discount_percent: parseFloat(p.discount_percent),
    discounted_price: p.discount_percent > 0
      ? Math.round(p.price * (1 - p.discount_percent / 100) * 100) / 100
      : null,
    qty: 1,
    quantity: p.quantity
  };
}
cart.render();
updateCartBadge();

fetch('api/cart.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'add',
    customer_email: email,
    product_id: p.product_id,
    qty: 1
  })
})
  .then(function (res) { return res.json(); })
  .then(function (data) {
    if (data.success) {
      addBtn.textContent = '✓ Added!';
      setTimeout(function () {
        addBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg> Add to Cart`;
      }, 1500);
    } else {
      cart.loadFromDB();
      alert(data.error || 'Could not add item');
    }
  });
});


body.appendChild(addBtn);

card.appendChild(body);
return card;
}

function renderProducts() {
  const term = searchTerm.toLowerCase().trim();
  const filtered = allProducts.filter(p => {
    const matchCat = activeCategory === 'all' ||
      (p.category && p.category.toLowerCase() === activeCategory.toLowerCase());
    const matchSearch = !term ||
      p.name.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term));
    return matchCat && matchSearch;
  });

  grid.innerHTML = '';
  if (filtered.length === 0) { showState('empty'); return; }
  filtered.forEach(p => grid.appendChild(buildCard(p)));
  showState('grid');
}

async function loadCategories() {
  try {

    const res = await fetch('/baked-by-justine/api/categories.php');
    const data = await res.json();
    if (!data.success) return;
    data.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.setAttribute('data-cat', cat);
      btn.textContent = cat;
      catTabs.appendChild(btn);
    });
    catTabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        catTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-cat');
        renderProducts();
      });
    });
  } catch (e) { console.warn('Could not load categories:', e); }
}

async function loadProducts() {
  showState('loading');
  try {

    const res = await fetch('/baked-by-justine/api/products.php');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Unknown error');
    allProducts = data.products;
    renderProducts();
  } catch (e) {
    errorMsg.textContent = e.message || 'Could not reach the server.';
    showState('error');
  }
}

let debounceTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchTerm = searchInput.value;
    renderProducts();
  }, 280);
});

loadCategories();
loadProducts();
