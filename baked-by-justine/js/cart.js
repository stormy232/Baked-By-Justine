/* ============================================================
   BAKED BY JUSTINE — cart.js
   Full shopping cart: add, remove, quantity control, stock check
   ============================================================ */

const cart = {
  items: {},

  add(product) {
    const id = product.product_id;
    var email = sessionStorage.getItem('bbj_customer_email');
    if (!email) {
      showCartToast('Please enter your email first');
      return false;
    }

    fetch('api/cart.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add',
        customer_email: email,
        product_id: id,
        qty: 1
      })
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.success) {
          showCartToast(product.name + ' added to cart!');
          cart.loadFromDB();
        } else {
          showCartToast(data.error || 'Could not add item');
        }
      });

    return true;
  },

  loadFromDB() {
    var email = sessionStorage.getItem('bbj_customer_email');
    if (!email) return;

    fetch('api/cart.php?customer_email=' + encodeURIComponent(email))
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (Array.isArray(data)) {
          cart.items = {};
          data.forEach(function (item) {
            cart.items[item.product_id] = item;
            cart.items[item.product_id].qty = item.qty;
            cart.items[item.product_id].discounted_price = item.discount_percent > 0
              ? Math.round(item.price * (1 - item.discount_percent / 100) * 100) / 100 
              : null;
          });
          cart.render();
          updateCartBadge();
        }
      });
  },


  remove(id) {
    delete this.items[id];
    this.save();
    this.render();
    updateCartBadge();
  },

  // ── DB cart ─────────────────────────────────────────────
  async loadFromDB() {
    try {
      const res  = await fetch('api/cart_db.php?action=get');
      if (res.status === 401) { this.isLoggedIn = false; this.loadFromStorage(); return; }
      const data = await res.json();
      if (data.success) {
        this.items = {};
        data.items.forEach(item => {
          this.items[item.product_id] = {
            product_id:      item.product_id,
            name:            item.name,
            price:           item.price,
            quantity:        item.stock,
            category:        item.category,
            discount_percent:item.discount_percent,
            discounted_price:item.discounted_price,
            qty:             item.qty
          };
        });
      }
    } catch(e) { console.warn('Cart DB load failed', e); }
  },

  // ── localStorage cart ────────────────────────────────────
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('bbj_cart');
      if (saved) this.items = JSON.parse(saved);
    } catch(e) {}
  },

  saveToStorage() {
    try { localStorage.setItem('bbj_cart', JSON.stringify(this.items)); } catch(e) {}
  },

  // ── Add to cart ──────────────────────────────────────────
  async add(product) {
    const id    = product.product_id;
    const stock = parseInt(product.quantity);

    if (this.isLoggedIn) {
      try {
        const res  = await fetch('api/cart_db.php?action=add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: id })
        });
        const data = await res.json();
        if (!data.success) { showCartToast(data.error); return; }
        // Update local state
        if (this.items[id]) {
          this.items[id].qty = data.qty;
        } else {
          this.items[id] = { ...product, qty: 1 };
        }
      } catch(e) { showCartToast('Could not update cart.'); return; }
    } else {
      if (this.items[id]) {
        if (this.items[id].qty >= stock) { showCartToast('Only ' + stock + ' available in stock.'); return; }
        this.items[id].qty++;
      } else {
        this.items[id] = { ...product, qty: 1 };
      }
      this.saveToStorage();
    }

    this.render();
    updateCartBadge();
    showCartToast(product.name + ' added to cart!');
    openCart();
  },

  // ── Remove item ──────────────────────────────────────────
  async remove(id) {
    if (this.isLoggedIn) {
      try {
        await fetch('api/cart_db.php?action=remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: id })
        });
      } catch(e) {}
    }
    delete this.items[id];
    if (!this.isLoggedIn) this.saveToStorage();
    this.render();
    updateCartBadge();
  },

  // ── Increment ────────────────────────────────────────────
  async increment(id) {
    const item  = this.items[id];
    if (!item) return;
    const stock = parseInt(item.quantity);
    if (item.qty >= stock) { showCartToast('Only ' + stock + ' available in stock.'); return; }

    const newQty = item.qty + 1;
    if (this.isLoggedIn) {
      try {
        const res  = await fetch('api/cart_db.php?action=update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: id, qty: newQty })
        });
        const data = await res.json();
        if (!data.success) { showCartToast(data.error); return; }
      } catch(e) { return; }
    }
    item.qty = newQty;
    if (!this.isLoggedIn) this.saveToStorage();
    this.render();
    updateCartBadge();
  },

  // ── Decrement ────────────────────────────────────────────
  async decrement(id) {
    const item = this.items[id];
    if (!item) return;
    if (item.qty <= 1) { this.remove(id); return; }

    const newQty = item.qty - 1;
    if (this.isLoggedIn) {
      try {
        const res  = await fetch('api/cart_db.php?action=update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: id, qty: newQty })
        });
        const data = await res.json();
        if (!data.success) { showCartToast(data.error); return; }
      } catch(e) { return; }
    }
    item.qty = newQty;
    if (!this.isLoggedIn) this.saveToStorage();
    this.render();
    updateCartBadge();
  },

  total() {
    return Object.values(this.items).reduce((sum, item) => {
      const price = item.discounted_price !== null ? parseFloat(item.discounted_price) : parseFloat(item.price);
      return sum + price * item.qty;
    }, 0);
  },

  count() {
    return Object.values(this.items).reduce((sum, item) => sum + item.qty, 0);
  },
  // emptying save and load to integrate with order.html
  save() { },

  load() { },


  // ── Render drawer ────────────────────────────────────────
  render() {
    const list      = document.getElementById('cartList');
    const emptyMsg  = document.getElementById('cartEmpty');
    const footer    = document.getElementById('cartFooter');
    const loginNote = document.getElementById('cartLoginNote');
    if (!list) return;

    // Show login nudge if guest
    if (loginNote) loginNote.style.display = this.isLoggedIn ? 'none' : 'flex';

    const entries = Object.values(this.items);
    if (entries.length === 0) {
      list.innerHTML = '';
      if (emptyMsg) emptyMsg.classList.remove('hidden');
      if (footer)   footer.classList.add('hidden');
      return;
    }

    if (emptyMsg) emptyMsg.classList.add('hidden');
    if (footer)   footer.classList.remove('hidden');

    list.innerHTML = entries.map(item => {
      const price    = item.discounted_price ? parseFloat(item.discounted_price) : parseFloat(item.price);
      const subtotal = (price * item.qty).toFixed(2);
      const stock    = parseInt(item.quantity);
      const atMax    = item.qty >= stock;
      return `
        <div class="cart-item" data-id="${item.product_id}">
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-cat">${item.category || ''}</span>
            <span class="cart-item-price">$${price.toFixed(2)} each</span>
            ${atMax ? '<span class="cart-stock-warn">Max stock reached (' + stock + ')</span>' : ''}
          </div>
          <div class="cart-item-controls">
            <button class="cart-qty-btn" onclick="cart.decrement(${item.product_id})">&#8722;</button>
            <span class="cart-qty">${item.qty}</span>
            <button class="cart-qty-btn ${atMax ? 'disabled' : ''}" onclick="cart.increment(${item.product_id})" ${atMax ? 'disabled' : ''}>&#43;</button>
          </div>
          <div class="cart-item-right">
            <span class="cart-item-subtotal">$${subtotal}</span>
            <button class="cart-remove-btn" onclick="cart.remove(${item.product_id})" aria-label="Remove">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>`;
    }).join('');

    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = '$' + this.total().toFixed(2);
  }
};

