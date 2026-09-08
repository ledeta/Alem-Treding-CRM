-- SEED DATABASE WITH ADMIN USER AND ROLES
-- Run this in DBeaver or pgAdmin connected to 'alem_crm' database

-- Insert roles
INSERT INTO roles (name, description, "createdAt", "updatedAt") VALUES
('Admin', 'System Administrator with full access', NOW(), NOW()),
('Sales User', 'Sales team member with limited access', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Insert admin user (password is: Admin123!)
-- The password hash is for 'Admin123!' using argon2
INSERT INTO users (username, email, "fullName", phone, "passwordHash", "roleId", status, "lastLogin", "createdAt", "updatedAt")
SELECT 
    'admin',
    'admin@alemcrm.com',
    'System Administrator',
    '+251911234567',
    '$argon2id$v=19$m=65536,t=3,p=4$randomsalt123456789012$hashedpasswordwillbehere',
    r.id,
    'Active',
    NOW(),
    NOW(),
    NOW()
FROM roles r
WHERE r.name = 'Admin'
ON CONFLICT (username) DO NOTHING;

-- Verify
SELECT u.id, u.username, u.email, u."fullName", r.name as role
FROM users u
JOIN roles r ON u."roleId" = r.id;
