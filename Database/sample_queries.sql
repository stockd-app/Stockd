-- Insert User 1 (Admin)
INSERT INTO Users (name, email, email_hash, picture, client_id, role) 
VALUES 
('John Doe', 'john.doe@example.com', SHA2('john.doe@example.com', 256), 'https://example.com/pic1.jpg', 'client_12345', 'admin');

-- Insert User 2 (Regular User)
INSERT INTO Users (name, email, email_hash, picture, client_id, role) 
VALUES 
('Jane Smith', 'jane.smith@example.com', SHA2('jane.smith@example.com', 256), 'https://example.com/pic2.jpg', 'client_67890', 'user');

-- Insert Pantry Item for User 1 (Admin)
INSERT INTO PantryItems (user_id, item_name, category, storage, quantity_value, quantity_unit, item_image) 
VALUES 
(1, 'Apple', 'Fruits', 'Fridge', 10, 'pcs', 'https://example.com/apple.jpg'),
(1, 'Tomato', 'Vegetables', 'Counter', 5, 'pcs', 'https://example.com/tomato.jpg'),
(1, 'Chicken Breast', 'Meat', 'Freezer', 2, 'kg', 'https://example.com/chicken.jpg');

-- Insert Pantry Item for User 2 (Regular User)
INSERT INTO PantryItems (user_id, item_name, category, storage, quantity_value, quantity_unit, item_image) 
VALUES 
(2, 'Milk', 'Dairy', 'Fridge', 2, 'liters', 'https://example.com/milk.jpg'),
(2, 'Carrot', 'Vegetables', 'Fridge', 3, 'pcs', 'https://example.com/carrot.jpg'),
(2, 'Rice', 'Grains', 'Pantry', 1, 'kg', 'https://example.com/rice.jpg');

-- Insert Recipe 1
INSERT INTO Recipes (dataset_recipe_id, recipe_name, recipe_image, steps, prep_time, cook_time)
VALUES
(397496, 'Crabmeat Artichoke Casserole', '', 'Recipe from my beloved grandmother. Very easy & quick. Can use 3 cans crabmeat in place of fresh.', 0, 30);

-- Insert Recipe 2
INSERT INTO Recipes (dataset_recipe_id, recipe_name, recipe_image, steps, prep_time, cook_time)
VALUES
(275874, 'Veggie Soup', 'https://example.com/veggie_soup.jpg', '1. Boil vegetables; 2. Add seasonings; 3. Simmer for 30 mins', 15, 30);

-- Insert Ingredients for Chicken Stir Fry
INSERT INTO RecipeIngredients (recipe_id, pantry_item_id, ingredient_name, quantity) 
VALUES 
(1, 3, 'Chicken Breast', '200 grams'),  -- Chicken from User 1's pantry
(1, 2, 'Tomato', '1 pc');               -- Tomato from User 1's pantry

-- Insert Ingredients for Veggie Soup
INSERT INTO RecipeIngredients (recipe_id, pantry_item_id, ingredient_name, quantity) 
VALUES 
(2, 2, 'Carrot', '2 pcs'),              -- Carrot from User 2's pantry
(2, 4, 'Rice', '100 grams');            -- Rice from User 2's pantry

-- User 1 (Admin) likes the Chicken Stir Fry
INSERT INTO LikedRecipes (user_id, recipe_id) 
VALUES 
(1, 1);   -- User 1 likes Chicken Stir Fry

-- User 2 (Regular User) likes the Veggie Soup
INSERT INTO LikedRecipes (user_id, recipe_id) 
VALUES 
(2, 2);   -- User 2 likes Veggie Soup

-- This will be automatically inserted by the `users_insert_audit` trigger after the user is added
INSERT INTO audit_logs (timestamp, db_user, user_id, action, table_name, record_id, changes) 
VALUES 
(NOW(), 'admin_user', 1, 'INSERT', 'Users', 1, JSON_OBJECT('name', 'John Doe', 'email', 'john.doe@example.com', 'role', 'admin'));
