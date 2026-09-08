-- ALEM CRM SYSTEM - PostgreSQL Database Schema
-- Enterprise-Grade Relational Database Design
-- Optimized for performance, scalability, and data integrity

-- ============================================================================
-- 1. AUTHENTICATION & USER MANAGEMENT
-- ============================================================================

-- Roles table (Admin, Sales User)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    status VARCHAR(50) DEFAULT 'Active' CHECK (status IN ('Active', 'Suspended', 'Released', 'Terminated', 'Deleted')),
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id),
    CONSTRAINT valid_status CHECK (status IN ('Active', 'Suspended', 'Released', 'Terminated', 'Deleted'))
);

-- Refresh tokens for JWT
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(500) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_revoked BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- 2. CUSTOMER MANAGEMENT
-- ============================================================================

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    customer_id VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    email VARCHAR(255),
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Ethiopia',
    is_active BOOLEAN DEFAULT TRUE,
    source VARCHAR(50), -- 'Excel Import', 'Manual Entry', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_transaction_date TIMESTAMP,
    CONSTRAINT phone_or_id CHECK (phone IS NOT NULL OR customer_id IS NOT NULL)
);

-- Customer balance tracking
CREATE TABLE customer_balances (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    balance DECIMAL(15, 2) DEFAULT 0,
    credit_amount DECIMAL(15, 2) DEFAULT 0,
    refund_amount DECIMAL(15, 2) DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT balance_positive CHECK (balance >= -9999999.99)
);

-- ============================================================================
-- 3. INVENTORY MANAGEMENT
-- ============================================================================

CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    description TEXT,
    category VARCHAR(100),
    purchase_price DECIMAL(15, 2) NOT NULL,
    selling_price DECIMAL(15, 2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT prices_valid CHECK (purchase_price >= 0 AND selling_price >= 0)
);

-- Stock tracking
CREATE TABLE stock (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL UNIQUE REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT quantity_non_negative CHECK (quantity >= 0)
);

-- Stock transaction history
CREATE TABLE stock_transactions (
    id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES items(id),
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('In', 'Out', 'Adjustment', 'Return')),
    quantity INTEGER NOT NULL,
    reference_id INTEGER, -- Link to sales_transactions, refunds, etc.
    reference_type VARCHAR(50), -- 'Sale', 'Refund', etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. SALES & TRANSACTIONS
-- ============================================================================

CREATE TABLE sales_transactions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    item_id INTEGER NOT NULL REFERENCES items(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(15, 2) NOT NULL CHECK (unit_price > 0),
    total_price DECIMAL(15, 2) NOT NULL CHECK (total_price > 0),
    transaction_date TIMESTAMP NOT NULL,
    uploaded_file_id INTEGER REFERENCES uploaded_files(id),
    sales_user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_total CHECK (total_price = quantity * unit_price)
);

-- ============================================================================
-- 5. PAYMENT MANAGEMENT
-- ============================================================================

