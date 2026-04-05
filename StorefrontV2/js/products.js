/**
 * products.js
 * Loads product data from the PHP API (/api/products.php).
 * Falls back to static mock data if the API is unreachable
 * (useful for local file:// development without XAMPP running).
 *
 * Exposes globals:
 *   PRODUCTS           — array populated after init
 *   getDiscountedPrice — helper function
 *   productsReady      — Promise that resolves when PRODUCTS is populated
 */

// ─────────────────────────────────────────
// STATIC FALLBACK DATA
// (mirrors the DB seed; used if API is down)
// ─────────────────────────────────────────
const STATIC_PRODUCTS = [
  {
    product_id: 1, name: 'Sourdough Loaf', category: 'Breads',
    price: 8.50, quantity: 12, discount_percent: 0,
    description: 'Tangy crust, soft crumb',
    image_link: 'images/sourdough.png', emoji: '🍞',
  },
  {
    product_id: 2, name: 'Cinnamon Roll', category: 'Pastries',
    price: 3.50, quantity: 8, discount_percent: 10,
    description: 'Cream cheese frosting',
    image_link: 'images/cinnamon-roll.png', emoji: '🌀',
  },
  {
    product_id: 3, name: 'Blueberry Muffin', category: 'Muffins',
    price: 2.75, quantity: 15, discount_percent: 0,
    description: 'Packed with fresh berries',
    image_link: 'images/blueberry-muffin.png', emoji: '🫐',
  },
  {
    product_id: 4, name: 'Butter Croissant', category: 'Pastries',
    price: 3.25, quantity: 3, discount_percent: 0,
    description: 'Buttery and flaky',
    image_link: 'images/croissant.png', emoji: '🥐',
  },
  {
    product_id: 5, name: 'Banana Bread', category: 'Breads',
    price: 6.00, quantity: 0, discount_percent: 0,
    description: 'Moist, with walnuts',
    image_link: 'images/banana-bread.png', emoji: '🍌',
  },
  {
    product_id: 6, name: 'Chocolate Brownie', category: 'Sweets',
    price: 2.50, quantity: 20, discount_percent: 5,
    description: 'Rich dark chocolate fudge',
    image_link: 'images/brownie.png', emoji: '🍫',
  },
  {
    product_id: 7, name: 'Lemon Tart', category: 'Tarts',
    price: 4.50, quantity: 6, discount_percent: 0,
    description: 'Silky lemon curd in pastry',
    image_link: 'images/lemon-tart.png', emoji: '🍋',
  },
  {
    product_id: 8, name: 'Almond Croissant', category: 'Pastries',
    price: 4.00, quantity: 2, discount_percent: 0,
    description: 'Filled with almond cream',
    image_link: 'images/almond-croissant.png', emoji: '🥐',
  },
];

// Emoji map keyed by product_id (since DB doesn't store emoji)
const EMOJI_MAP = {
  1: '🍞', 2: '🌀', 3: '🫐', 4: '🥐',
  5: '🍌', 6: '🍫', 7: '🍋', 8: '🥐',
};

// ─────────────────────────────────────────
// GLOBAL STATE
// ─────────────────────────────────────────
let PRODUCTS = [];

/**
 * productsReady — resolves once PRODUCTS is populated.
 * All page scripts should await this before using PRODUCTS.
 */
const productsReady = (async () => {
  try {
    const res = await fetch('api/products.php');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Attach emoji (not stored in DB)
    PRODUCTS = data.map(p => ({
      ...p,
      emoji: EMOJI_MAP[p.product_id] || '🧁',
    }));

    console.info(`[products] Loaded ${PRODUCTS.length} products from API.`);
  } catch (err) {
    console.warn('[products] API unavailable, using static fallback.', err.message);
    PRODUCTS = STATIC_PRODUCTS;
  }
})();

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
/**
 * getDiscountedPrice(product)
 * Returns the final price after applying discount_percent.
 */
function getDiscountedPrice(product) {
  if (product.discount_percent > 0) {
    return product.price * (1 - product.discount_percent / 100);
  }
  return product.price;
}
