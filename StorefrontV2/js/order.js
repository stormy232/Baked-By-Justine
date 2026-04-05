/**
 * order.js
 * All logic for order.html:
 *  - render product list (after API loads)
 *  - qty stepper interactions
 *  - live sidebar summary
 *  - form validation
 *  - POST order to /api/submit_order.php → navigate to confirm.html
 *
 * Depends on: products.js, cart.js
 */

'use strict';

// ── chosen prep time ──
let prepTime = '20-30 minutes';

// ─────────────────────────────────────────
// RENDER PRODUCT LIST
// ─────────────────────────────────────────
function renderProducts() {
  const list = document.getElementById('prodList');
  if (!list) return;

  list.innerHTML = PRODUCTS.map(p => {
    const isOut = p.quantity === 0;
    const isLow = !isOut && p.quantity <= 3;
    const final = getDiscountedPrice(p);
    const saved = p.discount_percent > 0;
    const qty   = Cart.getQty(p.product_id);

    const tags = [];
    if (isOut)      tags.push(`<span class="tag tag-out">Sold out</span>`);
    else if (isLow) tags.push(`<span class="tag tag-low">Only ${p.quantity} left</span>`);
    if (saved)      tags.push(`<span class="tag tag-sale">${p.discount_percent}% off</span>`);

    const thumb = `<div class="prod-thumb">${p.emoji}</div>`;

    return `
      <div class="prod-row${isOut ? ' out-of-stock' : ''}${qty > 0 ? ' in-cart' : ''}"
           id="row-${p.product_id}">
        ${thumb}
        <div class="prod-info">
          <div class="prod-cat">${p.category}</div>
          <div class="prod-name">${p.name}</div>
          <div class="prod-desc">${p.description}</div>
          ${tags.length ? `<div class="prod-tags">${tags.join('')}</div>` : ''}
        </div>
        <div class="prod-right">
          <div class="prod-price">
            $${final.toFixed(2)}
            ${saved ? `<span class="prod-orig">$${p.price.toFixed(2)}</span>` : ''}
          </div>
          <div class="stepper">
            <button class="stepper-btn"
                    id="minus-${p.product_id}"
                    onclick="adjustQty(${p.product_id}, -1)"
                    ${qty === 0 ? 'disabled' : ''}>−</button>
            <div class="stepper-val" id="qty-${p.product_id}">${qty}</div>
            <button class="stepper-btn"
                    id="plus-${p.product_id}"
                    onclick="adjustQty(${p.product_id}, 1)"
                    ${isOut ? 'disabled' : ''}>+</button>
          </div>
        </div>
      </div>`;
  }).join('');
}

// 
// QTY STEPPER
// 
function adjustQty(productId, delta) {
  const p = PRODUCTS.find(x => x.product_id === productId);
  if (!p || p.quantity === 0) return;

  let ok;
  if (delta > 0) {
    ok = Cart.increment(productId, p.quantity);
    if (!ok) { showToast(`Only ${p.quantity} available`); return; }
  } else {
    ok = Cart.decrement(productId);
    if (!ok) return;
  }

  const qty = Cart.getQty(productId);

  document.getElementById(`qty-${productId}`).textContent = qty;
  document.getElementById(`minus-${productId}`).disabled  = (qty === 0);
  document.getElementById(`plus-${productId}`).disabled   = (qty >= p.quantity);

  document.getElementById(`row-${productId}`)
          .classList.toggle('in-cart', qty > 0);

  document.getElementById('prodErr').classList.remove('show');

  refreshSummary();

  if (delta > 0 && qty === 1) showToast(`${p.emoji} ${p.name} added`);
}

// 
// SUMMARY SIDEBAR
// 
function refreshSummary() {
  const keys       = Cart.keys();
  const emptyEl    = document.getElementById('summaryEmpty');
  const itemsEl    = document.getElementById('summaryItems');
  const sepEl      = document.getElementById('summarySep');
  const totalRowEl = document.getElementById('summaryTotalRow');
  const badge      = document.getElementById('cartBadge');

  if (badge) badge.textContent = Cart.totalQty();

  if (keys.length === 0) {
    emptyEl.style.display    = 'block';
    itemsEl.style.display    = 'none';
    sepEl.style.display      = 'none';
    totalRowEl.style.display = 'none';
    return;
  }

  emptyEl.style.display    = 'none';
  itemsEl.style.display    = 'block';
  sepEl.style.display      = 'block';
  totalRowEl.style.display = 'flex';

  itemsEl.innerHTML = keys.map(k => {
    const p     = PRODUCTS.find(x => x.product_id === k);
    const final = getDiscountedPrice(p);
    const qty   = Cart.getQty(k);
    const sub   = final * qty;
    return `
      <div class="summary-item">
        <div>
          <div class="si-name">${p.emoji} ${p.name}</div>
          <div class="si-qty">×${qty} @ $${final.toFixed(2)}</div>
        </div>
        <div class="si-price">$${sub.toFixed(2)}</div>
      </div>`;
  }).join('');

  document.getElementById('summaryTotal').textContent =
    '$' + Cart.totalPrice(PRODUCTS).toFixed(2);
}

