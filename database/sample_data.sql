-- ============================================================
-- Leave Management System - Sample Data
-- Run this AFTER the backend has started at least once
-- (so the `users` / `leaves` tables already exist).
-- ============================================================

USE leave_management_system;

-- Note: the backend automatically creates a default ADMIN on first run
-- using the values in application.properties (app.default-admin.*):
--   email:    admin@lms.com
--   password: Admin@123
--
-- The INSERTs below add a few sample employees.
-- Password for ALL sample employees below is:  password
-- (hash generated with Spring Security's BCryptPasswordEncoder)

INSERT INTO users (name, email, password, role, created_at) VALUES
('Alice Johnson', 'alice@lms.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'USER', NOW()),
('Bob Smith',     'bob@lms.com',   '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'USER', NOW()),
('Carol Davis',   'carol@lms.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'USER', NOW()),
('David Lee',     'david@lms.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'USER', NOW());

-- Sample leaves (dates are relative examples - adjust as needed)
INSERT INTO leaves (user_id, title, reason, start_date, end_date, status, created_at, updated_at)
SELECT id, 'Family Vacation', 'Annual family trip', DATE_ADD(CURDATE(), INTERVAL 10 DAY), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'PLANNED', NOW(), NOW()
FROM users WHERE email = 'alice@lms.com';

INSERT INTO leaves (user_id, title, reason, start_date, end_date, status, created_at, updated_at)
SELECT id, 'Medical Appointment', 'Routine health check-up', DATE_ADD(CURDATE(), INTERVAL 12 DAY), DATE_ADD(CURDATE(), INTERVAL 12 DAY), 'PLANNED', NOW(), NOW()
FROM users WHERE email = 'bob@lms.com';

INSERT INTO leaves (user_id, title, reason, start_date, end_date, status, created_at, updated_at)
SELECT id, 'Personal Time Off', 'Personal errands', DATE_ADD(CURDATE(), INTERVAL 20 DAY), DATE_ADD(CURDATE(), INTERVAL 22 DAY), 'PLANNED', NOW(), NOW()
FROM users WHERE email = 'carol@lms.com';
