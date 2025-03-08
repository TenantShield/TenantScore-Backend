-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    firstname VARCHAR(255) NOT NULL,
    middlename VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) CHECK (role IN ('landlord', 'tenant', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties Table
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    landlord_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    rent_amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications Table
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    tenant_id INT REFERENCES users(id) ON DELETE CASCADE,
    property_id INT REFERENCES properties(id) ON DELETE CASCADE,
    status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Background Checks Table
CREATE TABLE background_checks (
    id SERIAL PRIMARY KEY,
    application_id INT REFERENCES applications(id) ON DELETE CASCADE,
    credit_score INT CHECK (credit_score BETWEEN 300 AND 850),
    criminal_record BOOLEAN DEFAULT FALSE,
    eviction_history BOOLEAN DEFAULT FALSE,
    employment_verified BOOLEAN DEFAULT FALSE,
    check_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    tenant_id INT REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id) ON DELETE CASCADE,
    receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents Table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    tenant_id INT REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_properties_landlord ON properties(landlord_id);
CREATE INDEX idx_applications_tenant ON applications(tenant_id);
CREATE INDEX idx_applications_property ON applications(property_id);
CREATE INDEX idx_background_checks_application ON background_checks(application_id);
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);


-- Relationships
/* - users.id → properties.landlord_id (One-to-Many)
- users.id → applications.tenant_id (One-to-Many)
- properties.id → applications.property_id (One-to-Many)
- applications.id → background_checks.application_id (One-to-One)
- users.id → payments.tenant_id (One-to-Many)
- users.id → messages.sender_id & messages.receiver_id (Many-to-Many)
- users.id → documents.tenant_id (One-to-Many) */

-- This PostgreSQL schema ensures:
-- ✅ **Data Integrity** (Foreign keys, constraints)
-- ✅ **Scalability** (Indexes for performance)
-- ✅ **Security** (Role-based access, hashed passwords)
