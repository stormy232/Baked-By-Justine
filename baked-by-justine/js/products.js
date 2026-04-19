/* ============================================================
   BAKED BY JUSTINE — products.js
   Fetches products from PHP API, renders cards with real images
   ============================================================ */

// Real food photos per product name (Unsplash free-to-use)
const PRODUCT_IMAGES = {
  // Breads
  'classic sourdough':        'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=80',
  'rustic baguette':          'https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=400&q=80',
  'rosemary focaccia':        'https://images.unsplash.com/photo-1focaccia?w=400&q=80',
  'multigrain loaf':          'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  'cheddar':                  'https://images.unsplash.com/photo-1585478259715-4f7dc8751968?w=400&q=80',
  'rye bread':                'https://images.unsplash.com/photo-1574085733277-851d9d856a3a?w=400&q=80',
  // Pastries
  'butter croissant':         'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
  'almond croissant':         'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400&q=80',
  'pain au chocolat':         'https://images.unsplash.com/photo-1623334044303-241021148842?w=400&q=80',
  'danish':                   'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80',
  'cinnamon roll':            'https://images.unsplash.com/photo-1609428456270-cefaf1f6b58d?w=400&q=80',
  'ham':                      'https://images.unsplash.com/photo-1620921592187-26196f3e2a6c?w=400&q=80',
  // Cakes & Desserts
  'vanilla layer cake':       'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80',
  'dark chocolate torte':     'https://images.unsplash.com/photo-1606890658317-7d14490b76fd?w=400&q=80',
  'lemon tart':               'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=400&q=80',
  'chocolate éclair':         'https://images.unsplash.com/photo-1612203985729-70726954388c?w=400&q=80',
  'eclair':                   'https://images.unsplash.com/photo-1612203985729-70726954388c?w=400&q=80',
  'tiramisu':                 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80',
  'custom celebration cake':  'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=400&q=80',
  // Cookies
  'chocolate chip cookie':    'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80',
  'french macaron':           'https://images.unsplash.com/photo-1558326567-98ae2405596b?w=400&q=80',
  'shortbread':               'https://images.unsplash.com/photo-1612809078213-4d175e7c6b7c?w=400&q=80',
  'oat':                      'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&q=80',
  'brownie':                  'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80',
  'mixed cookie box':         'https://images.unsplash.com/photo-1548365328-8c6db3220e4c?w=400&q=80',
  // Drinks
  'espresso':                 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80',
  'flat white':               'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&q=80',
  'latte':                    'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&q=80',
  'drip coffee':              'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400&q=80',
  'chai latte':               'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=400&q=80',
  'hot chocolate':            'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400&q=80',
};

// Category fallback images
const CATEGORY_IMAGES = {
  'breads':   'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
  'pastries': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80',
  'cakes':    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80',
  'cookies':  'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80',
  'drinks':   'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&q=80',
};

function getProductImage(name, category, dbImageLink) {
  // 1. Use DB image if set
  if (dbImageLink) return dbImageLink;

  // 2. Match by product name keywords
  const lower = (name || '').toLowerCase();
  for (const [key, url] of Object.entries(PRODUCT_IMAGES)) {
    if (lower.includes(key)) return url;
  }

  // 3. Category fallback
  const cat = (category || '').toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
    if (cat.includes(key)) return url;
  }

  // 4 Generic bakery fallback
  return 'https://images.unsplash.com/photo-1464195244916-405fa0a82545?w=400&q=80';
}

const grid = document.getElementById('productsGrid');
const catTabs = document.getElementById('catTabs');
const searchInput = document.getElementById('searchInput');
const stateLoad = document.getElementById('stateLoading');
const stateEmpty = document.getElementById('stateEmpty');
const stateError = document.getElementById('stateError');
const errorMsg = document.getElementById('errorMsg');

let allProducts    = [];
let activeCategory = 'all';
let searchTerm     = '';

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

  // Out of stock overlay
  if (isOutOfStock) {
    const oos = document.createElement('div');
    oos.className = 'out-of-stock-overlay';
    oos.innerHTML = '<span>Out of Stock</span>';
    card.appendChild(oos);
  }

  // Product image
  const imgUrl = getProductImage(p.name, p.category, p.image_link);
  const img = document.createElement('img');
  img.className = 'product-img';
  img.src = imgUrl;
  img.alt = p.name;
  img.loading = 'lazy';
  img.onerror = () => {
    // fallback to category image on error
    const fallback = CATEGORY_IMAGES[(p.category || '').toLowerCase()] ||
      'https://images.unsplash.com/photo-1464195244916-405fa0a82545?w=400&q=80';
    if (img.src !== fallback) img.src = fallback;
  };
  card.appendChild(img);

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

  // Stock label
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
    const res  = await fetch('api/products.php');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Unknown error');
    allProducts = data.products;
    renderProducts();
  } catch(e) {
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
