DROP DATABASE IF EXISTS stockd_db;
CREATE DATABASE stockd_db;
USE stockd_db;

-- USERS
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    picture VARCHAR(255),
    client_id VARCHAR(255),
    role ENUM('admin', 'user', 'guest') DEFAULT 'guest',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- PANTRY ITEMS
CREATE TABLE PantryItems (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    storage VARCHAR(255),
    quantity_value FLOAT DEFAULT 0,
    quantity_unit VARCHAR(100),
    added_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- RECIPES
CREATE TABLE Recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_name VARCHAR(255) NOT NULL,
    recipe_image VARCHAR(255),
    steps TEXT,
    prep_time INT,
    cook_time INT
);

-- RECIPE INGREDIENTS
CREATE TABLE RecipeIngredients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    pantry_item_id INT NULL,
    ingredient_name VARCHAR(255) NOT NULL,
    quantity VARCHAR(100),
    FOREIGN KEY (recipe_id) REFERENCES Recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (pantry_item_id) REFERENCES PantryItems(id) ON DELETE SET NULL
);

-- AUDIT LOG
CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    db_user VARCHAR(100),
    user_id VARCHAR(50),
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    table_name VARCHAR(64),
    record_id VARCHAR(100),
    changes JSON
);

-- TRIGGERS FOR USERS TABLE INSERT
DELIMITER $$

CREATE TRIGGER users_insert_audit
AFTER INSERT ON Users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (timestamp, db_user, user_id, action, table_name, record_id, changes)
    VALUES (
        NOW(),
        CURRENT_USER(),
        NEW.id,
        'INSERT',
        'Users',
        NEW.id,
        JSON_OBJECT(
            'name', NEW.name,
            'email', NEW.email,
            'picture', NEW.picture,
            'client_id', NEW.client_id,
            'role', NEW.role
        )
    );
END$$

-- TRIGGERS FOR USERS TABLE UPDATE
CREATE TRIGGER users_update_audit
AFTER UPDATE ON Users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (timestamp, db_user, user_id, action, table_name, record_id, changes)
    VALUES (
        NOW(),
        CURRENT_USER(),
        NEW.id,
        'UPDATE',
        'Users',
        NEW.id,
        JSON_OBJECT(
            'old', JSON_OBJECT(
                'name', OLD.name,
                'email', OLD.email,
                'picture', OLD.picture,
                'client_id', OLD.client_id,
                'role', OLD.role
            ),
            'new', JSON_OBJECT(
                'name', NEW.name,
                'email', NEW.email,
                'picture', NEW.picture,
                'client_id', NEW.client_id,
                'role', NEW.role
            )
        )
    );
END$$

-- TRIGGERS FOR USERS TABLE DELETE
CREATE TRIGGER users_delete_audit
AFTER DELETE ON Users
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (timestamp, db_user, user_id, action, table_name, record_id, changes)
    VALUES (
        NOW(),
        CURRENT_USER(),
        OLD.id,
        'DELETE',
        'Users',
        OLD.id,
        JSON_OBJECT(
            'name', OLD.name,
            'email', OLD.email,
            'picture', OLD.picture,
            'client_id', OLD.client_id,
            'role', OLD.role
        )
    );
END$$

DELIMITER ;

-- TRIGGERS FOR PANTRYITEMS TABLE INSERT
DELIMITER $$

CREATE TRIGGER pantryitems_insert_audit
AFTER INSERT ON PantryItems
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (timestamp, db_user, user_id, action, table_name, record_id, changes)
    VALUES (
        NOW(),
        CURRENT_USER(),
        NEW.user_id,
        'INSERT',
        'PantryItems',
        NEW.id,
        JSON_OBJECT(
            'item_name', NEW.item_name,
            'category', NEW.category,
            'storage', NEW.storage,
            'quantity_value', NEW.quantity_value,
            'quantity_unit', NEW.quantity_unit
        )
    );
END$$

-- TRIGGERS FOR PANTRYITEMS TABLE UPDATE
CREATE TRIGGER pantryitems_update_audit
AFTER UPDATE ON PantryItems
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (timestamp, db_user, user_id, action, table_name, record_id, changes)
    VALUES (
        NOW(),
        CURRENT_USER(),
        NEW.user_id,
        'UPDATE',
        'PantryItems',
        NEW.id,
        JSON_OBJECT(
            'old', JSON_OBJECT(
                'item_name', OLD.item_name,
                'category', OLD.category,
                'storage', OLD.storage,
                'quantity_value', OLD.quantity_value,
                'quantity_unit', OLD.quantity_unit
            ),
            'new', JSON_OBJECT(
                'item_name', NEW.item_name,
                'category', NEW.category,
                'storage', NEW.storage,
                'quantity_value', NEW.quantity_value,
                'quantity_unit', NEW.quantity_unit
            )
        )
    );
END$$

-- TRIGGERS FOR PANTRYITEMS TABLE DELETE
CREATE TRIGGER pantryitems_delete_audit
AFTER DELETE ON PantryItems
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (timestamp, db_user, user_id, action, table_name, record_id, changes)
    VALUES (
        NOW(),
        CURRENT_USER(),
        OLD.user_id,
        'DELETE',
        'PantryItems',
        OLD.id,
        JSON_OBJECT(
            'item_name', OLD.item_name,
            'category', OLD.category,
            'storage', OLD.storage,
            'quantity_value', OLD.quantity_value,
            'quantity_unit', OLD.quantity_unit
        )
    );
END$$

DELIMITER ;