CREATE TABLE payment_requests (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    bank VARCHAR(100) NOT NULL CHECK (bank IN ('Telebirr', 'CBE', 'Dashen Bank', 'Awash Bank', 'Abyssinia Bank', 'Wegagen Bank', 'Siinqee Bank', 'Other')),
    reason TEXT,
    request_date TIMESTAMP NOT NULL,
    request_time TIME,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    approval_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. CREDIT MANAGEMENT
-- ============================================================================

CREATE TABLE credit_requests (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    credit_amount DECIMAL(15, 2) NOT NULL CHECK (credit_amount > 0),
    reason TEXT,
    request_date TIMESTAMP NOT NULL,
    request_time TIME,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    approval_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 7. REFUND MANAGEMENT
-- ============================================================================

CREATE TABLE refund_requests (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    item_id INTEGER NOT NULL REFERENCES items(id),
    sales_transaction_id INTEGER REFERENCES sales_transactions(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    refund_amount DECIMAL(15, 2) NOT NULL CHECK (refund_amount > 0),
    reason TEXT,
    request_date TIMESTAMP NOT NULL,
    request_time TIME,
    status VARCHAR(50) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    created_by INTEGER NOT NULL REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    approval_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 8. FILE UPLOADS
-- ============================================================================

CREATE TABLE uploaded_files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_size INTEGER,
    file_path VARCHAR(500),
    file_type VARCHAR(50) CHECK (file_type IN ('xlsx', 'xls')),
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processing_status VARCHAR(50) DEFAULT 'Processing' CHECK (processing_status IN ('Processing', 'Completed', 'Failed', 'Archived')),
    error_message TEXT,
    rows_processed INTEGER DEFAULT 0,
    rows_failed INTEGER DEFAULT 0,
    processing_summary JSONB
);

-- ============================================================================
-- 9. CHAT SYSTEM
-- ============================================================================

CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT,
    message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'emoji')),
    file_path VARCHAR(500), -- For images
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat message reactions (emojis)
CREATE TABLE chat_reactions (
    id SERIAL PRIMARY KEY,
    message_id INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_reaction UNIQUE (message_id, user_id)
);

-- ============================================================================
-- 10. NOTIFICATIONS
-- ============================================================================

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL CHECK (notification_type IN ('FileUpload', 'PaymentRequest', 'CreditRequest', 'RefundRequest', 'ApprovalResult', 'LowStock')),
    title VARCHAR(255) NOT NULL,
    message TEXT,
    related_entity_id INTEGER,
    related_entity_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 11. AUDIT & ACTIVITY LOGGING
-- ============================================================================

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id INTEGER,
    changes JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 12. CUSTOMER INACTIVITY TRACKING
-- ============================================================================

CREATE TABLE customer_no_visits (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL UNIQUE REFERENCES customers(id) ON DELETE CASCADE,
    last_visit_date TIMESTAMP,
    days_since_visit INTEGER,
    added_to_list_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT days_valid CHECK (days_since_visit >= 15)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- User indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_status ON users(status);

-- Customer indexes
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_customer_id ON customers(customer_id);
CREATE INDEX idx_customers_is_active ON customers(is_active);
CREATE INDEX idx_customers_last_transaction ON customers(last_transaction_date);

-- Item indexes
CREATE INDEX idx_items_sku ON items(sku);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_is_active ON items(is_active);

-- Stock indexes
CREATE INDEX idx_stock_item_id ON stock(item_id);

-- Transaction indexes
CREATE INDEX idx_sales_transactions_customer_id ON sales_transactions(customer_id);
CREATE INDEX idx_sales_transactions_item_id ON sales_transactions(item_id);
CREATE INDEX idx_sales_transactions_transaction_date ON sales_transactions(transaction_date);
CREATE INDEX idx_sales_transactions_uploaded_file ON sales_transactions(uploaded_file_id);

-- Payment request indexes
CREATE INDEX idx_payment_requests_customer_id ON payment_requests(customer_id);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);
CREATE INDEX idx_payment_requests_created_by ON payment_requests(created_by);

-- Credit request indexes
CREATE INDEX idx_credit_requests_customer_id ON credit_requests(customer_id);
CREATE INDEX idx_credit_requests_status ON credit_requests(status);
CREATE INDEX idx_credit_requests_created_by ON credit_requests(created_by);

-- Refund request indexes
CREATE INDEX idx_refund_requests_customer_id ON refund_requests(customer_id);
CREATE INDEX idx_refund_requests_status ON refund_requests(status);
CREATE INDEX idx_refund_requests_created_by ON refund_requests(created_by);

-- File upload indexes
CREATE INDEX idx_uploaded_files_uploaded_by ON uploaded_files(uploaded_by);
CREATE INDEX idx_uploaded_files_processing_status ON uploaded_files(processing_status);

-- Chat indexes
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);

-- Notification indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Audit log indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- INITIAL DATA - ROLES
-- ============================================================================

INSERT INTO roles (name, description) VALUES
('Admin', 'Administrator with full system access'),
('Sales User', 'Sales staff with limited access');

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Customer summary view
CREATE VIEW customer_summary AS
SELECT
    c.id,
    c.name,
    c.phone,
    c.customer_id,
    c.address,
    c.last_transaction_date,
    cb.balance,
    cb.credit_amount,
    cb.refund_amount,
    COUNT(DISTINCT st.id) as total_purchases,
    COALESCE(SUM(st.total_price), 0) as total_purchase_value
FROM customers c
LEFT JOIN customer_balances cb ON c.id = cb.customer_id
LEFT JOIN sales_transactions st ON c.id = st.customer_id
GROUP BY c.id, c.name, c.phone, c.customer_id, c.address, c.last_transaction_date, cb.balance, cb.credit_amount, cb.refund_amount;

-- Dashboard KPI view
CREATE VIEW dashboard_kpis AS
SELECT
    (SELECT COUNT(*) FROM customers WHERE is_active = TRUE) as total_customers,
    (SELECT COUNT(*) FROM items WHERE is_active = TRUE) as total_stock_items,
    COALESCE(SUM(cb.balance), 0) as total_assets,
    COALESCE(SUM(st.total_price), 0) as total_sales,
    COALESCE(SUM(cb.credit_amount), 0) as total_credit,
    COALESCE(SUM(cb.refund_amount), 0) as total_refund,
    (SELECT COUNT(*) FROM payment_requests WHERE status = 'Pending') as pending_payments,
    (SELECT COUNT(*) FROM customers WHERE EXTRACT(DAY FROM NOW() - last_transaction_date) >= 15) as no_visit_customers_15days,
    (COALESCE(SUM(st.total_price), 0) - 
     COALESCE((SELECT SUM(purchase_price * quantity) FROM stock s JOIN items i ON s.item_id = i.id), 0)) as net_profit
FROM customer_balances cb, sales_transactions st;

-- Pending approvals view
CREATE VIEW pending_approvals AS
SELECT
    'Payment' as request_type,
    id,
    customer_id,
    amount as request_amount,
    reason,
    request_date,
    created_by,
    status,
    created_at
FROM payment_requests
WHERE status = 'Pending'
UNION ALL
SELECT
    'Credit' as request_type,
    id,
    customer_id,
    credit_amount as request_amount,
    reason,
    request_date,
    created_by,
    status,
    created_at
FROM credit_requests
WHERE status = 'Pending'
UNION ALL
SELECT
    'Refund' as request_type,
    id,
    customer_id,
    refund_amount as request_amount,
    reason,
    request_date,
    created_by,
    status,
    created_at
FROM refund_requests
WHERE status = 'Pending';
