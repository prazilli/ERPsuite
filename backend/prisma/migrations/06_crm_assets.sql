-- ============================================================
-- FILE: migration/06_crm_assets.sql
-- PURPOSE: CRM and Asset Management module upgrades
-- SAFE: Additive only. No DROP. No TRUNCATE. Idempotent.
-- REQUIRES: 00_preflight.sql + 01_core_tables.sql
-- ============================================================
USE `amdox_db`;

SELECT '▶ Phase 6 — CRM & Asset Management' AS migration_log;

-- ══════════════════════════════════════════════════════════════
-- TABLE: leads
-- ══════════════════════════════════════════════════════════════
SELECT '  → leads' AS migration_log;
CALL add_column_if_not_exists('leads', 'tenant_id',        "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `lead_id`");
CALL add_column_if_not_exists('leads', 'department_id',    "`department_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('leads', 'assigned_to_id',   "`assigned_to_id` BIGINT NULL DEFAULT NULL COMMENT 'Sales rep assigned'");
CALL add_column_if_not_exists('leads', 'contact_name',     "`contact_name` VARCHAR(255) NULL COMMENT 'Full name of the lead contact person'");
CALL add_column_if_not_exists('leads', 'company_name',     "`company_name` VARCHAR(255) NULL COMMENT 'Lead company or organization'");
CALL add_column_if_not_exists('leads', 'website',          "`website` VARCHAR(255) NULL");
CALL add_column_if_not_exists('leads', 'country',          "`country` VARCHAR(100) NULL");
CALL add_column_if_not_exists('leads', 'industry',         "`industry` VARCHAR(100) NULL");
CALL add_column_if_not_exists('leads', 'notes',            "`notes` TEXT NULL");
CALL add_column_if_not_exists('leads', 'next_follow_up',   "`next_follow_up` DATE NULL");
CALL add_column_if_not_exists('leads', 'converted_at',     "`converted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('leads', 'client_id',        "`client_id` BIGINT NULL DEFAULT NULL COMMENT 'Set on successful conversion'");
CALL add_column_if_not_exists('leads', 'currency_code',    "`currency_code` VARCHAR(10) NOT NULL DEFAULT 'USD'");
CALL add_column_if_not_exists('leads', 'updated_at',       "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('leads', 'deleted_at',       "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('leads', 'created_by',       "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('leads', 'updated_by',       "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `leads` l
  JOIN `companies` c ON c.company_id = l.company_id
SET l.tenant_id = c.tenant_id
WHERE l.tenant_id IS NULL;

ALTER TABLE `leads` MODIFY COLUMN `tenant_id` BIGINT NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: clients
-- ══════════════════════════════════════════════════════════════
SELECT '  → clients' AS migration_log;
CALL add_column_if_not_exists('clients', 'tenant_id',      "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `client_id`");
CALL add_column_if_not_exists('clients', 'contact_person', "`contact_person` VARCHAR(255) NULL");
CALL add_column_if_not_exists('clients', 'industry',       "`industry` VARCHAR(100) NULL");
CALL add_column_if_not_exists('clients', 'website',        "`website` VARCHAR(255) NULL");
CALL add_column_if_not_exists('clients', 'country',        "`country` VARCHAR(100) NULL");
CALL add_column_if_not_exists('clients', 'tax_id',         "`tax_id` VARCHAR(100) NULL");
CALL add_column_if_not_exists('clients', 'currency_code',  "`currency_code` VARCHAR(10) NOT NULL DEFAULT 'USD'");
CALL add_column_if_not_exists('clients', 'credit_limit',   "`credit_limit` DECIMAL(15,2) NOT NULL DEFAULT 0.00");
CALL add_column_if_not_exists('clients', 'payment_terms',  "`payment_terms` INT NOT NULL DEFAULT 30 COMMENT 'Net days'");
CALL add_column_if_not_exists('clients', 'notes',          "`notes` TEXT NULL");
CALL add_column_if_not_exists('clients', 'assigned_to_id', "`assigned_to_id` BIGINT NULL DEFAULT NULL COMMENT 'Account manager'");
CALL add_column_if_not_exists('clients', 'is_active',      "`is_active` TINYINT(1) NOT NULL DEFAULT 1");
CALL add_column_if_not_exists('clients', 'updated_at',     "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('clients', 'deleted_at',     "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('clients', 'created_by',     "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('clients', 'updated_by',     "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `clients` cl
  JOIN `companies` c ON c.company_id = cl.company_id
SET cl.tenant_id = c.tenant_id
WHERE cl.tenant_id IS NULL;

ALTER TABLE `clients` MODIFY COLUMN `tenant_id` BIGINT NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- NEW TABLE: lead_activities  (CRM follow-up log)
-- ══════════════════════════════════════════════════════════════
SELECT '  → lead_activities (NEW)' AS migration_log;
CREATE TABLE IF NOT EXISTS `lead_activities` (
  `activity_id`     BIGINT        NOT NULL AUTO_INCREMENT,
  `tenant_id`       BIGINT        NOT NULL,
  `company_id`      BIGINT        NOT NULL,
  `lead_id`         BIGINT        NOT NULL,
  `user_id`         BIGINT        NOT NULL COMMENT 'Who logged the activity',
  `type`            VARCHAR(100)  NOT NULL COMMENT 'CALL|EMAIL|MEETING|NOTE|DEMO|PROPOSAL',
  `subject`         VARCHAR(255)  NULL,
  `description`     TEXT          NULL,
  `outcome`         VARCHAR(100)  NULL COMMENT 'POSITIVE|NEUTRAL|NEGATIVE',
  `next_action`     TEXT          NULL,
  `next_action_date`DATE          NULL,
  `activity_date`   DATE          NOT NULL,
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`activity_id`),
  INDEX `idx_la_lead`    (`lead_id`),
  INDEX `idx_la_tenant`  (`tenant_id`),
  INDEX `idx_la_user`    (`user_id`),
  CONSTRAINT `fk_la_lead`    FOREIGN KEY (`lead_id`)    REFERENCES `leads`     (`lead_id`)    ON DELETE CASCADE,
  CONSTRAINT `fk_la_user`    FOREIGN KEY (`user_id`)    REFERENCES `users`     (`user_id`)    ON DELETE CASCADE,
  CONSTRAINT `fk_la_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_la_tenant`  FOREIGN KEY (`tenant_id`)  REFERENCES `tenants`   (`tenant_id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ══════════════════════════════════════════════════════════════
-- TABLE: assets
-- ══════════════════════════════════════════════════════════════
SELECT '  → assets' AS migration_log;
CALL add_column_if_not_exists('assets', 'tenant_id',        "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `asset_id`");
CALL add_column_if_not_exists('assets', 'department_id',    "`department_id` BIGINT NULL DEFAULT NULL COMMENT 'Department the asset belongs to'");
CALL add_column_if_not_exists('assets', 'category',         "`category` VARCHAR(100) NULL COMMENT 'IT|FURNITURE|VEHICLE|MACHINERY|OTHER'");
CALL add_column_if_not_exists('assets', 'purchase_date',    "`purchase_date` DATE NULL");
CALL add_column_if_not_exists('assets', 'purchase_value',   "`purchase_value` DECIMAL(15,2) NOT NULL DEFAULT 0.00");
CALL add_column_if_not_exists('assets', 'current_value',    "`current_value` DECIMAL(15,2) NOT NULL DEFAULT 0.00");
CALL add_column_if_not_exists('assets', 'depreciation_rate',"`depreciation_rate` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '% per year'");
CALL add_column_if_not_exists('assets', 'vendor_id',        "`vendor_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('assets', 'warranty_expiry',  "`warranty_expiry` DATE NULL");
CALL add_column_if_not_exists('assets', 'location',         "`location` VARCHAR(255) NULL");
CALL add_column_if_not_exists('assets', 'image_url',        "`image_url` VARCHAR(500) NULL");
CALL add_column_if_not_exists('assets', 'notes',            "`notes` TEXT NULL");
CALL add_column_if_not_exists('assets', 'updated_at',       "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('assets', 'deleted_at',       "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('assets', 'created_by',       "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('assets', 'updated_by',       "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `assets` a
  JOIN `companies` c ON c.company_id = a.company_id
SET a.tenant_id = c.tenant_id
WHERE a.tenant_id IS NULL;

ALTER TABLE `assets` MODIFY COLUMN `tenant_id` BIGINT NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: asset_assignments
-- ══════════════════════════════════════════════════════════════
SELECT '  → asset_assignments' AS migration_log;
CALL add_column_if_not_exists('asset_assignments', 'tenant_id',    "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `assignment_id`");
CALL add_column_if_not_exists('asset_assignments', 'company_id',   "`company_id` BIGINT NULL DEFAULT NULL AFTER `tenant_id`");
CALL add_column_if_not_exists('asset_assignments', 'condition_out',"`condition_out` VARCHAR(50) NULL COMMENT 'Condition when assigned'");
CALL add_column_if_not_exists('asset_assignments', 'condition_in', "`condition_in` VARCHAR(50) NULL COMMENT 'Condition when returned'");
CALL add_column_if_not_exists('asset_assignments', 'notes',        "`notes` TEXT NULL");
CALL add_column_if_not_exists('asset_assignments', 'assigned_by',  "`assigned_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('asset_assignments', 'returned_by',  "`returned_by` BIGINT NULL DEFAULT NULL");

UPDATE `asset_assignments` aa
  JOIN `assets` a ON a.asset_id = aa.asset_id
SET aa.tenant_id = a.tenant_id, aa.company_id = a.company_id
WHERE aa.tenant_id IS NULL;

SELECT '✓ Phase 6 — CRM & Asset Management complete.' AS migration_log;
