-- Deployment Portal Database Setup Script
-- PostgreSQL 15+ Compatible
-- Run this script as a database administrator

-- Step 1: Create Database and User
CREATE DATABASE deployment_portal;
CREATE USER deployment_user WITH PASSWORD 'DeploymentPortal2025!';
GRANT ALL PRIVILEGES ON DATABASE deployment_portal TO deployment_user;

-- Connect to the new database (run \c deployment_portal; in psql)

-- Step 2: Create Tables

-- Users table - Role-based access control
CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('developer', 'admin', 'superadmin'))
);

CREATE INDEX idx_users_role ON users(role);

-- Services table - Catalog of deployable services
CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE INDEX idx_services_name ON services(name);

-- Releases table - Release management (YYYY-MM format)
CREATE TABLE releases (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(7) NOT NULL UNIQUE CHECK (name ~ '^[0-9]{4}-[0-9]{2}$'),
    description TEXT NOT NULL
);

CREATE INDEX idx_releases_name ON releases(name);

-- Deployment table - Core deployment tracking
CREATE TABLE deployment (
    id BIGSERIAL PRIMARY KEY,
    serial_number VARCHAR(20) UNIQUE,
    csi_id VARCHAR(50),
    service VARCHAR(100) NOT NULL,
    request_id VARCHAR(100),
    upcoming_branch VARCHAR(200),
    is_config BOOLEAN DEFAULT FALSE,
    config_request_id VARCHAR(100),
    upcoming_config_branch VARCHAR(200),
    release_branch VARCHAR(200),
    team VARCHAR(100),
    date_requested TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    release VARCHAR(7),
    status VARCHAR(20) DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Pending', 'Completed')),
    created_by VARCHAR(50),
    rlm_id_uat1 VARCHAR(50),
    rlm_id_uat2 VARCHAR(50),
    rlm_id_uat3 VARCHAR(50),
    rlm_id_perf1 VARCHAR(50),
    rlm_id_perf2 VARCHAR(50),
    rlm_id_prod1 VARCHAR(50),
    rlm_id_prod2 VARCHAR(50),
    production_ready BOOLEAN DEFAULT FALSE
);

-- Indexes for deployment table
CREATE INDEX idx_deployment_service ON deployment(service);
CREATE INDEX idx_deployment_status ON deployment(status);
CREATE INDEX idx_deployment_release ON deployment(release);
CREATE INDEX idx_deployment_created_by ON deployment(created_by);
CREATE INDEX idx_deployment_team ON deployment(team);
CREATE INDEX idx_deployment_date_requested ON deployment(date_requested);

-- Deployment environments table - Many-to-many for environments
CREATE TABLE deployment_environments (
    deployment_id BIGINT NOT NULL,
    environments VARCHAR(10) NOT NULL CHECK (environments IN ('UAT1', 'UAT2', 'UAT3', 'PERF1', 'PERF2', 'PROD1', 'PROD2'))
);

CREATE INDEX idx_deployment_environments_deployment_id ON deployment_environments(deployment_id);
CREATE INDEX idx_deployment_environments_environments ON deployment_environments(environments);

-- Step 3: Add Foreign Key Constraints
ALTER TABLE deployment ADD CONSTRAINT fk_deployment_created_by 
    FOREIGN KEY (created_by) REFERENCES users(username);

ALTER TABLE deployment_environments ADD CONSTRAINT fk_deployment_environments_deployment_id 
    FOREIGN KEY (deployment_id) REFERENCES deployment(id) ON DELETE CASCADE;

-- Step 4: Grant Permissions
GRANT ALL ON SCHEMA public TO deployment_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO deployment_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO deployment_user;

-- Step 5: Insert Initial Data

-- Initial users (change passwords before production use!)
INSERT INTO users (username, password, role) VALUES 
('admin', 'admin123', 'admin'),
('developer1', 'dev123', 'developer'),
('superadmin', 'super123', 'superadmin');

-- Initial releases
INSERT INTO releases (name, description) VALUES 
('2025-01', 'January 2025 Release - New authentication features'),
('2025-02', 'February 2025 Release - Payment system enhancements'),
('2025-03', 'March 2025 Release - User experience improvements');

-- Sample services (180 services following aaa-bbb-ccc format)
INSERT INTO services (name) VALUES
-- Authentication Services
('auth-login-service'), ('auth-logout-service'), ('auth-token-service'), ('auth-session-service'), ('auth-oauth-service'),
('auth-ldap-service'), ('auth-saml-service'), ('auth-jwt-service'), ('auth-mfa-service'), ('auth-sso-service'),

-- Payment Services  
('pay-gateway-service'), ('pay-processor-service'), ('pay-validation-service'), ('pay-refund-service'), ('pay-settlement-service'),
('pay-currency-service'), ('pay-fraud-service'), ('pay-billing-service'), ('pay-invoice-service'), ('pay-subscription-service'),

-- User Management Services
('user-profile-service'), ('user-auth-service'), ('user-register-service'), ('user-update-service'), ('user-delete-service'),
('user-search-service'), ('user-verify-service'), ('user-suspend-service'), ('user-restore-service'), ('user-migrate-service'),

