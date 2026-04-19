/**
 * order.js
 *
 * Handles both order.html and confirm.html.
 * Includes cart state management (formerly cart.js)
 * and confirmation rendering (formerly confirm.js).
 *
 * API endpoints used:
 *   GET  api/cart.php?customer_email=x        fetch cart
 *   POST api/cart.php  { action:"add", ... }  add to cart
 *   POST api/cart.php  { action:"update", ... } set qty / remove
 *   POST api/submit_order.php                 place order
 *   GET  api/orders.php?customer_email=x      order history
 */

'use strict';

// ═══════════════════════════════════════════════════════
// CART STATE
// Manages the cart by talking to api/cart.php.
// Email stored in sessionStorage so it persists across pages.
// ═══════════════════════════════════════════════════════

var Cart = (function () {

    var EMAIL_KEY = 'bbj_customer_email';
    var _items = [];

    return {

        getEmail: function () {
            return sessionStorage.getItem(EMAIL_KEY) || '';
        },

        setEmail: function (email) {
            sessionStorage.setItem(EMAIL_KEY, email);
        },

        clearLocal: function () {
            sessionStorage.removeItem(EMAIL_KEY);
            _items = [];
        },

        items: function () {
            return _items;
        },

        total: function () {
            return _items.reduce(function (sum, item) {
                var price = item.discount_percent > 0
                    ? item.price * (1 - item.discount_percent / 100)
                    : item.price;
                return sum + price * item.qty;
            }, 0);
        },

        totalQty: function () {
            return _items.reduce(function (sum, item) {
                return sum + item.qty;
            }, 0);
        },

        load: function () {
            var email = this.getEmail();
            if (!email) {
                _items = [];
                return Promise.resolve([]);
            }

            return fetch('api/cart.php?customer_email=' + encodeURIComponent(email))
                .then(function (res) { return res.json(); })
                .then(function (data) {
                    _items = Array.isArray(data) ? data : [];
                    return _items;
                })
                .catch(function (err) {
                    console.error('Cart.load error:', err);
                    _items = [];
                    return [];
                });
        },

        add: function (productId, qty) {
            var self = this;
            var email = this.getEmail();
            if (!email) return Promise.reject(new Error('No email set'));

            return fetch('api/cart.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add',
                    customer_email: email,
                    product_id: productId,
                    qty: qty
                })
            })
                .then(function (res) {
                    return res.json().then(function (data) {
                        if (!res.ok) throw new Error(data.error || 'Could not add item');
                        return data;
                    });
                })
                .then(function () { return self.load(); });
        },

        update: function (productId, qty) {
            var self = this;
            var email = this.getEmail();
            if (!email) return Promise.reject(new Error('No email set'));

            return fetch('api/cart.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update',
                    customer_email: email,
                    product_id: productId,
                    qty: qty
                })
            })
                .then(function (res) {
                    return res.json().then(function (data) {
                        if (!res.ok) throw new Error(data.error || 'Could not update item');
                        return data;
                    });
                })
                .then(function () { return self.load(); });
        }
    };

})();


// ORDER PAGE — only runs when order.html is active


var chosenPrepTime = '20-30 minutes';

