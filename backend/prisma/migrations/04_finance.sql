-- ============================================================
-- FILE: migration/04_finance.sql
-- PURPOSE: Finance + Accounting module upgrades + new tables
-- SAFE: Additive only. No DROP. No TRUNCATE. Idempotent.
-- REQUIRES: 00_preflight.sql + 01_core_tables.sql
-- ============================================================
USE `amdox_db`;

SELECT '▶ Phase 4 — Finance & Accounting Module' AS migration_log;

-- ══════════════════════════════════════════════════════════════
-- TABLE: expenses
-- ══════════════════════════════════════════════════════════════
SELECT '  → expenses' AS migration_log;
CALL add_column_if_not_exists('expenses', 'tenant_id',       "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `expense_id`");
CALL add_column_if_not_exists('expenses', 'department_id',   "`department_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('expenses', 'project_id',      "`project_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('expenses', 'currency_code',   "`currency_code` VARCHAR(10) NOT NULL DEFAULT 'USD'");
CALL add_column_if_not_exists('expenses', 'receipt_url',     "`receipt_url` VARCHAR(500) NULL COMMENT 'Uploaded receipt path'");
CALL add_column_if_not_exists('expenses', 'expense_date',    "`expense_date` DATE NULL DEFAULT NULL");
CALL add_column_if_not_exists('expenses', 'is_billable',     "`is_billable` TINYINT(1) NOT NULL DEFAULT 0");
CALL add_column_if_not_exists('expenses', 'approved_by_id',  "`approved_by_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('expenses', 'approved_at',     "`approved_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('expenses', 'paid_at',         "`paid_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('expenses', 'reject_reason',   "`reject_reason` TEXT NULL");
CALL add_column_if_not_exists('expenses', 'updated_at',      "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('expenses', 'deleted_at',      "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('expenses', 'created_by',      "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('expenses', 'updated_by',      "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `expenses` e
  JOIN `companies` c ON c.company_id = e.company_id
SET e.tenant_id = c.tenant_id
WHERE e.tenant_id IS NULL;

ALTER TABLE `expenses` MODIFY COLUMN `tenant_id` BIGINT NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: invoices
-- ══════════════════════════════════════════════════════════════
SELECT '  → invoices' AS migration_log;
CALL add_column_if_not_exists('invoices', 'tenant_id',        "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `invoice_id`");
CALL add_column_if_not_exists('invoices', 'project_id',       "`project_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('invoices', 'currency_code',    "`currency_code` VARCHAR(10) NOT NULL DEFAULT 'USD'");
CALL add_column_if_not_exists('invoices', 'subtotal',         "`subtotal` DECIMAL(15,2) NOT NULL DEFAULT 0.00");
CALL add_column_if_not_exists('invoices', 'tax_amount',       "`tax_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00");
CALL add_column_if_not_exists('invoices', 'discount_amount',  "`discount_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00");
CALL add_column_if_not_exists('invoices', 'paid_amount',      "`paid_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Updated on each payment'");
CALL add_column_if_not_exists('invoices', 'issued_date',      "`issued_date` DATE NULL DEFAULT NULL");
CALL add_column_if_not_exists('invoices', 'notes',            "`notes` TEXT NULL");
CALL add_column_if_not_exists('invoices', 'payment_terms',    "`payment_terms` INT NOT NULL DEFAULT 30 COMMENT 'Net days'");
CALL add_column_if_not_exists('invoices', 'updated_at',       "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('invoices', 'deleted_at',       "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('invoices', 'created_by',       "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('invoices', 'updated_by',       "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `invoices` i
  JOIN `companies` c ON c.company_id = i.company_id
SET i.tenant_id = c.tenant_id
WHERE i.tenant_id IS NULL;

ALTER TABLE `invoices` MODIFY COLUMN `tenant_id` BIGINT NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: payments
-- ══════════════════════════════════════════════════════════════
SELECT '  → payments' AS migration_log;
CALL add_column_if_not_exists('payments', 'tenant_id',        "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `payment_id`");
CALL add_column_if_not_exists('payments', 'company_id',       "`company_id` BIGINT NULL DEFAULT NULL AFTER `tenant_id`");
CALL add_column_if_not_exists('payments', 'currency_code',    "`currency_code` VARCHAR(10) NOT NULL DEFAULT 'USD'");
CALL add_column_if_not_exists('payments', 'transaction_ref',  "`transaction_ref` VARCHAR(255) NULL");
CALL add_column_if_not_exists('payments', 'notes',            "`notes` TEXT NULL");
CALL add_column_if_not_exists('payments', 'created_by',       "`created_by` BIGINT NULL DEFAULT NULL");

UPDATE `payments` pm
  JOIN `invoices` i ON i.invoice_id = pm.invoice_id
SET pm.tenant_id = i.tenant_id, pm.company_id = i.company_id
WHERE pm.tenant_id IS NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: vendors
-- ══════════════════════════════════════════════════════════════
SELECT '  → vendors' AS migration_log;
CALL add_column_if_not_exists('vendors', 'tenant_id',       "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `vendor_id`");
CALL add_column_if_not_exists('vendors', 'contact_person',  "`contact_person` VARCHAR(255) NULL");
CALL add_column_if_not_exists('vendors', 'address',         "`address` TEXT NULL");
CALL add_column_if_not_exists('vendors', 'tax_id',          "`tax_id` VARCHAR(100) NULL");
CALL add_column_if_not_exists('vendors', 'website',         "`website` VARCHAR(255) NULL");
CALL add_column_if_not_exists('vendors', 'currency_code',   "`currency_code` VARCHAR(10) NOT NULL DEFAULT 'USD'");
CALL add_column_if_not_exists('vendors', 'payment_terms',   "`payment_terms` INT NOT NULL DEFAULT 30 COMMENT 'Net days'");
CALL add_column_if_not_exists('vendors', 'is_active',       "`is_active` TINYINT(1) NOT NULL DEFAULT 1");
CALL add_column_if_not_exists('vendors', 'created_at',      "`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('vendors', 'updated_at',      "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('vendors', 'deleted_at',      "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('vendors', 'created_by',      "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('vendors', 'updated_by',      "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `vendors` v
  JOIN `companies` c ON c.company_id = v.company_id
SET v.tenant_id = c.tenant_id
WHERE v.tenant_id IS NULL;

ALTER TABLE `vendors` MODIFY COLUMN `tenant_id` BIGINT NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: vendor_bills  (maps to purchase_orders in amdox_db)
-- ══════════════════════════════════════════════════════════════
SELECT '  → vendor_bills' AS migration_log;
CALL add_column_if_not_exists('vendor_bills', 'tenant_id',     "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `bill_id`");
CALL add_column_if_not_exists('vendor_bills', 'currency_code', "`currency_code` VARCHAR(10) NOT NULL DEFAULT 'USD'");
CALL add_column_if_not_exists('vendor_bills', 'subtotal',      "`subtotal` DECIMAL(15,2) NOT NULL DEFAULT 0.00");
CALL add_column_if_not_exists('vendor_bills', 'tax_amount',    "`tax_amount` DECIMAL(15,2) NOT NULL DEFAULT 0.00");
CALL add_column_if_not_exists('vendor_bills', 'notes',         "`notes` TEXT NULL");
CALL add_column_if_not_exists('vendor_bills', 'paid_at',       "`paid_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('vendor_bills', 'updated_at',    "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('vendor_bills', 'deleted_at',    "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('vendor_bills', 'created_by',    "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('vendor_bills', 'updated_by',    "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `vendor_bills` vb
  JOIN `companies` c ON c.company_id = vb.company_id
SET vb.tenant_id = c.tenant_id
WHERE vb.tenant_id IS NULL;

ALTER TABLE `vendor_bills` MODIFY COLUMN `tenant_id` BIGINT NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- NEW TABLE: tax_rates
-- ══════════════════════════════════════════════════════════════
SELECT '  → tax_rates (NEW)' AS migration_log;
CREATE TABLE IF NOT EXISTS `tax_rates` (
  `tax_id`          BIGINT          NOT NULL AUTO_INCREMENT,
  `tenant_id`       BIGINT          NOT NULL,
  `company_id`      BIGINT          NOT NULL,
  `name`            VARCHAR(100)    NOT NULL,
  `code`            VARCHAR(50)     NULL COMMENT 'e.g. GST18, VAT20',
  `type`            VARCHAR(50)     NOT NULL DEFAULT 'VAT' COMMENT 'VAT|GST|SALES_TAX|WITHHOLDING',
  `rate_percent`    DECIMAL(8,4)    NOT NULL,
  `applies_to`      VARCHAR(100)    NULL COMMENT 'SALES|PURCHASES|BOTH',
  `is_active`       TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by`      BIGINT          NULL DEFAULT NULL,
  `updated_by`      BIGINT          NULL DEFAULT NULL,
  PRIMARY KEY (`tax_id`),
  INDEX `idx_tax_tenant`    (`tenant_id`),
  INDEX `idx_tax_company`   (`company_id`),
  CONSTRAINT `fk_tax_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tax_tenant`  FOREIGN KEY (`tenant_id`)  REFERENCES `tenants`   (`tenant_id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ══════════════════════════════════════════════════════════════
-- NEW TABLE: chart_of_accounts
-- ══════════════════════════════════════════════════════════════
SELECT '  → chart_of_accounts (NEW)' AS migration_log;
CREATE TABLE IF NOT EXISTS `chart_of_accounts` (
  `account_id`      BIGINT        NOT NULL AUTO_INCREMENT,
  `tenant_id`       BIGINT        NOT NULL,
  `company_id`      BIGINT        NOT NULL,
  `account_code`    VARCHAR(50)   NOT NULL,
  `account_name`    VARCHAR(255)  NOT NULL,
  `account_type`    VARCHAR(50)   NOT NULL COMMENT 'ASSET|LIABILITY|EQUITY|REVENUE|EXPENSE',
  `account_subtype` VARCHAR(100)  NULL COMMENT 'e.g. BANK|RECEIVABLE|PAYABLE|INVENTORY',
  `parent_id`       BIGINT        NULL DEFAULT NULL COMMENT 'For tree structure',
  `is_system`       TINYINT(1)    NOT NULL DEFAULT 0 COMMENT 'System accounts cannot be deleted',
  `is_active`       TINYINT(1)    NOT NULL DEFAULT 1,
  `description`     TEXT          NULL,
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME      NULL DEFAULT NULL,
  `created_by`      BIGINT        NULL DEFAULT NULL,
  `updated_by`      BIGINT        NULL DEFAULT NULL,
  PRIMARY KEY (`account_id`),
  UNIQUE KEY `uq_account_code_company` (`company_id`, `account_code`),
  INDEX `idx_coa_tenant`    (`tenant_id`),
  INDEX `idx_coa_company`   (`company_id`),
  INDEX `idx_coa_type`      (`tenant_id`, `account_type`),
  INDEX `idx_coa_parent`    (`parent_id`),
  CONSTRAINT `fk_coa_company` FOREIGN KEY (`company_id`) REFERENCES `companies`         (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_coa_tenant`  FOREIGN KEY (`tenant_id`)  REFERENCES `tenants`           (`tenant_id`)  ON DELETE CASCADE,
  CONSTRAINT `fk_coa_parent`  FOREIGN KEY (`parent_id`)  REFERENCES `chart_of_accounts` (`account_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ══════════════════════════════════════════════════════════════
-- NEW TABLE: journal_entries
-- ══════════════════════════════════════════════════════════════
SELECT '  → journal_entries (NEW)' AS migration_log;
CREATE TABLE IF NOT EXISTS `journal_entries` (
  `entry_id`        BIGINT        NOT NULL AUTO_INCREMENT,
  `tenant_id`       BIGINT        NOT NULL,
  `company_id`      BIGINT        NOT NULL,
  `entry_number`    VARCHAR(100)  NOT NULL,
  `entry_date`      DATE          NOT NULL,
  `description`     TEXT          NULL,
  `reference_type`  VARCHAR(100)  NULL COMMENT 'INVOICE|BILL|PAYROLL|EXPENSE|MANUAL|PO',
  `reference_id`    BIGINT        NULL COMMENT 'ID of the source record',
  `status`          VARCHAR(50)   NOT NULL DEFAULT 'DRAFT' COMMENT 'DRAFT|POSTED|REVERSED',
  `reversed_by_id`  BIGINT        NULL DEFAULT NULL COMMENT 'FK to reversing entry',
  `posted_at`       DATETIME      NULL,
  `posted_by_id`    BIGINT        NULL DEFAULT NULL,
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME      NULL DEFAULT NULL,
  `created_by`      BIGINT        NULL DEFAULT NULL,
  `updated_by`      BIGINT        NULL DEFAULT NULL,
  PRIMARY KEY (`entry_id`),
  UNIQUE KEY `uq_entry_number_company` (`company_id`, `entry_number`),
  INDEX `idx_je_tenant`           (`tenant_id`),
  INDEX `idx_je_company`          (`company_id`),
  INDEX `idx_je_tenant_status`    (`tenant_id`, `status`),
  INDEX `idx_je_company_status`   (`company_id`, `status`),
  INDEX `idx_je_date`             (`entry_date`),
  INDEX `idx_je_reference`        (`reference_type`, `reference_id`),
  CONSTRAINT `fk_je_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_je_tenant`  FOREIGN KEY (`tenant_id`)  REFERENCES `tenants`   (`tenant_id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ══════════════════════════════════════════════════════════════
-- NEW TABLE: journal_lines
-- ══════════════════════════════════════════════════════════════
SELECT '  → journal_lines (NEW)' AS migration_log;
CREATE TABLE IF NOT EXISTS `journal_lines` (
  `line_id`         BIGINT        NOT NULL AUTO_INCREMENT,
  `entry_id`        BIGINT        NOT NULL,
  `tenant_id`       BIGINT        NOT NULL,
  `account_id`      BIGINT        NOT NULL,
  `description`     TEXT          NULL,
  `debit`           DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `credit`          DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  `currency_code`   VARCHAR(10)   NOT NULL DEFAULT 'USD',
  `tax_rate_id`     BIGINT        NULL DEFAULT NULL,
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`line_id`),
  INDEX `idx_jl_entry`    (`entry_id`),
  INDEX `idx_jl_account`  (`account_id`),
  INDEX `idx_jl_tenant`   (`tenant_id`),
  CONSTRAINT `fk_jl_entry`   FOREIGN KEY (`entry_id`)   REFERENCES `journal_entries`   (`entry_id`)   ON DELETE CASCADE,
  CONSTRAINT `fk_jl_account` FOREIGN KEY (`account_id`) REFERENCES `chart_of_accounts` (`account_id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_jl_tenant`  FOREIGN KEY (`tenant_id`)  REFERENCES `tenants`           (`tenant_id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✓ Phase 4 — Finance & Accounting complete.' AS migration_log;