-- Notification Services
('notif-email-service'), ('notif-sms-service'), ('notif-push-service'), ('notif-template-service'), ('notif-queue-service'),
('notif-delivery-service'), ('notif-schedule-service'), ('notif-history-service'), ('notif-preference-service'), ('notif-analytics-service'),

-- Data Services
('data-sync-service'), ('data-backup-service'), ('data-restore-service'), ('data-migration-service'), ('data-validation-service'),
('data-transform-service'), ('data-analytics-service'), ('data-export-service'), ('data-import-service'), ('data-archive-service'),

-- API Services
('api-gateway-service'), ('api-rate-service'), ('api-monitor-service'), ('api-version-service'), ('api-security-service'),
('api-cache-service'), ('api-proxy-service'), ('api-transform-service'), ('api-validate-service'), ('api-document-service'),

-- Security Services
('sec-encrypt-service'), ('sec-decrypt-service'), ('sec-hash-service'), ('sec-verify-service'), ('sec-audit-service'),
('sec-policy-service'), ('sec-compliance-service'), ('sec-scan-service'), ('sec-monitor-service'), ('sec-alert-service'),

-- File Services
('file-upload-service'), ('file-download-service'), ('file-storage-service'), ('file-compress-service'), ('file-convert-service'),
('file-preview-service'), ('file-search-service'), ('file-share-service'), ('file-backup-service'), ('file-sync-service'),

-- Reporting Services
('report-generate-service'), ('report-schedule-service'), ('report-export-service'), ('report-template-service'), ('report-data-service'),
('report-chart-service'), ('report-dashboard-service'), ('report-alert-service'), ('report-archive-service'), ('report-share-service'),

-- Workflow Services
('flow-orchestrate-service'), ('flow-execute-service'), ('flow-monitor-service'), ('flow-schedule-service'), ('flow-retry-service'),
('flow-approval-service'), ('flow-escalate-service'), ('flow-audit-service'), ('flow-template-service'), ('flow-optimize-service'),

-- Integration Services
('int-connector-service'), ('int-transform-service'), ('int-route-service'), ('int-queue-service'), ('int-batch-service'),
('int-stream-service'), ('int-sync-service'), ('int-validate-service'), ('int-monitor-service'), ('int-error-service'),

-- Configuration Services
('config-manage-service'), ('config-deploy-service'), ('config-validate-service'), ('config-backup-service'), ('config-restore-service'),
('config-version-service'), ('config-encrypt-service'), ('config-audit-service'), ('config-template-service'), ('config-sync-service'),

-- Monitoring Services
('mon-health-service'), ('mon-metrics-service'), ('mon-alerts-service'), ('mon-dashboard-service'), ('mon-logging-service'),
('mon-trace-service'), ('mon-performance-service'), ('mon-availability-service'), ('mon-capacity-service'), ('mon-incident-service'),

-- Cache Services
('cache-redis-service'), ('cache-memory-service'), ('cache-distributed-service'), ('cache-session-service'), ('cache-query-service'),
('cache-object-service'), ('cache-page-service'), ('cache-api-service'), ('cache-static-service'), ('cache-cdn-service'),

-- Search Services
('search-index-service'), ('search-query-service'), ('search-suggest-service'), ('search-analytics-service'), ('search-relevance-service'),
('search-facet-service'), ('search-filter-service'), ('search-ranking-service'), ('search-personalize-service'), ('search-optimize-service'),

-- Message Services
('msg-queue-service'), ('msg-topic-service'), ('msg-publish-service'), ('msg-subscribe-service'), ('msg-routing-service'),
('msg-transform-service'), ('msg-filter-service'), ('msg-batch-service'), ('msg-stream-service'), ('msg-retry-service'),

-- Analytics Services
('analytics-collect-service'), ('analytics-process-service'), ('analytics-report-service'), ('analytics-dashboard-service'), ('analytics-ml-service'),
('analytics-predict-service'), ('analytics-segment-service'), ('analytics-funnel-service'), ('analytics-cohort-service'), ('analytics-real-time-service'),

-- Content Services
('content-manage-service'), ('content-publish-service'), ('content-version-service'), ('content-review-service'), ('content-approve-service'),
('content-schedule-service'), ('content-archive-service'), ('content-search-service'), ('content-tag-service'), ('content-metadata-service'),

-- Inventory Services
('inv-track-service'), ('inv-update-service'), ('inv-reserve-service'), ('inv-allocate-service'), ('inv-adjust-service'),
('inv-audit-service'), ('inv-forecast-service'), ('inv-replenish-service'), ('inv-optimize-service'), ('inv-report-service'),

-- Order Services
('order-create-service'), ('order-update-service'), ('order-cancel-service'), ('order-fulfill-service'), ('order-ship-service'),
('order-track-service'), ('order-return-service'), ('order-refund-service'), ('order-invoice-service'), ('order-history-service');

-- Verification queries
SELECT 'Users created:' as info, count(*) as count FROM users;
SELECT 'Services created:' as info, count(*) as count FROM services;
SELECT 'Releases created:' as info, count(*) as count FROM releases;

-- Display table information
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, ordinal_position;

COMMIT;