// ─────────────────────────────────────────
// PREP TIME SELECTION
// ─────────────────────────────────────────
function pickTime(el, val) {
  document.querySelectorAll('.time-opt').forEach(t => t.classList.remove('on'));
  el.classList.add('on');
  prepTime = val;
}

// ─────────────────────────────────────────
// FORM VALIDATION
// ─────────────────────────────────────────
function validate() {
  let ok = true;

  if (Cart.isEmpty()) {
    document.getElementById('prodErr').classList.add('show');
    ok = false;
  } else {
    document.getElementById('prodErr').classList.remove('show');
  }

  const fn = document.getElementById('firstName').value.trim();
  if (!fn) {
    document.getElementById('firstName').classList.add('err');
    document.getElementById('firstNameErr').classList.add('show');
    ok = false;
  } else {
    document.getElementById('firstName').classList.remove('err');
    document.getElementById('firstNameErr').classList.remove('show');
  }

  const em = document.getElementById('email').value.trim();
  if (!em || !em.includes('@')) {
    document.getElementById('email').classList.add('err');
    document.getElementById('emailErr').classList.add('show');
    ok = false;
  } else {
    document.getElementById('email').classList.remove('err');
    document.getElementById('emailErr').classList.remove('show');
  }

  const uid = document.getElementById('userId').value.trim();
  if (!uid || isNaN(uid) || parseInt(uid) < 1) {
    document.getElementById('userId').classList.add('err');
    document.getElementById('userIdErr').classList.add('show');
    ok = false;
  } else {
    document.getElementById('userId').classList.remove('err');
    document.getElementById('userIdErr').classList.remove('show');
  }

  return ok;
}

// ─────────────────────────────────────────
// SUBMIT ORDER  ←  NOW POSTS TO PHP API
// ─────────────────────────────────────────
async function submitOrder() {
  document.getElementById('topAlert').classList.remove('show');

  if (!validate()) {
    document.getElementById('topAlert').classList.add('show');
    document.getElementById('topAlertMsg').textContent =
      'Please fill in all required fields and select at least one item.';
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  const fn    = document.getElementById('firstName').value.trim();
  const ln    = document.getElementById('lastName').value.trim();
  const em    = document.getElementById('email').value.trim();
  const uid   = parseInt(document.getElementById('userId').value.trim(), 10);
  const notes = document.getElementById('notes').value.trim();

  // Disable button & show loading state
  const btn = document.getElementById('submitBtn');
  btn.disabled    = true;
  btn.textContent = 'Placing order…';

  // Build request payload
  const payload = {
    user_id:       uid,
    est_prep_time: prepTime,
    items: Cart.keys().map(k => ({ product_id: k, qty: Cart.getQty(k) })),
  };

  try {
    const res  = await fetch('api/submit_order.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || `Server returned ${res.status}`);
    }

    // Build confirmation payload for the confirm page
    const confirmPayload = {
      customer:   { firstName: fn, lastName: ln, email: em, userId: uid, notes },
      cartItems:  Cart.keys().map(k => {
        const p = PRODUCTS.find(x => x.product_id === k);
        return {
          product_id: k,
          name:       p.name,
          emoji:      p.emoji,
          qty:        Cart.getQty(k),
          unitPrice:  getDiscountedPrice(p),
          subtotal:   getDiscountedPrice(p) * Cart.getQty(k),
        };
      }),
      prepTime,
      total:        Cart.totalPrice(PRODUCTS),
      submittedAt:  data.created_at || new Date().toISOString(),
      orderIds:     data.order_ids,   // ← real IDs from DB AUTO_INCREMENT
    };

    sessionStorage.setItem('bbj_order_payload', JSON.stringify(confirmPayload));
    window.location.href = 'confirm.html';

  } catch (err) {
    btn.disabled    = false;
    btn.textContent = 'Place Order';

    document.getElementById('topAlert').classList.add('show');
    document.getElementById('topAlertMsg').textContent =
      `Order failed: ${err.message}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    console.error('[submitOrder]', err);
  }
}

// ─────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ─────────────────────────────────────────
// HAMBURGER NAV
// ─────────────────────────────────────────
function toggleMobileNav() {
  const mn = document.getElementById('mobileNav');
  if (mn) mn.classList.toggle('open');
}

// ─────────────────────────────────────────
// INIT — wait for products API before rendering
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Show loading skeleton while products fetch
  const list = document.getElementById('prodList');
  if (list) {
    list.innerHTML = `
      <div style="padding:32px;text-align:center;color:var(--muted);font-size:14px;">
        Loading menu…
      </div>`;
  }

  await productsReady;   // waits for fetch (or fallback) to complete

  renderProducts();
  refreshSummary();
});
