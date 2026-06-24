-- ============================================================
-- FILE: migration/02_hrms.sql
-- PURPOSE: HRMS module — attendance, leave, payroll + NEW tables
-- SAFE: Additive only. No DROP. No TRUNCATE. Idempotent.
-- REQUIRES: 00_preflight.sql + 01_core_tables.sql
-- ============================================================
USE `amdox_db`;

SELECT '▶ Phase 2 — HRMS Module' AS migration_log;

-- ══════════════════════════════════════════════════════════════
-- TABLE: employee_profiles
-- ══════════════════════════════════════════════════════════════
SELECT '  → employee_profiles' AS migration_log;
CALL add_column_if_not_exists('employee_profiles', 'tenant_id',        "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `profile_id`");
CALL add_column_if_not_exists('employee_profiles', 'company_id',       "`company_id` BIGINT NULL DEFAULT NULL AFTER `tenant_id`");
CALL add_column_if_not_exists('employee_profiles', 'employee_number',  "`employee_number` VARCHAR(50) NULL COMMENT 'HR-assigned employee ID'");
CALL add_column_if_not_exists('employee_profiles', 'department_id',    "`department_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('employee_profiles', 'employment_type',  "`employment_type` VARCHAR(50) NOT NULL DEFAULT 'FULL_TIME' COMMENT 'FULL_TIME|PART_TIME|CONTRACT|INTERN'");
CALL add_column_if_not_exists('employee_profiles', 'work_location',    "`work_location` VARCHAR(100) NULL COMMENT 'REMOTE|ONSITE|HYBRID'");
CALL add_column_if_not_exists('employee_profiles', 'date_of_birth',    "`date_of_birth` DATE NULL");
CALL add_column_if_not_exists('employee_profiles', 'gender',           "`gender` VARCHAR(20) NULL");
CALL add_column_if_not_exists('employee_profiles', 'nationality',      "`nationality` VARCHAR(100) NULL");
CALL add_column_if_not_exists('employee_profiles', 'emergency_contact',"`emergency_contact` VARCHAR(255) NULL");
CALL add_column_if_not_exists('employee_profiles', 'bank_account',     "`bank_account` VARCHAR(100) NULL COMMENT 'For payroll — store encrypted'");
CALL add_column_if_not_exists('employee_profiles', 'termination_date', "`termination_date` DATE NULL");
CALL add_column_if_not_exists('employee_profiles', 'termination_reason',"`termination_reason` TEXT NULL");
CALL add_column_if_not_exists('employee_profiles', 'deleted_at',       "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('employee_profiles', 'created_by',       "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('employee_profiles', 'updated_by',       "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `employee_profiles` ep
  JOIN `users` u ON u.user_id = ep.user_id
SET ep.tenant_id = u.tenant_id, ep.company_id = u.company_id
WHERE ep.tenant_id IS NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: attendance
-- ══════════════════════════════════════════════════════════════
SELECT '  → attendance' AS migration_log;
CALL add_column_if_not_exists('attendance', 'tenant_id',     "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `attendance_id`");
CALL add_column_if_not_exists('attendance', 'company_id',    "`company_id` BIGINT NULL DEFAULT NULL AFTER `tenant_id`");
CALL add_column_if_not_exists('attendance', 'department_id', "`department_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('attendance', 'work_hours',    "`work_hours` DECIMAL(5,2) NULL DEFAULT NULL COMMENT 'Computed: check_out - check_in in hours'");
CALL add_column_if_not_exists('attendance', 'overtime_hrs',  "`overtime_hrs` DECIMAL(5,2) NOT NULL DEFAULT 0.00");
CALL add_column_if_not_exists('attendance', 'shift',         "`shift` VARCHAR(50) NULL COMMENT 'MORNING|EVENING|NIGHT'");
CALL add_column_if_not_exists('attendance', 'source',        "`source` VARCHAR(50) NOT NULL DEFAULT 'MANUAL' COMMENT 'MANUAL|BIOMETRIC|APP'");
CALL add_column_if_not_exists('attendance', 'notes',         "`notes` TEXT NULL");
CALL add_column_if_not_exists('attendance', 'updated_at',    "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('attendance', 'deleted_at',    "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('attendance', 'created_by',    "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('attendance', 'updated_by',    "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `attendance` a
  JOIN `users` u ON u.user_id = a.user_id
SET a.company_id = u.company_id, a.tenant_id = u.tenant_id
WHERE a.company_id IS NULL;

ALTER TABLE `attendance` MODIFY COLUMN `tenant_id` BIGINT NOT NULL;
ALTER TABLE `attendance` MODIFY COLUMN `company_id` BIGINT NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- NEW TABLE: leave_types
-- ══════════════════════════════════════════════════════════════
SELECT '  → leave_types (NEW)' AS migration_log;
CREATE TABLE IF NOT EXISTS `leave_types` (
  `leave_type_id`   BIGINT       NOT NULL AUTO_INCREMENT,
  `tenant_id`       BIGINT       NOT NULL,
  `company_id`      BIGINT       NOT NULL,
  `name`            VARCHAR(100) NOT NULL,
  `description`     TEXT         NULL,
  `days_allowed`    INT          NOT NULL DEFAULT 0,
  `carry_forward`   TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '1=unused days roll to next year',
  `max_carry_days`  INT          NOT NULL DEFAULT 0,
  `is_paid`         TINYINT(1)   NOT NULL DEFAULT 1,
  `requires_docs`   TINYINT(1)   NOT NULL DEFAULT 0 COMMENT '1=medical cert required',
  `min_notice_days` INT          NOT NULL DEFAULT 0 COMMENT 'Min advance notice required',
  `is_active`       TINYINT(1)   NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME     NULL DEFAULT NULL,
  `created_by`      BIGINT       NULL DEFAULT NULL,
  `updated_by`      BIGINT       NULL DEFAULT NULL,
  PRIMARY KEY (`leave_type_id`),
  UNIQUE KEY `uq_leave_type_company` (`company_id`, `name`),
  INDEX `idx_lt_tenant`          (`tenant_id`),
  INDEX `idx_lt_company`         (`company_id`),
  INDEX `idx_lt_tenant_active`   (`tenant_id`, `is_active`),
  CONSTRAINT `fk_lt_company`   FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lt_tenant`    FOREIGN KEY (`tenant_id`)  REFERENCES `tenants`   (`tenant_id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ══════════════════════════════════════════════════════════════
-- TABLE: leave_requests
-- ══════════════════════════════════════════════════════════════
SELECT '  → leave_requests' AS migration_log;
CALL add_column_if_not_exists('leave_requests', 'tenant_id',       "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `leave_id`");
CALL add_column_if_not_exists('leave_requests', 'company_id',      "`company_id` BIGINT NULL DEFAULT NULL AFTER `tenant_id`");
CALL add_column_if_not_exists('leave_requests', 'leave_type_id',   "`leave_type_id` BIGINT NULL DEFAULT NULL COMMENT 'FK → leave_types'");
CALL add_column_if_not_exists('leave_requests', 'approved_by_id',  "`approved_by_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('leave_requests', 'approved_at',     "`approved_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('leave_requests', 'days_count',      "`days_count` INT NOT NULL DEFAULT 0 COMMENT 'Business days between start and end'");
CALL add_column_if_not_exists('leave_requests', 'reject_reason',   "`reject_reason` TEXT NULL");
CALL add_column_if_not_exists('leave_requests', 'document_url',    "`document_url` VARCHAR(500) NULL COMMENT 'Medical cert or other supporting doc'");
CALL add_column_if_not_exists('leave_requests', 'updated_at',      "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('leave_requests', 'deleted_at',      "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('leave_requests', 'created_by',      "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('leave_requests', 'updated_by',      "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `leave_requests` lr
  JOIN `users` u ON u.user_id = lr.user_id
SET lr.company_id = u.company_id, lr.tenant_id = u.tenant_id
WHERE lr.company_id IS NULL;

ALTER TABLE `leave_requests` MODIFY COLUMN `tenant_id` BIGINT NOT NULL;
ALTER TABLE `leave_requests` MODIFY COLUMN `company_id` BIGINT NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: leave_balances
-- ══════════════════════════════════════════════════════════════
SELECT '  → leave_balances' AS migration_log;
CALL add_column_if_not_exists('leave_balances', 'tenant_id',      "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `balance_id`");
CALL add_column_if_not_exists('leave_balances', 'company_id',     "`company_id` BIGINT NULL DEFAULT NULL AFTER `tenant_id`");
CALL add_column_if_not_exists('leave_balances', 'leave_type_id',  "`leave_type_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('leave_balances', 'year',           "`year` SMALLINT NOT NULL DEFAULT (YEAR(NOW()))");
CALL add_column_if_not_exists('leave_balances', 'carry_forward',  "`carry_forward` INT NOT NULL DEFAULT 0");
CALL add_column_if_not_exists('leave_balances', 'pending',        "`pending` INT NOT NULL DEFAULT 0 COMMENT 'Days in pending state'");
CALL add_column_if_not_exists('leave_balances', 'created_at',     "`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('leave_balances', 'updated_at',     "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

UPDATE `leave_balances` lb
  JOIN `users` u ON u.user_id = lb.user_id
SET lb.company_id = u.company_id, lb.tenant_id = u.tenant_id
WHERE lb.company_id IS NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: payroll
-- ══════════════════════════════════════════════════════════════
SELECT '  → payroll' AS migration_log;
CALL add_column_if_not_exists('payroll', 'tenant_id',        "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `payroll_id`");
CALL add_column_if_not_exists('payroll', 'company_id',       "`company_id` BIGINT NULL DEFAULT NULL AFTER `tenant_id`");
CALL add_column_if_not_exists('payroll', 'currency_code',    "`currency_code` VARCHAR(10) NOT NULL DEFAULT 'USD'");
CALL add_column_if_not_exists('payroll', 'overtime_paid',    "`overtime_paid` DECIMAL(15,2) NOT NULL DEFAULT 0.00");
CALL add_column_if_not_exists('payroll', 'tax_deducted',     "`tax_deducted` DECIMAL(15,2) NOT NULL DEFAULT 0.00");
CALL add_column_if_not_exists('payroll', 'payment_method',   "`payment_method` VARCHAR(50) NULL DEFAULT 'BANK_TRANSFER'");
CALL add_column_if_not_exists('payroll', 'payment_date',     "`payment_date` DATE NULL DEFAULT NULL");
CALL add_column_if_not_exists('payroll', 'transaction_ref',  "`transaction_ref` VARCHAR(255) NULL");
CALL add_column_if_not_exists('payroll', 'notes',            "`notes` TEXT NULL");
CALL add_column_if_not_exists('payroll', 'approved_by_id',   "`approved_by_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('payroll', 'updated_at',       "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('payroll', 'deleted_at',       "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('payroll', 'created_by',       "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('payroll', 'updated_by',       "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `payroll` p
  JOIN `users` u ON u.user_id = p.user_id
SET p.company_id = u.company_id, p.tenant_id = u.tenant_id
WHERE p.company_id IS NULL;

ALTER TABLE `payroll` MODIFY COLUMN `tenant_id` BIGINT NOT NULL;
ALTER TABLE `payroll` MODIFY COLUMN `company_id` BIGINT NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: salary_structures
-- ══════════════════════════════════════════════════════════════
SELECT '  → salary_structures' AS migration_log;
CALL add_column_if_not_exists('salary_structures', 'tenant_id',      "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `structure_id`");
CALL add_column_if_not_exists('salary_structures', 'company_id',     "`company_id` BIGINT NULL DEFAULT NULL AFTER `tenant_id`");
CALL add_column_if_not_exists('salary_structures', 'currency_code',  "`currency_code` VARCHAR(10) NOT NULL DEFAULT 'USD'");
CALL add_column_if_not_exists('salary_structures', 'effective_date', "`effective_date` DATE NULL DEFAULT NULL");
CALL add_column_if_not_exists('salary_structures', 'created_at',     "`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('salary_structures', 'updated_at',     "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('salary_structures', 'created_by',     "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('salary_structures', 'updated_by',     "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `salary_structures` ss
  JOIN `users` u ON u.user_id = ss.user_id
SET ss.company_id = u.company_id, ss.tenant_id = u.tenant_id
WHERE ss.company_id IS NULL;

-- ══════════════════════════════════════════════════════════════
-- NEW TABLE: salary_components
-- ══════════════════════════════════════════════════════════════
SELECT '  → salary_components (NEW)' AS migration_log;
CREATE TABLE IF NOT EXISTS `salary_components` (
  `component_id`    BIGINT         NOT NULL AUTO_INCREMENT,
  `tenant_id`       BIGINT         NOT NULL,
  `company_id`      BIGINT         NOT NULL,
  `user_id`         BIGINT         NOT NULL,
  `type`            VARCHAR(50)    NOT NULL COMMENT 'ALLOWANCE | DEDUCTION',
  `name`            VARCHAR(100)   NOT NULL,
  `amount`          DECIMAL(15,2)  NOT NULL DEFAULT 0.00,
  `is_percentage`   TINYINT(1)     NOT NULL DEFAULT 0 COMMENT '1=% of base salary',
  `percentage_of`   VARCHAR(50)    NULL COMMENT 'BASE | GROSS — used when is_percentage=1',
  `is_taxable`      TINYINT(1)     NOT NULL DEFAULT 1,
  `is_active`       TINYINT(1)     NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME       NULL DEFAULT NULL,
  `created_by`      BIGINT         NULL DEFAULT NULL,
  `updated_by`      BIGINT         NULL DEFAULT NULL,
  PRIMARY KEY (`component_id`),
  INDEX `idx_sal_comp_tenant`      (`tenant_id`),
  INDEX `idx_sal_comp_company`     (`company_id`),
  INDEX `idx_sal_comp_user`        (`user_id`),
  INDEX `idx_sal_comp_user_status` (`user_id`, `is_active`),
  CONSTRAINT `fk_sal_comp_user`    FOREIGN KEY (`user_id`)    REFERENCES `users`     (`user_id`)    ON DELETE CASCADE,
  CONSTRAINT `fk_sal_comp_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sal_comp_tenant`  FOREIGN KEY (`tenant_id`)  REFERENCES `tenants`   (`tenant_id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ══════════════════════════════════════════════════════════════
-- TABLE: holidays
-- ══════════════════════════════════════════════════════════════
SELECT '  → holidays' AS migration_log;
CALL add_column_if_not_exists('holidays', 'tenant_id',   "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `holiday_id`");
CALL add_column_if_not_exists('holidays', 'type',        "`type` VARCHAR(50) NOT NULL DEFAULT 'PUBLIC' COMMENT 'PUBLIC|OPTIONAL|RESTRICTED'");
CALL add_column_if_not_exists('holidays', 'is_recurring',"`is_recurring` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '1=repeats every year'");
CALL add_column_if_not_exists('holidays', 'created_at',  "`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('holidays', 'updated_at',  "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('holidays', 'created_by',  "`created_by` BIGINT NULL DEFAULT NULL");

UPDATE `holidays` h
  JOIN `companies` c ON c.company_id = h.company_id
SET h.tenant_id = c.tenant_id
WHERE h.tenant_id IS NULL;

SELECT '✓ Phase 2 — HRMS Module complete.' AS migration_log;
