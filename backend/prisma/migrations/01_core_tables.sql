-- ============================================================
-- FILE: migration/01_core_tables.sql
-- PURPOSE: Core table audit fields, tenant isolation, soft delete
-- SAFE: Additive only. No DROP. No TRUNCATE. Idempotent.
-- REQUIRES: 00_preflight.sql executed first
-- ============================================================
USE `amdox_db`;

SELECT '▶ Phase 1 — Core Tables' AS migration_log;

-- ══════════════════════════════════════════════════════════════
-- TABLE: tenants
-- ══════════════════════════════════════════════════════════════
SELECT '  → tenants' AS migration_log;
CALL add_column_if_not_exists('tenants', 'plan_type',       "`plan_type` VARCHAR(50) NOT NULL DEFAULT 'STANDARD' AFTER `tenant_name`");
CALL add_column_if_not_exists('tenants', 'is_active',       "`is_active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `plan_type`");
CALL add_column_if_not_exists('tenants', 'max_companies',   "`max_companies` INT NOT NULL DEFAULT 1 AFTER `is_active`");
CALL add_column_if_not_exists('tenants', 'updated_at',      "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('tenants', 'deleted_at',      "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('tenants', 'created_by',      "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('tenants', 'updated_by',      "`updated_by` BIGINT NULL DEFAULT NULL");

-- ══════════════════════════════════════════════════════════════
-- TABLE: companies
-- ══════════════════════════════════════════════════════════════
SELECT '  → companies' AS migration_log;
CALL add_column_if_not_exists('companies', 'industry',          "`industry` VARCHAR(100) NULL AFTER `company_type`");
CALL add_column_if_not_exists('companies', 'website',           "`website` VARCHAR(255) NULL AFTER `industry`");
CALL add_column_if_not_exists('companies', 'logo_url',          "`logo_url` VARCHAR(500) NULL AFTER `website`");
CALL add_column_if_not_exists('companies', 'address',           "`address` TEXT NULL AFTER `logo_url`");
CALL add_column_if_not_exists('companies', 'phone',             "`phone` VARCHAR(20) NULL AFTER `address`");
CALL add_column_if_not_exists('companies', 'email',             "`email` VARCHAR(255) NULL AFTER `phone`");
CALL add_column_if_not_exists('companies', 'tax_id',            "`tax_id` VARCHAR(100) NULL AFTER `email`");
CALL add_column_if_not_exists('companies', 'currency_code',     "`currency_code` VARCHAR(10) NOT NULL DEFAULT 'USD' AFTER `tax_id`");
CALL add_column_if_not_exists('companies', 'timezone',          "`timezone` VARCHAR(100) NOT NULL DEFAULT 'UTC' AFTER `currency_code`");
CALL add_column_if_not_exists('companies', 'fiscal_year_start', "`fiscal_year_start` TINYINT NOT NULL DEFAULT 1 COMMENT 'Month: 1=Jan, 4=Apr' AFTER `timezone`");
CALL add_column_if_not_exists('companies', 'is_active',         "`is_active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `fiscal_year_start`");
CALL add_column_if_not_exists('companies', 'updated_at',        "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('companies', 'deleted_at',        "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('companies', 'created_by',        "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('companies', 'updated_by',        "`updated_by` BIGINT NULL DEFAULT NULL");

-- ══════════════════════════════════════════════════════════════
-- TABLE: departments
-- ══════════════════════════════════════════════════════════════
SELECT '  → departments' AS migration_log;
CALL add_column_if_not_exists('departments', 'tenant_id',    "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `company_id`");
CALL add_column_if_not_exists('departments', 'head_user_id', "`head_user_id` BIGINT NULL DEFAULT NULL AFTER `description`");
CALL add_column_if_not_exists('departments', 'is_active',    "`is_active` TINYINT(1) NOT NULL DEFAULT 1");
CALL add_column_if_not_exists('departments', 'updated_at',   "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('departments', 'deleted_at',   "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('departments', 'updated_by',   "`updated_by` BIGINT NULL DEFAULT NULL");

-- Backfill tenant_id from parent company
UPDATE `departments` d
  JOIN `companies` c ON c.company_id = d.company_id
SET d.tenant_id = c.tenant_id
WHERE d.tenant_id IS NULL;

ALTER TABLE `departments` MODIFY COLUMN `tenant_id` BIGINT NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: roles
-- ══════════════════════════════════════════════════════════════
SELECT '  → roles' AS migration_log;
CALL add_column_if_not_exists('roles', 'is_system',   "`is_system` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=built-in system role, cannot be deleted'");
CALL add_column_if_not_exists('roles', 'tenant_id',   "`tenant_id` BIGINT NULL DEFAULT NULL COMMENT 'NULL = global system role available to all tenants'");
CALL add_column_if_not_exists('roles', 'created_at',  "`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('roles', 'updated_at',  "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('roles', 'deleted_at',  "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('roles', 'created_by',  "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('roles', 'updated_by',  "`updated_by` BIGINT NULL DEFAULT NULL");

-- Mark built-in roles as system roles
UPDATE `roles`
SET `is_system` = 1
WHERE `role_name` IN ('Company Head / CEO', 'Department Head', 'Employee', 'Super Admin', 'Company Admin', 'Supervisor');

-- ══════════════════════════════════════════════════════════════
-- TABLE: permissions
-- ══════════════════════════════════════════════════════════════
SELECT '  → permissions' AS migration_log;
CALL add_column_if_not_exists('permissions', 'module',      "`module` VARCHAR(100) NULL COMMENT 'Owning module: hrms, crm, finance, projects, inventory'");
CALL add_column_if_not_exists('permissions', 'description', "`description` VARCHAR(500) NULL");
CALL add_column_if_not_exists('permissions', 'created_at',  "`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");

-- ══════════════════════════════════════════════════════════════
-- TABLE: users
-- ══════════════════════════════════════════════════════════════
SELECT '  → users' AS migration_log;
CALL add_column_if_not_exists('users', 'tenant_id',       "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `company_id`");
CALL add_column_if_not_exists('users', 'avatar_url',      "`avatar_url` VARCHAR(500) NULL AFTER `phone`");
CALL add_column_if_not_exists('users', 'locale',          "`locale` VARCHAR(10) NOT NULL DEFAULT 'en' AFTER `avatar_url`");
CALL add_column_if_not_exists('users', 'timezone',        "`timezone` VARCHAR(100) NULL AFTER `locale`");
CALL add_column_if_not_exists('users', 'last_login_at',   "`last_login_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('users', 'updated_at',      "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('users', 'deleted_at',      "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('users', 'created_by',      "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('users', 'updated_by',      "`updated_by` BIGINT NULL DEFAULT NULL");

-- Backfill tenant_id
UPDATE `users` u
  JOIN `companies` c ON c.company_id = u.company_id
SET u.tenant_id = c.tenant_id
WHERE u.tenant_id IS NULL;

ALTER TABLE `users` MODIFY COLUMN `tenant_id` BIGINT NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: email_verifications
-- ══════════════════════════════════════════════════════════════
SELECT '  → email_verifications' AS migration_log;
CALL add_column_if_not_exists('email_verifications', 'tenant_id',  "`tenant_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('email_verifications', 'purpose',    "`purpose` VARCHAR(50) NOT NULL DEFAULT 'REGISTRATION' COMMENT 'REGISTRATION | PASSWORD_RESET'");
CALL add_column_if_not_exists('email_verifications', 'updated_at', "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

-- ══════════════════════════════════════════════════════════════
-- TABLE: refresh_tokens
-- ══════════════════════════════════════════════════════════════
SELECT '  → refresh_tokens' AS migration_log;
CALL add_column_if_not_exists('refresh_tokens', 'tenant_id',    "`tenant_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('refresh_tokens', 'user_agent',   "`user_agent` VARCHAR(500) NULL");
CALL add_column_if_not_exists('refresh_tokens', 'ip_address',   "`ip_address` VARCHAR(45) NULL");
CALL add_column_if_not_exists('refresh_tokens', 'last_used_at', "`last_used_at` DATETIME NULL DEFAULT NULL");

-- ══════════════════════════════════════════════════════════════
-- TABLE: audit_logs
-- ══════════════════════════════════════════════════════════════
SELECT '  → audit_logs' AS migration_log;
CALL add_column_if_not_exists('audit_logs', 'tenant_id',    "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `log_id`");
CALL add_column_if_not_exists('audit_logs', 'company_id',   "`company_id` BIGINT NULL DEFAULT NULL AFTER `tenant_id`");
CALL add_column_if_not_exists('audit_logs', 'user_agent',   "`user_agent` VARCHAR(500) NULL");
CALL add_column_if_not_exists('audit_logs', 'http_method',  "`http_method` VARCHAR(10) NULL");
CALL add_column_if_not_exists('audit_logs', 'endpoint',     "`endpoint` VARCHAR(500) NULL");
CALL add_column_if_not_exists('audit_logs', 'status_code',  "`status_code` SMALLINT NULL");
CALL add_column_if_not_exists('audit_logs', 'duration_ms',  "`duration_ms` INT NULL COMMENT 'Request processing time in ms'");

SELECT '✓ Phase 1 — Core Tables complete.' AS migration_log;
