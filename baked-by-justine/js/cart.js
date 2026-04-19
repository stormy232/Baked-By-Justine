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

  increment(id) {
    const item = this.items[id];
    if (!item) return;
    const stock = parseInt(item.quantity);
    if (item.qty >= stock) {
      showCartToast(`Only ${stock} available in stock.`);
      return;
    }
    item.qty++;
    this.save();
    this.render();
    updateCartBadge();
  },

  decrement(id) {
    const item = this.items[id];
    if (!item) return;
    if (item.qty <= 1) {
      this.remove(id);
      return;
    }
    item.qty--;
    this.save();
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

  render() {
    const list = document.getElementById('cartList');
    const emptyMsg = document.getElementById('cartEmpty');
    const footer = document.getElementById('cartFooter');
    if (!list) return;

    const entries = Object.values(this.items);

    if (entries.length === 0) {
      list.innerHTML = '';
      if (emptyMsg) emptyMsg.classList.remove('hidden');
      if (footer) footer.classList.add('hidden');
      return;
    }

    if (emptyMsg) emptyMsg.classList.add('hidden');
    if (footer) footer.classList.remove('hidden');

    list.innerHTML = entries.map(item => {
      const price = item.discounted_price !== null ? parseFloat(item.discounted_price) : parseFloat(item.price);
      const subtotal = (price * item.qty).toFixed(2);
      const stock = parseInt(item.quantity);
      const atMax = item.qty >= stock;
      return `
        <div class="cart-item" data-id="${item.product_id}">
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-cat">${item.category || ''}</span>
            <span class="cart-item-price">$${price.toFixed(2)} each</span>
            ${atMax ? `<span class="cart-stock-warn">Max stock reached (${stock})</span>` : ''}
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
    if (totalEl) totalEl.textContent = `$${this.total().toFixed(2)}`;
  }
};

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const count = cart.count();
  badges.forEach(b => {
    b.textContent = count;
    b.style.display = count > 0 ? 'flex' : 'none';
  });
}

function openCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  const drawer = document.getElementById('cartDrawer');
  const overlay = document.getElementById('cartOverlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

let toastTimer;
function showCartToast(msg) {
  let toast = document.getElementById('cartToast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

function injectCartHTML() {
  const html = `
  <!-- Cart overlay -->
  <div id="cartOverlay" onclick="closeCart()"></div>

  <!-- Cart drawer -->
  <div id="cartDrawer">
    <div class="cart-header">
      <h2>Your Cart</h2>
      <button class="cart-close-btn" onclick="closeCart()" aria-label="Close cart">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
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
      <a href="order.html" class="btn btn-primary cart-checkout-btn" class="btn btn-primary cart-checkout-btn">
        Proceed to Checkout
      </a>
    </div>
  </div>

  <!-- Toast notification -->
  <div id="cartToast"></div>
  `;
  document.body.insertAdjacentHTML('beforeend', html);
}

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

document.addEventListener('DOMContentLoaded', () => {
  injectCartHTML();
  cart.loadFromDB()
  injectCartIcon();
  updateCartBadge();
  cart.render();
});
