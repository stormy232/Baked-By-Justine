/**
 * confirm.js
 * Reads the order payload stored by order.js from sessionStorage
 * and renders the confirmation page content.
 *
 * The payload now contains real order_ids from the DB (AUTO_INCREMENT),
 * so no client-side ID generation is needed.
 *
 * Depends on: products.js (for getDiscountedPrice)
 */

'use strict';

// ─────────────────────────────────────────
// BUILD SQL PREVIEW
// Shows the INSERT statements that were executed
// ─────────────────────────────────────────
function buildSQL(payload) {
  return payload.cartItems.map((item, i) => {
    const oid = payload.orderIds[i] || '?';
    return (
      `<span class="sk">INSERT INTO</span> <span class="st">delivery</span>\n` +
      `  (user_id, product_id, est_prep_time, order_status)\n` +
      `<span class="sk">VALUES</span>\n` +
      `  (<span class="sv">${payload.customer.userId}</span>, ` +
      `<span class="sv">${item.product_id}</span>, ` +
      `<span class="sv">'${payload.prepTime}'</span>, ` +
      `<span class="sv">'pending'</span>);\n` +
      `<span class="sc">-- → order_id ${oid} inserted, created_at = ${payload.submittedAt}</span>`
    );
  }).join('\n\n');
}

// ─────────────────────────────────────────
// BUILD DETAILS TABLE
// ─────────────────────────────────────────
function buildTable(payload) {
  const ids = payload.orderIds || [];
  const idLabel = ids.length > 1
    ? `#${ids[0]} – #${ids[ids.length - 1]}`
    : ids.length === 1 ? `#${ids[0]}` : '—';

  const itemRows = payload.cartItems.map(item =>
    `<tr>
       <td>${item.emoji} ${item.name} ×${item.qty}</td>
       <td>$${item.subtotal.toFixed(2)}</td>
     </tr>`
  ).join('');

  // Parse the timestamp from DB (or ISO string from client)
  const now = new Date(payload.submittedAt)
    .toLocaleString('en-CA', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });

  return `
    ${itemRows}
    <tr><td>Customer</td><td>${payload.customer.firstName} ${payload.customer.lastName}</td></tr>
    <tr><td>Email</td><td>${payload.customer.email}</td></tr>
    <tr><td>user_id</td><td>${payload.customer.userId}</td></tr>
    <tr><td>est_prep_time</td><td>${payload.prepTime}</td></tr>
    <tr><td>order_status</td><td>pending</td></tr>
    <tr><td>created_at</td><td>${now}</td></tr>
    <tr><td><strong>Total</strong></td><td><strong>$${payload.total.toFixed(2)}</strong></td></tr>
  `;
}

// ─────────────────────────────────────────
// PLACE ANOTHER ORDER
// ─────────────────────────────────────────
function placeAnother() {
  sessionStorage.removeItem('bbj_cart');
  sessionStorage.removeItem('bbj_order_payload');
  window.location.href = 'order.html';
}

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const raw = sessionStorage.getItem('bbj_order_payload');

  if (!raw) {
    window.location.href = 'order.html';
    return;
  }

  const payload  = JSON.parse(raw);
  const orderIds = payload.orderIds || [];

  // ── Order ID display ──
  const idLabel = orderIds.length > 1
    ? `#${orderIds[0]} – #${orderIds[orderIds.length - 1]}`
    : orderIds.length === 1 ? `#${orderIds[0]}` : '—';

  document.getElementById('confirmId').textContent = idLabel;

  // ── Details table ──
  document.getElementById('confirmTable').innerHTML = buildTable(payload);

  // ── SQL block ──
  document.getElementById('confirmSQL').innerHTML = buildSQL(payload);

  // Clear payload (one-time display)
  sessionStorage.removeItem('bbj_order_payload');
});
