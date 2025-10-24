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
