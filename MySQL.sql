-- Créer la base de données
CREATE DATABASE IF NOT EXISTS theroyce_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE theroyce_db;

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(20) DEFAULT '#6B4423',
    image TEXT,
    type VARCHAR(50) DEFAULT 'default',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des produits
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    price VARCHAR(20) NOT NULL,
    description TEXT,
    ingredients TEXT,
    tags TEXT,
    image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table pour les paramètres
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(50) UNIQUE NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insérer le code admin PAR DÉFAUT
INSERT IGNORE INTO settings (setting_key, setting_value) 
VALUES ('admin_code', '123456');

-- Insertion des catégories par défaut
INSERT IGNORE INTO categories (id, name, color, type) VALUES
(1, 'Spécialités Chocolat', '#6B4423', 'chocolat'),
(2, 'Spécialités Pistache', '#93C572', 'pistache'),
(3, 'Fusion Royce', 'linear-gradient(135deg, #6B4423, #93C572)', 'fusion'),
(4, 'Boissons', '#8B5A2B', 'boissons');

-- Insertion des produits par défaut
INSERT IGNORE INTO products (id, category_id, name, price, description, ingredients, tags) VALUES
(1, 1, 'خلطبيطه', '10.000 DT', 'Sphère de chocolat Guanaja 70%, cœur coulant pistache, croustillant praliné.', '["Chocolat Guanaja 70%", "Crème pistache", "Praliné croustillant", "Or edible"]', '["Signature", "Best-seller"]'),
(2, 2, 'Éclair Pistache d''Or', '7.800 DT', 'Éclair garni de crème pâtissière à la pistache de Bronte, glaçage doré.', '["Pistache de Bronte", "Crème pâtissière", "Pâte à choux", "Glaçage doré"]', '["Pistache Premium", "Artisanal"]'),
(3, 3, 'Forêt Noire Royce', '14.200 DT', 'Revisite de la forêt noire avec crème pistache, chocolat 70% et griottes.', '["Chocolat 70%", "Crème pistache", "Griottes", "Biscuit cacao"]', '["Exclusif", "Création Maison"]'),
(4, 4, 'Cappuccino Pistache', '5.500 DT', 'Cappuccino crémeux avec sirop de pistache maison et topping de chocolat.', '["Café arabica", "Lait entier", "Sirop pistache", "Chocolat râpé"]', '["Chaud", "Signature"]');