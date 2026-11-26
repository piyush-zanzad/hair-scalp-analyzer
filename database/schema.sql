-- ==========================================
-- AI Hair & Scalp Diagnostics System Schema
-- Dialect: PostgreSQL
-- ==========================================

-- Enable UUID extension if required
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    gender VARCHAR(50) DEFAULT 'male',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Scans Table
CREATE TABLE IF NOT EXISTS scans (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    image_path VARCHAR(500) NOT NULL,
    heatmap_path VARCHAR(500),
    lighting_score FLOAT,
    blur_score FLOAT,
    quality_passed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scans_user_id ON scans(user_id);

-- 3. Predictions Table
CREATE TABLE IF NOT EXISTS predictions (
    id VARCHAR(36) PRIMARY KEY,
    scan_id VARCHAR(36) NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL, -- 'hair_loss' or 'scalp_disease'
    label VARCHAR(100) NOT NULL,
    confidence FLOAT NOT NULL,
    severity VARCHAR(50),
    explanation TEXT,
    recommendations JSON
);

CREATE INDEX IF NOT EXISTS idx_predictions_scan_id ON predictions(scan_id);

-- 4. Reports Table
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(36) PRIMARY KEY,
    scan_id VARCHAR(36) UNIQUE NOT NULL REFERENCES scans(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_notes TEXT,
    pdf_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_scan_id ON reports(scan_id);
