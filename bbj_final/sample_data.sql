-- ============================================================
-- sample_data.sql
-- Run this AFTER running team.sql to populate test products.
-- Image links use Unsplash Source (free, no API key needed).
-- ============================================================

INSERT INTO products (name, price, quantity, description, discount_percent, image_link, category) VALUES
-- Breads
('Classic Sourdough',        8.50, 20, 'Traditional long-ferment sourdough with a crispy crust and chewy interior. Full loaf.',          0.00,  'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&h=200&fit=crop', 'Breads'),
('Rustic Baguette',          4.00, 35, 'Classic French-style baguette with a golden crust. Perfect with butter or cheese.',              0.00,  'https://images.unsplash.com/photo-1568471173242-461f0a730452?w=200&h=200&fit=crop', 'Breads'),
('Rosemary Focaccia',        7.00, 12, 'Thick, airy Italian flatbread topped with fresh rosemary and sea salt. Half-sheet.',            10.00,  'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=200&h=200&fit=crop', 'Breads'),
('Multigrain Loaf',          9.00, 18, 'Packed with sunflower seeds, oats, and whole wheat. Hearty and nutritious.',                     0.00,  'https://images.unsplash.com/photo-1549931319-a545dcf3bc7b?w=200&h=200&fit=crop', 'Breads'),
('Cheddar & Jalapeño Loaf', 10.50,  8, 'Sharp cheddar and pickled jalapeños baked into a soft, flavourful pull-apart loaf.',            0.00,  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop', 'Breads'),
('Rye Bread',                8.00, 14, 'Dense and flavourful dark rye made with caraway seeds. Full loaf.',                              0.00,  'https://images.unsplash.com/photo-1586444248879-bc604cbd555a?w=200&h=200&fit=crop', 'Breads'),

-- Pastries
('Butter Croissant',         3.50, 40, 'Classic French croissant with 36 layers of pure European butter. Light and flaky.',             0.00,  'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=200&h=200&fit=crop', 'Pastries'),
('Almond Croissant',         4.25, 22, 'Twice-baked croissant filled with almond cream and topped with toasted sliced almonds.',        0.00,  'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=200&h=200&fit=crop', 'Pastries'),
('Pain au Chocolat',         4.00, 18, 'Buttery pastry wrapped around two pieces of dark Belgian chocolate.',                           15.00,  'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=200&h=200&fit=crop', 'Pastries'),
('Seasonal Fruit Danish',    4.50, 10, 'Laminated dough filled with vanilla custard and topped with seasonal fresh fruit.',             0.00,  'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=200&h=200&fit=crop', 'Pastries'),
('Cinnamon Roll',            4.75, 25, 'Soft, pillowy roll swirled with cinnamon sugar and topped with cream cheese icing.',            0.00,  'https://images.unsplash.com/photo-1609428369414-ad6e79cbf052?w=200&h=200&fit=crop', 'Pastries'),
('Ham & Cheese Croissant',   5.50, 15, 'Savoury croissant filled with Black Forest ham and Gruyère. Served warm.',                     0.00,  'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=200&h=200&fit=crop', 'Pastries'),

-- Cakes
('Vanilla Layer Cake (slice)',    6.50, 16, 'Four-layer vanilla sponge with Swiss meringue buttercream and fresh berries.',             0.00,  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop', 'Cakes'),
('Dark Chocolate Torte (slice)',  7.00, 12, 'Dense, fudgy torte made with 70% dark chocolate and a mirror glaze finish.',              0.00,  'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=200&h=200&fit=crop', 'Cakes'),
('Lemon Tart',                    5.50, 10, 'Buttery shortcrust pastry shell filled with sharp lemon curd and torched meringue.',      20.00,  'https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=200&h=200&fit=crop', 'Cakes'),
('Chocolate Éclair',              4.50, 20, 'Choux pastry filled with vanilla pastry cream, topped with dark chocolate glaze.',        0.00,  'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=200&h=200&fit=crop', 'Cakes'),
('Tiramisu (slice)',              7.50,  8, 'Classic Italian tiramisu layered with espresso-soaked ladyfingers and mascarpone cream.',  0.00,  'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=200&h=200&fit=crop', 'Cakes'),
('Custom Celebration Cake',      65.00,  3, 'Fully custom cakes for birthdays, weddings, and events. Contact us to discuss sizing.',   0.00,  'https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=200&h=200&fit=crop', 'Cakes'),

-- Cookies
('Chocolate Chip Cookie',    2.75, 60, 'Brown butter cookie loaded with dark chocolate chunks. Crispy edges, chewy centre.',            0.00,  'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&h=200&fit=crop', 'Cookies'),
('French Macaron',           2.50, 48, 'Delicate almond meringue shells with ganache or buttercream. Flavours rotate weekly.',         0.00,  'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=200&h=200&fit=crop', 'Cookies'),
('Shortbread',               2.25, 55, 'Classic Scottish shortbread — buttery, crumbly, and melt-in-your-mouth.',                      0.00,  'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=200&h=200&fit=crop', 'Cookies'),
('Oat & Raisin Cookie',      2.50,  0, 'Hearty, chewy oat cookie with plump raisins and a hint of cinnamon.',                         0.00,  'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&h=200&fit=crop', 'Cookies'),
('Brownie',                  4.00, 30, 'Fudgy, rich chocolate brownie with a crinkle top. Optional walnut add-in.',                   10.00,  'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&h=200&fit=crop', 'Cookies'),
('Mixed Cookie Box',        22.00,  5, 'A curated box of 10 assorted cookies — great for gifting or events.',                          0.00,  'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=200&h=200&fit=crop', 'Cookies'),

-- Drinks
('Espresso',       2.75, 99, 'Single or double shot of our house espresso blend. Rich and smooth.',           0.00, 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=200&h=200&fit=crop', 'Drinks'),
('Flat White',     4.50, 99, 'Double ristretto with steamed whole milk. Velvety and strong.',                 0.00, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=200&h=200&fit=crop', 'Drinks'),
('Latte',          5.00, 99, 'Espresso with steamed milk. Available hot or iced. Oat milk available.',        0.00, 'https://images.unsplash.com/photo-1561047029-3000c68339ca?w=200&h=200&fit=crop', 'Drinks'),
('Drip Coffee',    3.00, 99, 'House blend, brewed fresh every hour. Regular or decaf.',                       0.00, 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=200&h=200&fit=crop', 'Drinks'),
('Chai Latte',     5.00, 99, 'House-made chai concentrate with steamed milk. Warm and spiced.',               0.00, 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=200&h=200&fit=crop', 'Drinks'),
('Hot Chocolate',  4.75, 99, 'Made with real melted chocolate and steamed milk. Topped with whipped cream.',  0.00, 'https://images.unsplash.com/photo-1542990253-a781e3a71cf9?w=200&h=200&fit=crop', 'Drinks');