// ── Badge ──────────────────────────────────────────────────
function updateCartBadge() {
  const count = cart.count();
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ── Drawer open/close ──────────────────────────────────────
function openCart() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Toast ──────────────────────────────────────────────────
let toastTimer;
function showCartToast(msg) {
  const t = document.getElementById('cartToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Inject HTML ────────────────────────────────────────────
function injectCartHTML() {
  document.body.insertAdjacentHTML('beforeend', `
    <div id="cartOverlay" onclick="closeCart()"></div>
    <div id="cartDrawer">
      <div class="cart-header">
        <h2>Your Cart</h2>
        <button class="cart-close-btn" onclick="closeCart()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div id="cartLoginNote" class="cart-login-note" style="display:none">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>
          <a href="#" onclick="openAuthModal('login'); closeCart();">Sign in</a>
          to save your cart across devices.
        </span>
      </div>
      <div id="cartEmpty" class="cart-empty">
        <span>&#129360;</span>
        <p>Your cart is empty.</p>
        <small>Add something delicious!</small>
      </div>
      <div id="cartList" class="cart-list"></div>
      <div id="cartFooter" class="cart-footer hidden">
        <div class="cart-total-row">
          <span>Total</span>
          <span id="cartTotal">$0.00</span>
        </div>
        <a href="https://cs1xd3.cas.mcmaster.ca/~moalimr/Baked-By-Justine/StorefrontV2/order.html"
           class="btn btn-primary cart-checkout-btn">
          Proceed to Checkout
        </a>
      </div>
    </div>
    <div id="cartToast"></div>
  `);
}

// ── Inject cart icon into nav ──────────────────────────────
function injectCartIcon() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;
  const li = document.createElement('li');
  li.innerHTML = `
    <button class="cart-icon-btn" onclick="openCart()" aria-label="Open cart">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      <span class="cart-badge" style="display:none">0</span>
    </button>`;
  navLinks.appendChild(li);
}

// ── Merge guest cart into DB on login ─────────────────────
async function mergeGuestCartToDB() {
  const saved = localStorage.getItem('bbj_cart');
  if (!saved) return;
  try {
    const guestItems = JSON.parse(saved);
    for (const item of Object.values(guestItems)) {
      for (let i = 0; i < item.qty; i++) {
        await fetch('api/cart_db.php?action=add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: item.product_id })
        });
      }
    }
    localStorage.removeItem('bbj_cart');
  } catch(e) {}
}

// ── Boot ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {


  injectCartHTML();
  cart.loadFromDB()
  injectCartIcon();
  updateCartBadge();
  cart.render();
});
