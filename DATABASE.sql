
-- =====================================================
-- E-WASTE MANAGEMENT SYSTEM
-- Complete MySQL Database Script
-- =====================================================

CREATE DATABASE IF NOT EXISTS ewaste_management
    CHARACTER SET utf8mb4;
USE ewaste_management;

-- =====================================================
-- 1. USERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    phone VARCHAR(32),
    address VARCHAR(255) NOT NULL DEFAULT '',
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. ADMINS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS Admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. WASTE CATEGORIES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS Waste_Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- =====================================================
-- 4. RECYCLING CENTERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS Recycling_Centers (
    center_id INT AUTO_INCREMENT PRIMARY KEY,
    center_name VARCHAR(150) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(254) UNIQUE
);

-- =====================================================
-- 5. COLLECTION REQUESTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS Collection_Requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pickup_date DATE NOT NULL,
    collection_method ENUM('Pickup', 'Drop-off') NOT NULL DEFAULT 'Pickup',
    address VARCHAR(500) NOT NULL,
    contact_phone VARCHAR(32),
    notes TEXT,
    status ENUM(
        'Pending',
        'Approved',
        'Rejected',
        'Scheduled',
        'Collected',
        'Processing',
        'Completed',
        'Cancelled'
    ) NOT NULL DEFAULT 'Pending',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    INDEX idx_requests_user_date (user_id, request_date),
    INDEX idx_requests_status_date (status, pickup_date)
);

