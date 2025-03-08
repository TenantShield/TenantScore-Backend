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