function renderCart() {
    var items = Cart.items();
    var listEl = document.getElementById('cart-list');
    var emptyEl = document.getElementById('cart-empty');
    var totalEl = document.getElementById('cart-total-amount');
    var badge = document.getElementById('cart-badge');

    if (badge) badge.textContent = Cart.totalQty();

    if (!items || items.length === 0) {
        if (listEl) listEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        if (totalEl) totalEl.textContent = '$0.00';
        updateSubmitBtn();
        return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    if (listEl) listEl.style.display = 'block';

    var html = '';
    items.forEach(function (item) {
        var final = item.discount_percent > 0
            ? item.price * (1 - item.discount_percent / 100)
            : item.price;
        var sub = final * item.qty;
        var emoji = item.emoji || getEmoji(item) || '🧁';
        var thumb = item.image_link
            ? '<img src="' + item.image_link + '" alt="' + item.name + '" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display=\'none\';this.parentNode.textContent=\'' + emoji + '\'">'
            : emoji;

        html += '<div class="cart-row" id="cart-row-' + item.product_id + '">';
        html += '<div class="cart-thumb">' + thumb + '</div>';
        html += '<div class="cart-info">';
        html += '<div class="cart-item-name">' + item.name + '</div>';
        html += '<div class="cart-item-sub">$' + final.toFixed(2) + ' each';
        if (item.discount_percent > 0) {
            html += ' <span class="tag tag-sale">' + item.discount_percent + '% off</span>';
        }
        html += '</div>';
        html += '</div>';
        html += '<div class="cart-controls">';
        html += '<div class="stepper">';
        html += '<button type="button" onclick="cartDecrement(' + item.product_id + ')" ' + (item.qty <= 1 ? 'class="danger-btn"' : '') + '>-</button>';
        html += '<div class="qty">' + item.qty + '</div>';
        html += '<button type="button" onclick="cartIncrement(' + item.product_id + ', ' + item.stock + ')">+</button>';
        html += '</div>';
        html += '<div class="cart-item-total">$' + sub.toFixed(2) + '</div>';
        html += '<button type="button" class="remove-btn" onclick="cartRemove(' + item.product_id + ')">Remove</button>';
        html += '</div>';
        html += '</div>';
    });

    if (listEl) listEl.innerHTML = html;
    if (totalEl) totalEl.textContent = '$' + Cart.total().toFixed(2);
    updateSubmitBtn();
}

function cartIncrement(productId, stock) {
    var item = Cart.items().find(function (i) { return i.product_id === productId; });
    if (!item) return;
    if (item.qty + 1 > stock) { showToast('No more stock available'); return; }
    setRowLoading(productId, true);
    Cart.update(productId, item.qty + 1)
        .then(function () { renderCart(); })
        .catch(function (err) { showToast(err.message); })
        .finally(function () { setRowLoading(productId, false); });
}

function cartDecrement(productId) {
    var item = Cart.items().find(function (i) { return i.product_id === productId; });
    if (!item) return;
    if (item.qty - 1 <= 0) { cartRemove(productId); return; }
    setRowLoading(productId, true);
    Cart.update(productId, item.qty - 1)
        .then(function () { renderCart(); })
        .catch(function (err) { showToast(err.message); })
        .finally(function () { setRowLoading(productId, false); });
}

function cartRemove(productId) {
    setRowLoading(productId, true);
    Cart.update(productId, 0)
        .then(function () { renderCart(); })
        .catch(function (err) { showToast(err.message); })
        .finally(function () { setRowLoading(productId, false); });
}

function setRowLoading(productId, loading) {
    var row = document.getElementById('cart-row-' + productId);
    if (!row) return;
    row.style.opacity = loading ? '0.5' : '1';
    row.style.pointerEvents = loading ? 'none' : '';
}

function selectTime(el, val) {
    document.querySelectorAll('.time-option').forEach(function (opt) {
        opt.classList.remove('selected');
    });
    el.classList.add('selected');
    chosenPrepTime = val;
}

function validateForm() {
    var valid = true;

    if (Cart.items().length === 0) {
        valid = false;
        showError('cart-err');
    } else {
        hideError('cart-err');
    }

    var email = document.getElementById('email').value.trim();
    if (!email || !email.includes('@')) {
        document.getElementById('email').classList.add('invalid');
        showError('email-err');
        valid = false;
    } else {
        document.getElementById('email').classList.remove('invalid');
        hideError('email-err');
        Cart.setEmail(email);
    }

    return valid;
}

function showError(id) {
    var el = document.getElementById(id);
    if (el) el.classList.add('visible');
}

function hideError(id) {
    var el = document.getElementById(id);
    if (el) el.classList.remove('visible');
}

function updateSubmitBtn() {
    var btn = document.getElementById('submit-btn');
    if (btn) btn.disabled = Cart.items().length === 0;
}

function submitOrder() {
    document.getElementById('top-alert').classList.remove('visible');

    if (!validateForm()) {
        document.getElementById('top-alert').classList.add('visible');
        document.getElementById('top-alert-msg').textContent =
            'Please fill in your email and make sure your cart has items.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    var email = document.getElementById('email').value.trim();
    var comments = document.getElementById('comments').value.trim();
    var btn = document.getElementById('submit-btn');

    btn.disabled = true;
    btn.textContent = 'Placing order...';

    fetch('api/create_payment_intent.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            customer_email: email,
        })
    })
        .then(function (res) {
            return res.json().then(function (data) {
                if (!res.ok) throw new Error(data.error || 'Order could not be submitted');
                return data;
            });
        })

        .then(function (data) {
            return stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: { email: email }
                }
            });
        })

        .then(function (result) {
            if (result.error) throw new Error(result.error.message);
            return fetch('api/submit_order.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_email: email,
                    est_prep_time: chosenPrepTime,
                    comments: comments
                })
            });
        })

        .then(function (res) {
            return res.json().then(function (data) {
                if (!res.ok) throw new Error(data.error || 'Order submission failed');
                return data;
            });
        })

        .then(function (data) {
            var payload = {
                customer: { email: email, comments: comments },
                orderId: data.order_id,
                total: data.total,
                prepTime: chosenPrepTime,
                submittedAt: data.created_at || new Date().toISOString()
            };
            sessionStorage.setItem('bbj_order_payload', JSON.stringify(payload));
            window.location.href = 'confirm.html';
        })
        .catch(function (err) {
            btn.disabled = false;
            btn.textContent = 'Place Order';
            document.getElementById('top-alert').classList.add('visible');
            document.getElementById('top-alert-msg').textContent = err.message;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
}

function loadOrderHistory() {
    var email = document.getElementById('email')
        ? document.getElementById('email').value.trim()
        : Cart.getEmail();

    if (!email || !email.includes('@')) {
        showToast('Enter your email above to see your orders');
        return;
    }

    var section = document.getElementById('order-history-section');
    var tbody = document.getElementById('order-history-body');
    var noOrders = document.getElementById('no-orders-msg');

    if (section) section.style.display = 'block';
    if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:16px;color:var(--text-soft);">Loading...</td></tr>';
    if (noOrders) noOrders.style.display = 'none';

    fetch('api/orders.php?customer_email=' + encodeURIComponent(email))
        .then(function (res) { return res.json(); })
        .then(function (orders) {
            if (!Array.isArray(orders) || orders.length === 0) {
                if (tbody) tbody.innerHTML = '';
                if (noOrders) noOrders.style.display = 'block';
                return;
            }

            var statusLabels = {
                'pending': 'Pending',
                'preparing': 'Preparing',
                'finished': 'Ready'
            };

            var html = '';
            orders.forEach(function (order) {
                var statusClass = 'status-' + order.order_status;
                var statusText = statusLabels[order.order_status] || order.order_status;
                var itemNames = order.items.map(function (i) {
                    return i.quantity + 'x ' + i.name;
                }).join(', ');
                var date = new Date(order.created_at).toLocaleString('en-CA', {
                    month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit', hour12: true
                });

                html += '<tr>';
                html += '<td>#' + order.order_id + '</td>';
                html += '<td><span class="order-status-badge ' + statusClass + '">' + statusText + '</span></td>';
                html += '<td><span class="order-items-text">' + itemNames + '</span></td>';
                html += '<td>$' + order.total_price.toFixed(2) + '</td>';
                html += '<td><span class="order-date">' + date + '</span></td>';
                html += '</tr>';
            });

            if (tbody) tbody.innerHTML = html;
        })
        .catch(function (err) {
            if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--red);padding:16px;">Could not load orders</td></tr>';
            console.error('loadOrderHistory error:', err);
        });
}

