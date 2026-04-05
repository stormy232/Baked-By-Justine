/* ============================================================
   BAKED BY JUSTINE — products.js
   Fetches products + categories from the PHP API,
   renders product cards, and handles category + search filtering.
   ============================================================ */

// ── Emoji fallbacks per category (shown when no image_link in DB)
const CATEGORY_EMOJI = {
  'breads':   '🍞',
  'pastries': '🥐',
  'cakes':    '🎂',
  'desserts': '🎂',
  'cookies':  '🍪',
  'treats':   '🍪',
  'drinks':   '☕',
};

function getCategoryEmoji(category) {
  if (!category) return '🛍️';
  const key = category.toLowerCase().trim();
  for (const [k, v] of Object.entries(CATEGORY_EMOJI)) {
    if (key.includes(k)) return v;
  }
  return '🛍️';
}

// ── DOM refs
const grid        = document.getElementById('productsGrid');
const catTabs     = document.getElementById('catTabs');
const searchInput = document.getElementById('searchInput');
const stateLoad   = document.getElementById('stateLoading');
const stateEmpty  = document.getElementById('stateEmpty');
const stateError  = document.getElementById('stateError');
const errorMsg    = document.getElementById('errorMsg');

// ── State
let allProducts  = [];
let activeCategory = 'all';
let searchTerm   = '';

// ── Show / hide UI states
function showState(state) {
  stateLoad.classList.add('hidden');
  stateEmpty.classList.add('hidden');
  stateError.classList.add('hidden');
  grid.classList.add('hidden');

  if (state === 'loading') stateLoad.classList.remove('hidden');
  if (state === 'empty')   stateEmpty.classList.remove('hidden');
  if (state === 'error')   stateError.classList.remove('hidden');
  if (state === 'grid')    grid.classList.remove('hidden');
}

// ── Build a single product card
function buildCard(p) {
  const card = document.createElement('div');
  card.className = 'product-card';

  // Discount badge
  if (p.discount_percent > 0) {
    const badge = document.createElement('div');
    badge.className = 'discount-badge';
    badge.textContent = `${p.discount_percent}% OFF`;
    card.appendChild(badge);
  }

  // Out of stock overlay
  if (p.quantity === 0) {
    const oos = document.createElement('div');
    oos.className = 'out-of-stock-overlay';
    oos.innerHTML = '<span>Out of Stock</span>';
    card.appendChild(oos);
  }

  // Image or emoji placeholder
  if (p.image_link) {
    const img = document.createElement('img');
    img.className = 'product-img';
    img.src = p.image_link;
    img.alt = p.name;
    img.loading = 'lazy';
    // Fallback if image fails to load
    img.onerror = () => {
      img.replaceWith(makePlaceholder(p.category));
    };
    card.appendChild(img);
  } else {
    card.appendChild(makePlaceholder(p.category));
  }

  // Card body
  const body = document.createElement('div');
  body.className = 'product-card-body';

  // Category label
  if (p.category) {
    const catTag = document.createElement('div');
    catTag.className = 'product-category-tag';
    catTag.textContent = p.category;
    body.appendChild(catTag);
  }

  // Name
  const name = document.createElement('h3');
  name.className = 'product-name';
  name.textContent = p.name;
  body.appendChild(name);

  // Description
  if (p.description) {
    const desc = document.createElement('p');
    desc.className = 'product-description';
    desc.textContent = p.description;
    body.appendChild(desc);
  }

  // Price row
  const priceRow = document.createElement('div');
  priceRow.className = 'product-price-row';

  const displayPrice = p.discounted_price !== null ? p.discounted_price : p.price;
  const priceEl = document.createElement('span');
  priceEl.className = 'product-price';
  priceEl.textContent = `$${parseFloat(displayPrice).toFixed(2)}`;
  priceRow.appendChild(priceEl);

  if (p.discounted_price !== null) {
    const origEl = document.createElement('span');
    origEl.className = 'product-price-original';
    origEl.textContent = `$${parseFloat(p.price).toFixed(2)}`;
    priceRow.appendChild(origEl);
  }

  body.appendChild(priceRow);

  // Footer: stock status
  const footer = document.createElement('div');
  footer.className = 'product-footer';

  const stockEl = document.createElement('span');
  stockEl.className = 'stock-label';
  if (p.quantity === 0) {
    stockEl.classList.add('stock-out');
    stockEl.textContent = 'Out of Stock';
  } else if (p.quantity <= 5) {
    stockEl.classList.add('stock-low');
    stockEl.textContent = `Only ${p.quantity} left`;
  } else {
    stockEl.classList.add('stock-in');
    stockEl.textContent = 'In Stock';
  }
  footer.appendChild(stockEl);

  body.appendChild(footer);
  card.appendChild(body);

  return card;
}

function makePlaceholder(category) {
  const ph = document.createElement('div');
  ph.className = 'product-img-placeholder';
  ph.textContent = getCategoryEmoji(category);
  return ph;
}

// ── Filter + render
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

  if (filtered.length === 0) {
    showState('empty');
    return;
  }

  filtered.forEach(p => grid.appendChild(buildCard(p)));
  showState('grid');
}

// ── Load categories from API and build tab buttons
async function loadCategories() {
  try {
    const res  = await fetch('api/categories.php');
    const data = await res.json();
    if (!data.success) return;

    data.categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn';
      btn.setAttribute('data-cat', cat);
      btn.textContent = cat;
      catTabs.appendChild(btn);
    });

    // Attach click handlers to all tabs (including the "All" button already in HTML)
    catTabs.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        catTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.getAttribute('data-cat');
        renderProducts();
      });
    });

  } catch (e) {
    // Non-critical — tabs just won't populate, search still works
    console.warn('Could not load categories:', e);
  }
}

// ── Load all products from API
async function loadProducts() {
  showState('loading');
  try {
    const res  = await fetch('api/products.php');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (!data.success) throw new Error(data.error || 'Unknown error');

    allProducts = data.products;
    renderProducts();

  } catch (e) {
    errorMsg.textContent = e.message || 'Could not reach the server. Make sure PHP is running.';
    showState('error');
  }
}

// ── Search input with debounce
let debounceTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    searchTerm = searchInput.value;
    renderProducts();
  }, 280);
});

// ── Init
loadCategories();
loadProducts();
