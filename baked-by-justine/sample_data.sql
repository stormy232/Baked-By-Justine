-- sample_data.sql


INSERT INTO products (name, price, quantity, description, discount_percent, image_link, category) VALUES
-- Breads
('Classic Sourdough',        8.50, 20, 'Traditional long-ferment sourdough with a crispy crust and chewy interior. Full loaf.',           0.00,  NULL, 'Breads'),
('Rustic Baguette',          4.00, 35, 'Classic French-style baguette with a golden crust. Perfect with butter or cheese.',               0.00,  NULL, 'Breads'),
('Rosemary Focaccia',        7.00, 12, 'Thick, airy Italian flatbread topped with fresh rosemary and sea salt. Half-sheet.',             10.00,  NULL, 'Breads'),
('Multigrain Loaf',          9.00, 18, 'Packed with sunflower seeds, oats, and whole wheat. Hearty and nutritious.',                      0.00,  NULL, 'Breads'),
('Cheddar & Jalapeño Loaf', 10.50,  8, 'Sharp cheddar and pickled jalapeños baked into a soft, flavourful pull-apart loaf.',             0.00,  NULL, 'Breads'),
('Rye Bread',                8.00, 14, 'Dense and flavourful dark rye made with caraway seeds. Full loaf.',                               0.00,  NULL, 'Breads'),

-- Pastries
('Butter Croissant',         3.50, 40, 'Classic French croissant with 36 layers of pure European butter. Light and flaky.',              0.00,  NULL, 'Pastries'),
('Almond Croissant',         4.25, 22, 'Twice-baked croissant filled with almond cream and topped with toasted sliced almonds.',         0.00,  NULL, 'Pastries'),
('Pain au Chocolat',         4.00, 18, 'Buttery pastry wrapped around two pieces of dark Belgian chocolate.',                            15.00,  NULL, 'Pastries'),
('Seasonal Fruit Danish',    4.50, 10, 'Laminated dough filled with vanilla custard and topped with seasonal fresh fruit.',              0.00,  NULL, 'Pastries'),
('Cinnamon Roll',            4.75, 25, 'Soft, pillowy roll swirled with cinnamon sugar and topped with cream cheese icing.',             0.00,  NULL, 'Pastries'),
('Ham & Cheese Croissant',   5.50, 15, 'Savoury croissant filled with Black Forest ham and Gruyère. Served warm.',                      0.00,  NULL, 'Pastries'),

-- Cakes
('Vanilla Layer Cake (slice)',    6.50, 16, 'Four-layer vanilla sponge with Swiss meringue buttercream and fresh berries.',              0.00,  NULL, 'Cakes'),
('Dark Chocolate Torte (slice)',  7.00, 12, 'Dense, fudgy torte made with 70% dark chocolate and a mirror glaze finish.',               0.00,  NULL, 'Cakes'),
('Lemon Tart',                    5.50, 10, 'Buttery shortcrust pastry shell filled with sharp lemon curd and torched meringue.',       20.00,  NULL, 'Cakes'),
('Chocolate Éclair',              4.50, 20, 'Choux pastry filled with vanilla pastry cream, topped with dark chocolate glaze.',         0.00,  NULL, 'Cakes'),
('Tiramisu (slice)',              7.50,  8, 'Classic Italian tiramisu layered with espresso-soaked ladyfingers and mascarpone cream.',   0.00,  NULL, 'Cakes'),
('Custom Celebration Cake',      65.00,  3, 'Fully custom cakes for birthdays, weddings, and events. Contact us to discuss sizing.',     0.00,  NULL, 'Cakes'),

-- Cookies
('Chocolate Chip Cookie',    2.75, 60, 'Brown butter cookie loaded with dark chocolate chunks. Crispy edges, chewy centre.',             0.00,  NULL, 'Cookies'),
('French Macaron',           2.50, 48, 'Delicate almond meringue shells with ganache or buttercream. Flavours rotate weekly.',          0.00,  NULL, 'Cookies'),
('Shortbread',               2.25, 55, 'Classic Scottish shortbread — buttery, crumbly, and melt-in-your-mouth.',                       0.00,  NULL, 'Cookies'),
('Oat & Raisin Cookie',      2.50,  0, 'Hearty, chewy oat cookie with plump raisins and a hint of cinnamon.',                          0.00,  NULL, 'Cookies'),
('Brownie',                  4.00, 30, 'Fudgy, rich chocolate brownie with a crinkle top. Optional walnut add-in.',                    10.00,  NULL, 'Cookies'),
('Mixed Cookie Box',        22.00,  5, 'A curated box of 10 assorted cookies — great for gifting or events.',                           0.00,  NULL, 'Cookies'),

-- Drinks
('Espresso',       2.75, 99, 'Single or double shot of our house espresso blend. Rich and smooth.',          0.00, NULL, 'Drinks'),
('Flat White',     4.50, 99, 'Double ristretto with steamed whole milk. Velvety and strong.',                0.00, NULL, 'Drinks'),
('Latte',          5.00, 99, 'Espresso with steamed milk. Available hot or iced. Oat milk available.',       0.00, NULL, 'Drinks'),
('Drip Coffee',    3.00, 99, 'House blend, brewed fresh every hour. Regular or decaf.',                      0.00, NULL, 'Drinks'),
('Chai Latte',     5.00, 99, 'House-made chai concentrate with steamed milk. Warm and spiced.',              0.00, NULL, 'Drinks'),
('Hot Chocolate',  4.75, 99, 'Made with real melted chocolate and steamed milk. Topped with whipped cream.', 0.00, NULL, 'Drinks');
