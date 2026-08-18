CREATE DATABASE IF NOT EXISTS leave_management_system;
USE leave_management_system;

-- ------------------------------------------------------------
-- Users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)  NOT NULL,
    email       VARCHAR(150)  NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    role        VARCHAR(20)   NOT NULL,        -- ADMIN or USER
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Leaves
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS leaves (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT        NOT NULL,
    title       VARCHAR(150)  NOT NULL,
    reason      VARCHAR(500)  NOT NULL,
    start_date  DATE          NOT NULL,
    end_date    DATE          NOT NULL,
    status      VARCHAR(20)   NOT NULL DEFAULT 'PLANNED',  -- PLANNED or CANCELLED
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_leaves_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE  --on delete cascade is to delete all the records when the user is deleted
);

--user id x can have many rows in leaves all pointing back to the same x, which is a one-to-many relationship.