// CONFIRM PAGE — only runs when confirm.html is active

function placeAnother() {
    sessionStorage.removeItem('bbj_order_payload');
    window.location.href = 'order.html';
}

function initConfirmPage() {
    var raw = sessionStorage.getItem('bbj_order_payload');
    if (!raw) { window.location.href = 'order.html'; return; }

    var payload = JSON.parse(raw);

    document.getElementById('confirm-id').textContent = '#' + payload.orderId;

    var date = new Date(payload.submittedAt).toLocaleString('en-CA', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
    });

    var rows = '';
    rows += '<tr><td>Email</td><td>' + payload.customer.email + '</td></tr>';
    rows += '<tr><td>Pickup window</td><td>' + payload.prepTime + '</td></tr>';
    rows += '<tr><td>Status</td><td>Pending</td></tr>';
    rows += '<tr><td>Placed</td><td>' + date + '</td></tr>';
    rows += '<tr><td><strong>Total</strong></td><td><strong>$' + payload.total.toFixed(2) + '</strong></td></tr>';

    document.getElementById('confirm-table').innerHTML = rows;
    sessionStorage.removeItem('bbj_order_payload');
}



// SHARED UTILITIES

function showToast(msg) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(function () { el.classList.remove('show'); }, 2400);
}

function toggleMobileNav() {
    var menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('open');
}

// INIT — detect which page we're on and run accordingly

document.addEventListener('DOMContentLoaded', function () {

    if (document.getElementById('confirm-id')) {
        initConfirmPage();
        return;
    }

    var emailInput = document.getElementById('email');

    var stored = Cart.getEmail();
    if (stored && emailInput) {
        emailInput.value = stored;
    }

    fetch('api/auth.php?action=session')
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.success && data.logged_in && data.user && data.user.email) {
                Cart.setEmail(data.user.email);
                if (emailInput) emailInput.value = data.user.email;
            }
        })
        .catch(function() {})
        .finally(function() {
            productsReady.then(function () {
                Cart.load().then(function () {
                    renderCart();
                });
            });
        });

    if (emailInput) {
        emailInput.addEventListener('blur', function () {
            var val = emailInput.value.trim();
            if (val && val.includes('@')) {
                Cart.setEmail(val);
                Cart.load().then(function () { renderCart(); });
            }
        });
    }

});