/**
 * products.js
 *
 * Fetches product data from api/products.php.
 * Static fallback matches sample_data.sql exactly including image URLs.
 */

// EMOJI'S ARE USED AS BACKUP IMAGES IF ISSUES ARISE WITH IMAGE LOADING
var EMOJI_MAP = {
    'Breads':   '🍞',
    'Pastries': '🥐',
    'Cakes':    '🍰',
    'Cookies':  '🍪',
    'Drinks':   '☕'
};

var STATIC_PRODUCTS = [
    { product_id: 1,  name: 'Classic Sourdough',           category: 'Breads',   price: 8.50,  quantity: 20, discount_percent: 0,  description: 'Traditional long-ferment sourdough with a crispy crust and chewy interior. Full loaf.',        image_link: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop' },
    { product_id: 2,  name: 'Rustic Baguette',              category: 'Breads',   price: 4.00,  quantity: 35, discount_percent: 0,  description: 'Classic French-style baguette with a golden crust. Perfect with butter or cheese.',            image_link: 'https://images.unsplash.com/photo-1568471173242-461f0a730452?w=200&h=200&fit=crop' },
    { product_id: 3,  name: 'Rosemary Focaccia',            category: 'Breads',   price: 7.00,  quantity: 12, discount_percent: 10, description: 'Thick, airy Italian flatbread topped with fresh rosemary and sea salt. Half-sheet.',          image_link: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=200&h=200&fit=crop' },
    { product_id: 4,  name: 'Multigrain Loaf',              category: 'Breads',   price: 9.00,  quantity: 18, discount_percent: 0,  description: 'Packed with sunflower seeds, oats, and whole wheat. Hearty and nutritious.',                  image_link: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=200&h=200&fit=crop' },
    { product_id: 5,  name: 'Cheddar & Jalapeno Loaf',     category: 'Breads',   price: 10.50, quantity: 8,  discount_percent: 0,  description: 'Sharp cheddar and pickled jalapenos baked into a soft, flavourful pull-apart loaf.',          image_link: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop' },
    { product_id: 6,  name: 'Rye Bread',                    category: 'Breads',   price: 8.00,  quantity: 14, discount_percent: 0,  description: 'Dense and flavourful dark rye made with caraway seeds. Full loaf.',                          image_link: 'https://images.unsplash.com/photo-1586444248879-bc604cbd555a?w=200&h=200&fit=crop' },
    { product_id: 7,  name: 'Butter Croissant',             category: 'Pastries', price: 3.50,  quantity: 40, discount_percent: 0,  description: 'Classic French croissant with 36 layers of pure European butter. Light and flaky.',          image_link: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop' },
    { product_id: 8,  name: 'Almond Croissant',             category: 'Pastries', price: 4.25,  quantity: 22, discount_percent: 0,  description: 'Twice-baked croissant filled with almond cream and topped with toasted sliced almonds.',     image_link: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=200&h=200&fit=crop' },
    { product_id: 9,  name: 'Pain au Chocolat',             category: 'Pastries', price: 4.00,  quantity: 18, discount_percent: 15, description: 'Buttery pastry wrapped around two pieces of dark Belgian chocolate.',                       image_link: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=200&h=200&fit=crop' },
    { product_id: 10, name: 'Seasonal Fruit Danish',        category: 'Pastries', price: 4.50,  quantity: 10, discount_percent: 0,  description: 'Laminated dough filled with vanilla custard and topped with seasonal fresh fruit.',          image_link: 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=200&h=200&fit=crop' },
    { product_id: 11, name: 'Cinnamon Roll',                category: 'Pastries', price: 4.75,  quantity: 25, discount_percent: 0,  description: 'Soft, pillowy roll swirled with cinnamon sugar and topped with cream cheese icing.',         image_link: 'https://images.unsplash.com/photo-1609428369414-ad6e79cbf052?w=200&h=200&fit=crop' },
    { product_id: 12, name: 'Ham & Cheese Croissant',       category: 'Pastries', price: 5.50,  quantity: 15, discount_percent: 0,  description: 'Savoury croissant filled with Black Forest ham and Gruyere. Served warm.',                  image_link: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=200&h=200&fit=crop' },
    { product_id: 13, name: 'Vanilla Layer Cake (slice)',   category: 'Cakes',    price: 6.50,  quantity: 16, discount_percent: 0,  description: 'Four-layer vanilla sponge with Swiss meringue buttercream and fresh berries.',             image_link: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop' },
    { product_id: 14, name: 'Dark Chocolate Torte (slice)', category: 'Cakes',    price: 7.00,  quantity: 12, discount_percent: 0,  description: 'Dense, fudgy torte made with 70% dark chocolate and a mirror glaze finish.',              image_link: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=200&h=200&fit=crop' },
    { product_id: 15, name: 'Lemon Tart',                   category: 'Cakes',    price: 5.50,  quantity: 10, discount_percent: 20, description: 'Buttery shortcrust pastry shell filled with sharp lemon curd and torched meringue.',      image_link: 'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=200&h=200&fit=crop' },
    { product_id: 16, name: 'Chocolate Eclair',             category: 'Cakes',    price: 4.50,  quantity: 20, discount_percent: 0,  description: 'Choux pastry filled with vanilla pastry cream, topped with dark chocolate glaze.',        image_link: 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=200&h=200&fit=crop' },
    { product_id: 17, name: 'Tiramisu (slice)',             category: 'Cakes',    price: 7.50,  quantity: 8,  discount_percent: 0,  description: 'Classic Italian tiramisu layered with espresso-soaked ladyfingers and mascarpone cream.',image_link: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=200&fit=crop' },
    { product_id: 18, name: 'Custom Celebration Cake',      category: 'Cakes',    price: 65.00, quantity: 3,  discount_percent: 0,  description: 'Fully custom cakes for birthdays, weddings, and events. Contact us to discuss sizing.',  image_link: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=200&h=200&fit=crop' },
    { product_id: 19, name: 'Chocolate Chip Cookie',        category: 'Cookies',  price: 2.75,  quantity: 60, discount_percent: 0,  description: 'Brown butter cookie loaded with dark chocolate chunks. Crispy edges, chewy centre.',     image_link: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop' },
    { product_id: 20, name: 'French Macaron',               category: 'Cookies',  price: 2.50,  quantity: 48, discount_percent: 0,  description: 'Delicate almond meringue shells with ganache or buttercream. Flavours rotate weekly.',   image_link: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=200&h=200&fit=crop' },
    { product_id: 21, name: 'Shortbread',                   category: 'Cookies',  price: 2.25,  quantity: 55, discount_percent: 0,  description: 'Classic Scottish shortbread — buttery, crumbly, and melt-in-your-mouth.',              image_link: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop' },
    { product_id: 22, name: 'Oat & Raisin Cookie',         category: 'Cookies',  price: 2.50,  quantity: 0,  discount_percent: 0,  description: 'Hearty, chewy oat cookie with plump raisins and a hint of cinnamon.',                   image_link: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&h=200&fit=crop' },
    { product_id: 23, name: 'Brownie',                      category: 'Cookies',  price: 4.00,  quantity: 30, discount_percent: 10, description: 'Fudgy, rich chocolate brownie with a crinkle top. Optional walnut add-in.',            image_link: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&h=200&fit=crop' },
    { product_id: 24, name: 'Mixed Cookie Box',             category: 'Cookies',  price: 22.00, quantity: 5,  discount_percent: 0,  description: 'A curated box of 10 assorted cookies — great for gifting or events.',                 image_link: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=200&h=200&fit=crop' },
    { product_id: 25, name: 'Espresso',                     category: 'Drinks',   price: 2.75,  quantity: 99, discount_percent: 0,  description: 'Single or double shot of our house espresso blend. Rich and smooth.',                  image_link: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=200&h=200&fit=crop' },
    { product_id: 26, name: 'Flat White',                   category: 'Drinks',   price: 4.50,  quantity: 99, discount_percent: 0,  description: 'Double ristretto with steamed whole milk. Velvety and strong.',                        image_link: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200&h=200&fit=crop' },
    { product_id: 27, name: 'Latte',                        category: 'Drinks',   price: 5.00,  quantity: 99, discount_percent: 0,  description: 'Espresso with steamed milk. Available hot or iced. Oat milk available.',              image_link: 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=200&h=200&fit=crop' },
    { product_id: 28, name: 'Drip Coffee',                  category: 'Drinks',   price: 3.00,  quantity: 99, discount_percent: 0,  description: 'House blend, brewed fresh every hour. Regular or decaf.',                            image_link: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=200&h=200&fit=crop' },
    { product_id: 29, name: 'Chai Latte',                   category: 'Drinks',   price: 5.00,  quantity: 99, discount_percent: 0,  description: 'House-made chai concentrate with steamed milk. Warm and spiced.',                     image_link: 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200&h=200&fit=crop' },
    { product_id: 30, name: 'Hot Chocolate',                category: 'Drinks',   price: 4.75,  quantity: 99, discount_percent: 0,  description: 'Made with real melted chocolate and steamed milk. Topped with whipped cream.',        image_link: 'https://images.unsplash.com/photo-1542990253-a781e3a71cf9?w=200&h=200&fit=crop' }
];

var PRODUCTS = [];

function getDiscountedPrice(product) {
    if (product.discount_percent > 0) {
        return product.price * (1 - product.discount_percent / 100);
    }
    return product.price;
}

function getEmoji(product) {
    return EMOJI_MAP[product.category] || '🧁';
}

var productsReady = fetch('api/products_cart.php')
    .then(function(response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
    })
    .then(function(data) {
        PRODUCTS = data.map(function(p) {
            p.emoji = getEmoji(p);
            return p;
        });
    })
    .catch(function(err) {
        console.warn('API not reachable, using static fallback.', err.message);
        PRODUCTS = STATIC_PRODUCTS.map(function(p) {
            p.emoji = getEmoji(p);
            return p;
        });
    });
