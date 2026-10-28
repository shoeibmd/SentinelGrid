-- SentinelGrid PostgreSQL Schema Definition

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users and Access Control
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'Viewer',
    mfa_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Assets and Endpoints
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(128) NOT NULL,
    hostname VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    os_type VARCHAR(32) NOT NULL,
    os_version VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'offline',
    agent_installed BOOLEAN DEFAULT FALSE,
    agent_version VARCHAR(64),
    tags TEXT[] DEFAULT '{}',
    group_name VARCHAR(64) DEFAULT 'Default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ping & Availability Monitors
CREATE TABLE IF NOT EXISTS ping_monitors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(128) NOT NULL,
    target VARCHAR(255) NOT NULL,
    port INTEGER,
    check_type VARCHAR(16) NOT NULL DEFAULT 'icmp',
    interval_seconds INTEGER NOT NULL DEFAULT 30,
    timeout_ms INTEGER NOT NULL DEFAULT 3000,
    warning_threshold_ms INTEGER NOT NULL DEFAULT 150,
    critical_threshold_ms INTEGER NOT NULL DEFAULT 400,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    last_latency_ms NUMERIC(10, 2),
    packet_loss_percent NUMERIC(5, 2) DEFAULT 0.0,
    last_check_at TIMESTAMP WITH TIME ZONE,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ping Check Time-Series History
CREATE TABLE IF NOT EXISTS ping_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    monitor_id UUID REFERENCES ping_monitors(id) ON DELETE CASCADE,
    latency_ms NUMERIC(10, 2) NOT NULL,
    status VARCHAR(32) NOT NULL,
    packet_loss_percent NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    message VARCHAR(255),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ping_history_monitor_id_recorded_at 
ON ping_history (monitor_id, recorded_at DESC);

-- Cyber Defense & Incidents
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
    severity VARCHAR(32) NOT NULL DEFAULT 'medium',
    status VARCHAR(32) NOT NULL DEFAULT 'new',
    response_level VARCHAR(32) NOT NULL DEFAULT 'alert_only',
    source VARCHAR(64) NOT NULL DEFAULT 'heuristic',
    forensic_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tamper-Evident Audit Logging
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    username VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    resource_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(128),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45) NOT NULL,
    hash_signature VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs (created_at DESC);

-- Integrations Configuration & State
CREATE TABLE IF NOT EXISTS integration_configs (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    display_name VARCHAR(128) NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    base_url VARCHAR(255) NOT NULL,
    credentials_json JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(32) NOT NULL DEFAULT 'unconfigured',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    summary TEXT
);
