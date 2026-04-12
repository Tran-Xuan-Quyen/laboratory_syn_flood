-- ==========================================
-- CHATBOT AI DATABASE INITIALIZATION SCRIPT
-- PostgreSQL
-- ==========================================

-- Drop tables if exist (in reverse order of dependencies)
DROP TABLE IF EXISTS tokens CASCADE;
DROP TABLE IF EXISTS access_logs CASCADE;
DROP TABLE IF EXISTS user_projects CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS file_uploads CASCADE;
DROP TABLE IF EXISTS bot_configurations CASCADE;
DROP TABLE IF EXISTS promts CASCADE;
DROP TABLE IF EXISTS domains CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- ==========================================
-- TABLE: roles
-- ==========================================
CREATE TABLE roles (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- ==========================================
-- TABLE: projects
-- ==========================================
CREATE TABLE projects (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    application_domain VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABLE: domains
-- ==========================================
CREATE TABLE domains (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    domain_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABLE: promts
-- ==========================================
CREATE TABLE promts (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    promt_name VARCHAR(255) NOT NULL,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    promt_status INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABLE: bot_configurations
-- ==========================================
CREATE TABLE bot_configurations (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    promts_id INT REFERENCES promts(id) ON DELETE CASCADE,
    personality VARCHAR(255),
    start_suggestions TEXT,
    greeting TEXT,
    application_domains TEXT[],
    header_title VARCHAR(255),
    header_title_color VARCHAR(7),
    background_color VARCHAR(7),
    logo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABLE: file_uploads
-- ==========================================
CREATE TABLE file_uploads (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    promt_id INT REFERENCES promts(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255),
    file_size INT,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABLE: users
-- ==========================================
CREATE TABLE users (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id INT REFERENCES roles(id) ON DELETE SET NULL,
    project_id INT REFERENCES projects(id) ON DELETE SET NULL,
    gender INT,
    birth TIMESTAMP,
    image VARCHAR(500),
    phone_number VARCHAR(500),
    status_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABLE: user_projects
-- ==========================================
CREATE TABLE user_projects (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    project_id INT REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, project_id)
);

-- ==========================================
-- TABLE: access_logs
-- ==========================================
CREATE TABLE access_logs (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TABLE: tokens
-- ==========================================
CREATE TABLE tokens (
    id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(1000) NOT NULL,
    expired_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- INDEXES
-- ==========================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_domains_project_id ON domains(project_id);
CREATE INDEX idx_promts_project_id ON promts(project_id);
CREATE INDEX idx_bot_configurations_promts_id ON bot_configurations(promts_id);
CREATE INDEX idx_file_uploads_promt_id ON file_uploads(promt_id);
CREATE INDEX idx_user_projects_user_id ON user_projects(user_id);
CREATE INDEX idx_user_projects_project_id ON user_projects(project_id);
CREATE INDEX idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX idx_tokens_user_id ON tokens(user_id);

-- ==========================================
-- INITIAL DATA: Roles
-- ==========================================
INSERT INTO roles (role_name) VALUES 
    ('admin'),
    ('user'),
    ('manager');

-- ==========================================
-- INITIAL DATA: Projects
-- ==========================================
INSERT INTO projects (project_name, application_domain, description, created_at, updated_at)
VALUES 
    ('Project_1', 'https://example.com', NULL, '2025-05-27 09:18:06.399', '2025-05-27 09:18:06.399'),
    ('Project_3', 'https://example.com', NULL, '2025-05-27 09:26:25.350', '2025-05-27 09:26:25.350');

-- ==========================================
-- INITIAL DATA: Users
-- ==========================================
INSERT INTO users (email, password_hash, full_name, role_id, project_id, gender, birth, image, phone_number, status_id, created_at, updated_at)
VALUES (
    'test@gmail.com',
    '$2b$10$O5wyQhDf48tIetzTHvPFJu9Ug1aZ/TUnaNcCRaZHbdbEv1UPLZfT2',
    'test name',
    1,
    NULL,
    1,
    '2000-05-15 09:02:04',
    NULL,
    '1111111111',
    1,
    '2025-05-15 09:02:22',
    '2025-05-15 09:02:26'
);