-- =====================================================
-- 6. REQUEST STATUS HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS Request_Status_History (
    history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    status ENUM(
        'Pending',
        'Approved',
        'Rejected',
        'Scheduled',
        'Collected',
        'Processing',
        'Completed',
        'Cancelled'
    ) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(100) NOT NULL,

    FOREIGN KEY (request_id)
        REFERENCES Collection_Requests(request_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_request_history (request_id, changed_at)
);

-- =====================================================
-- 7. REQUEST ITEMS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS Request_Items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    category_id INT NOT NULL,
    item_description VARCHAR(255),
    quantity INT NOT NULL DEFAULT 1,
    estimated_weight DECIMAL(10,2),

    FOREIGN KEY (request_id)
        REFERENCES Collection_Requests(request_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    FOREIGN KEY (category_id)
        REFERENCES Waste_Categories(category_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CHECK (quantity > 0),
    CHECK (estimated_weight IS NULL OR estimated_weight > 0)
);

-- =====================================================
-- 8. COLLECTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS Collections (
    collection_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL UNIQUE,
    center_id INT NOT NULL,
    collected_date DATE,
    actual_weight DECIMAL(10,2),

    collection_status ENUM(
        'Scheduled',
        'Collected',
        'Failed'
    ) DEFAULT 'Scheduled',

    FOREIGN KEY (request_id)
        REFERENCES Collection_Requests(request_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    FOREIGN KEY (center_id)
        REFERENCES Recycling_Centers(center_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CHECK (actual_weight IS NULL OR actual_weight > 0)
);

-- =====================================================
-- 9. RECYCLING RECORDS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS Recycling_Records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    collection_id INT NOT NULL,
    processed_date DATE NOT NULL,
    recycled_weight DECIMAL(10,2) NOT NULL DEFAULT 0,
    disposed_weight DECIMAL(10,2) NOT NULL DEFAULT 0,
    outcome VARCHAR(255),

    FOREIGN KEY (collection_id)
        REFERENCES Collections(collection_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CHECK (recycled_weight >= 0),
    CHECK (disposed_weight >= 0)
);

-- =====================================================
-- 10. RECOVERED MATERIALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS Recovered_Materials (
    material_id INT AUTO_INCREMENT PRIMARY KEY,
    record_id INT NOT NULL,
    material_name VARCHAR(100) NOT NULL,
    recovered_weight DECIMAL(10,2) NOT NULL,

    FOREIGN KEY (record_id)
        REFERENCES Recycling_Records(record_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CHECK (recovered_weight > 0)
);

-- =====================================================
-- INSERT SAMPLE DATA
-- =====================================================

-- 1. USERS

INSERT INTO Users
(name, email, phone, address, password_hash)
VALUES
('Rahul Sharma', 'rahul@example.com',
 '9876500001', 'Jaipur, Rajasthan', 'scrypt$9bb570a2ba66c92b6051fe174954de07$da96253554f43db502fc017ea8159e406bdd7456dbba75403b0cea6ce68dfc6e1b368f0944ef46bd3f45eb2db9da9dc0d9b102aea73f17cd03bf258cbd679642'),

('Priya Verma', 'priya@example.com',
 '9876500002', 'Delhi, India', 'scrypt$3158583b2e0a97abf746e8448eae7ba3$2dd332a08d46889243c1575ecd5a1619771cbb84f0aae754d383d61adaf875227a0317982389babc50572085ba749f9dabddd931aef2a322c6b033e50d866130')

ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    password_hash = VALUES(password_hash);


-- 2. ADMINS

INSERT INTO Admins
(name, email, password_hash)
VALUES
('System Admin', 'admin@example.com',
 'scrypt$de37714ea7d87b9ba4f2472b4cf683ef$beecd8e4f0ec9886935af7774f5c1a5a169a1d633a0f0023f1228bec028083f2362bab79d3d0b6123d6a1a579c64a232aff82f100418db9b65e5165d076e0248')

ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    password_hash = VALUES(password_hash);


-- 3. WASTE CATEGORIES

INSERT INTO Waste_Categories
(category_name, description)
VALUES
('Computers', 'Desktop computers and laptops'),
('Mobile phones', 'Old and damaged mobile phones'),
('Batteries', 'Electronic device batteries'),
('Televisions', 'Old LCD and LED televisions'),
('Printers', 'Printers and scanners'),
('Cables', 'Electronic wires and cables'),
('Game consoles', 'Gaming consoles, controllers, and handheld gaming devices'),
('Audio equipment', 'Speakers, headphones, radios, and stereo equipment'),
('Cameras', 'Digital cameras, camcorders, lenses, and related accessories'),
('Small appliances', 'Small electric kitchen, grooming, and household appliances'),
('Networking equipment', 'Routers, modems, switches, and network accessories'),
('Wearables', 'Smartwatches, fitness trackers, and other electronic wearables'),
('Lamps and lighting', 'LED lamps and electronic lighting'),
('Other small electronics', 'Calculators, toys, power banks, and other small electronic devices')

ON DUPLICATE KEY UPDATE
    description = VALUES(description);


-- 4. RECYCLING CENTERS

INSERT INTO Recycling_Centers
(center_name, address, phone, email)
VALUES
('Green Earth Recycling', 'Jaipur, Rajasthan',
 '9876543210', 'green@example.com'),

('EcoTech Recycling Center', 'Delhi, India',
 '9876543211', 'ecotech@example.com')

ON DUPLICATE KEY UPDATE
    center_name = VALUES(center_name);


-- =====================================================
-- INSERT A SAMPLE COLLECTION REQUEST
-- =====================================================

INSERT INTO Collection_Requests
(user_id, pickup_date, collection_method, address, status)

SELECT
    u.user_id,
    '2026-10-20',
    'Pickup',
    'Jaipur, Rajasthan',
    'Collected'

FROM Users u

WHERE u.email = 'rahul@example.com'

AND NOT EXISTS (
    SELECT 1
    FROM Collection_Requests cr
    WHERE cr.user_id = u.user_id
      AND cr.pickup_date = '2026-10-20'
      AND cr.address = 'Jaipur, Rajasthan'
);

-- Record the sample request's current status in its audit history.
INSERT INTO Request_Status_History
(request_id, status, changed_at, changed_by)

SELECT
    cr.request_id,
    cr.status,
    cr.request_date,
    'Operations'

FROM Collection_Requests cr

JOIN Users u
    ON u.user_id = cr.user_id

WHERE u.email = 'rahul@example.com'
  AND cr.pickup_date = '2026-10-20'
  AND cr.address = 'Jaipur, Rajasthan'
  AND NOT EXISTS (
      SELECT 1
      FROM Request_Status_History rsh
      WHERE rsh.request_id = cr.request_id
  );


-- =====================================================
-- INSERT REQUEST ITEMS
-- =====================================================

-- Item 1: Computers

INSERT INTO Request_Items
(request_id, category_id, item_description,
 quantity, estimated_weight)

SELECT
    cr.request_id,
    wc.category_id,
    'Old desktop computers',
    2,
    12.50

FROM Collection_Requests cr

JOIN Users u
    ON u.user_id = cr.user_id

JOIN Waste_Categories wc
    ON wc.category_name = 'Computers'

WHERE u.email = 'rahul@example.com'
  AND cr.pickup_date = '2026-10-20'
  AND cr.address = 'Jaipur, Rajasthan'

AND NOT EXISTS (
    SELECT 1
    FROM Request_Items ri
    WHERE ri.request_id = cr.request_id
      AND ri.category_id = wc.category_id
      AND ri.item_description = 'Old desktop computers'
);


-- Item 2: Mobile phones

INSERT INTO Request_Items
(request_id, category_id, item_description,
 quantity, estimated_weight)

SELECT
    cr.request_id,
    wc.category_id,
    'Damaged mobile phones',
    3,
    1.50

FROM Collection_Requests cr

JOIN Users u
    ON u.user_id = cr.user_id

JOIN Waste_Categories wc
    ON wc.category_name = 'Mobile phones'

WHERE u.email = 'rahul@example.com'
  AND cr.pickup_date = '2026-10-20'
  AND cr.address = 'Jaipur, Rajasthan'

AND NOT EXISTS (
    SELECT 1
    FROM Request_Items ri
    WHERE ri.request_id = cr.request_id
      AND ri.category_id = wc.category_id
      AND ri.item_description = 'Damaged mobile phones'
);


-- =====================================================
-- INSERT COLLECTION
-- =====================================================

INSERT INTO Collections
(request_id, center_id, collected_date,
 actual_weight, collection_status)

SELECT
    cr.request_id,
    rc.center_id,
    '2026-10-20',
    14.00,
    'Collected'

FROM Collection_Requests cr

JOIN Users u
    ON u.user_id = cr.user_id

JOIN Recycling_Centers rc
    ON rc.email = 'green@example.com'

WHERE u.email = 'rahul@example.com'
  AND cr.pickup_date = '2026-10-20'
  AND cr.address = 'Jaipur, Rajasthan'

ON DUPLICATE KEY UPDATE
    center_id = VALUES(center_id);


-- =====================================================
-- INSERT RECYCLING RECORD
-- =====================================================

INSERT INTO Recycling_Records
(collection_id, processed_date,
 recycled_weight, disposed_weight, outcome)

SELECT
    c.collection_id,
    '2026-10-21',
    10.00,
    4.00,
    'Copper recovered; remaining waste safely disposed'

FROM Collections c

JOIN Collection_Requests cr
    ON cr.request_id = c.request_id

JOIN Users u
    ON u.user_id = cr.user_id

WHERE u.email = 'rahul@example.com'
  AND cr.pickup_date = '2026-10-20'
  AND cr.address = 'Jaipur, Rajasthan'

AND NOT EXISTS (
    SELECT 1
    FROM Recycling_Records rr
    WHERE rr.collection_id = c.collection_id
      AND rr.processed_date = '2026-10-21'
);


-- =====================================================
-- INSERT RECOVERED MATERIALS
-- =====================================================

INSERT INTO Recovered_Materials
(record_id, material_name, recovered_weight)

SELECT
    rr.record_id,
    'Copper',
    2.00

FROM Recycling_Records rr

JOIN Collections c
    ON c.collection_id = rr.collection_id

JOIN Collection_Requests cr
    ON cr.request_id = c.request_id

JOIN Users u
    ON u.user_id = cr.user_id

WHERE u.email = 'rahul@example.com'
  AND cr.pickup_date = '2026-10-20'
  AND cr.address = 'Jaipur, Rajasthan'
  AND rr.processed_date = '2026-10-21'

AND NOT EXISTS (
    SELECT 1
    FROM Recovered_Materials rm
    WHERE rm.record_id = rr.record_id
      AND rm.material_name = 'Copper'
);


-- =====================================================
-- DISPLAY ALL TABLES
-- =====================================================

SHOW TABLES;


-- 1. Display Users
SELECT * FROM Users;


-- 2. Display Admins
SELECT * FROM Admins;


-- 3. Display Waste Categories
SELECT * FROM Waste_Categories;


-- 4. Display Recycling Centers
SELECT * FROM Recycling_Centers;


-- 5. Display Collection Requests
SELECT * FROM Collection_Requests;


-- 6. Display Request Items
SELECT * FROM Request_Items;


-- 7. Display Collections
SELECT * FROM Collections;


-- 8. Display Recycling Records
SELECT * FROM Recycling_Records;


-- 9. Display Recovered Materials
SELECT * FROM Recovered_Materials;


-- 10. Display request status history
SELECT * FROM Request_Status_History;
