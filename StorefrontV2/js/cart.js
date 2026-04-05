/**
 * cart.js
 * Manages the in-memory cart state for the current session.
 * Persists to sessionStorage so the cart survives a page refresh
 * within the same tab (cleared when the tab closes).
 *
 * Cart shape: { [product_id]: qty }
 */

const Cart = (() => {
  const STORAGE_KEY = 'bbj_cart';

  // ── Load from sessionStorage on init ──
  function load() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function save(cart) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch { /* storage unavailable */ }
  }

  let _cart = load();

  return {
    /** Returns the full cart object { product_id: qty } */
    get() {
      return { ..._cart };
    },

    /** Returns qty for a given product_id (0 if not in cart) */
    getQty(productId) {
      return _cart[productId] || 0;
    },

    /** Returns all product_ids currently in the cart */
    keys() {
      return Object.keys(_cart).map(Number).filter(k => _cart[k] > 0);
    },

    /** Total number of individual items across all products */
    totalQty() {
      return Object.values(_cart).reduce((s, q) => s + q, 0);
    },

    /** Total price based on discounted prices */
    totalPrice(products) {
      return this.keys().reduce((sum, id) => {
        const p = products.find(x => x.product_id === id);
        if (!p) return sum;
        return sum + getDiscountedPrice(p) * _cart[id];
      }, 0);
    },

    /**
     * Set qty for a product. Pass 0 to remove it.
     * Returns false if qty exceeds stock.
     */
    setQty(productId, qty, maxStock) {
      if (qty < 0) return false;
      if (qty > maxStock) return false;
      if (qty === 0) {
        delete _cart[productId];
      } else {
        _cart[productId] = qty;
      }
      save(_cart);
      return true;
    },

    /** Increment qty by 1. Returns false if at max stock. */
    increment(productId, maxStock) {
      const current = this.getQty(productId);
      return this.setQty(productId, current + 1, maxStock);
    },

    /** Decrement qty by 1. Returns false if already 0. */
    decrement(productId) {
      const current = this.getQty(productId);
      if (current <= 0) return false;
      return this.setQty(productId, current - 1, Infinity);
    },

    /** Clear the entire cart */
    clear() {
      _cart = {};
      save(_cart);
    },

    /** True if at least one item is in the cart */
    isEmpty() {
      return this.keys().length === 0;
    },
  };
})();
