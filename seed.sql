-- Users
INSERT INTO users (firstname, middlename, surname, email, password_hash, phone, role) VALUES
('Alice', 'M.', 'Johnson', 'alice@example.com', '$2b$10$hashedpassword1', '1234567890', 'admin'),
('Bob', 'J.', 'Smith', 'bob@example.com', '$2b$10$hashedpassword2', '0987654321', 'landlord'),
('Charlie', 'K.', 'Brown', 'charlie@example.com', '$2b$10$hashedpassword3', '1122334455', 'tenant');

-- Properties
INSERT INTO properties (landlord_id, title, address, city, state, zip_code, rent_amount, description) VALUES
(2, 'Cozy Apartment', '123 Main St', 'New York', 'NY', '10001', 1500.00, 'A beautiful one-bedroom apartment in downtown.'),
(2, 'Spacious Loft', '456 Elm St', 'Los Angeles', 'CA', '90001', 2200.00, 'A modern loft with great city views.');

-- Applications
INSERT INTO applications (tenant_id, property_id, status) VALUES
(3, 1, 'pending'),
(3, 2, 'approved');

-- Background Checks
INSERT INTO background_checks (application_id, credit_score, criminal_record, eviction_history, employment_verified) VALUES
(1, 720, FALSE, FALSE, TRUE),
(2, 680, FALSE, TRUE, TRUE);

-- Payments
INSERT INTO payments (tenant_id, amount, payment_status, transaction_id) VALUES
(3, 1500.00, 'completed', 'txn123456789'),
(3, 2200.00, 'pending', 'txn987654321');

-- Messages
INSERT INTO messages (sender_id, receiver_id, content) VALUES
(3, 2, 'Hello, I am interested in renting the apartment.'),
(2, 3, 'Hi Charlie, I will review your application soon.');

-- Documents
INSERT INTO documents (tenant_id, file_name, file_url) VALUES
(3, 'rental_agreement.pdf', 'https://example.com/documents/rental_agreement.pdf'),
(3, 'pay_stubs.pdf', 'https://example.com/documents/pay_stubs.pdf');
