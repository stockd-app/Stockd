-- Insert multiple users
INSERT INTO Users (name, email, picture, client_id, role)
VALUES
 ('Alice Johnson', 'alice@example.com', 'pic1.jpg', 'CID001', 'admin'),
 ('Bob Smith', 'bob@example.com', 'pic2.jpg', 'CID002', 'user'),
 ('Charlie Brown', 'charlie@example.com','pic3.jpg','CID003','guest');

-- Update Alice's profile
UPDATE Users SET name = 'Alice J.' , picture = 'alice_new.jpg' WHERE email = 'alice@example.com';

-- Update Bob's role
UPDATE Users SET role = 'admin' WHERE email = 'bob@example.com';

-- Delete Charlie
DELETE FROM Users WHERE email = 'charlie@example.com';

-- Insert pantry items
INSERT INTO PantryItems (user_id, item_name, category, storage, quantity_value, quantity_unit)
VALUES
 (1, 'Flour', 'Baking', 'Pantry', 2, 'kg'),
 (1, 'Sugar', 'Baking', 'Pantry', 1, 'kg'),
 (2, 'Milk', 'Dairy', 'Fridge', 2, 'liters');

-- Update a pantry item 
UPDATE PantryItems SET quantity_value = 1.5 WHERE item_name = 'Flour';

-- Delete a pantry item
DELETE FROM PantryItems WHERE item_name = 'Sugar';

-- Check audit logs
SELECT * FROM audit_logs;

-- Display audit logs in readable format
SELECT * FROM audit_logs\G;
