-- ============================================================
-- FILE: migration/07_workflow_reports.sql
-- PURPOSE: Workflow, notifications + all new reporting/analytics tables
-- SAFE: Additive only. No DROP. No TRUNCATE. Idempotent.
-- REQUIRES: 00_preflight.sql + 01_core_tables.sql
-- ============================================================
USE `amdox_db`;

SELECT '▶ Phase 7 — Workflow, Reporting & Analytics Tables' AS migration_log;

-- ══════════════════════════════════════════════════════════════
-- TABLE: approvals
-- ══════════════════════════════════════════════════════════════
SELECT '  → approvals' AS migration_log;
CALL add_column_if_not_exists('approvals', 'tenant_id',    "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `approval_id`");
CALL add_column_if_not_exists('approvals', 'priority',     "`priority` VARCHAR(50) NOT NULL DEFAULT 'NORMAL' COMMENT 'LOW|NORMAL|HIGH|URGENT'");
CALL add_column_if_not_exists('approvals', 'due_date',     "`due_date` DATE NULL");
CALL add_column_if_not_exists('approvals', 'reject_reason',"`reject_reason` TEXT NULL");
CALL add_column_if_not_exists('approvals', 'escalated_at', "`escalated_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('approvals', 'deleted_at',   "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('approvals', 'created_by',   "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('approvals', 'updated_by',   "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `approvals` a
  JOIN `companies` c ON c.company_id = a.company_id
SET a.tenant_id = c.tenant_id
WHERE a.tenant_id IS NULL;

ALTER TABLE `approvals` MODIFY COLUMN `tenant_id` BIGINT NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: notifications
-- ══════════════════════════════════════════════════════════════
SELECT '  → notifications' AS migration_log;
CALL add_column_if_not_exists('notifications', 'tenant_id',    "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `notification_id`");
CALL add_column_if_not_exists('notifications', 'company_id',   "`company_id` BIGINT NULL DEFAULT NULL AFTER `tenant_id`");
CALL add_column_if_not_exists('notifications', 'type',         "`type` VARCHAR(100) NOT NULL DEFAULT 'INFO' COMMENT 'INFO|SUCCESS|WARNING|APPROVAL|ALERT|REMINDER'");
CALL add_column_if_not_exists('notifications', 'action_url',   "`action_url` VARCHAR(500) NULL COMMENT 'Deep link to related record'");
CALL add_column_if_not_exists('notifications', 'action_label', "`action_label` VARCHAR(100) NULL COMMENT 'Button text for action_url'");
CALL add_column_if_not_exists('notifications', 'icon',         "`icon` VARCHAR(100) NULL COMMENT 'Lucide icon name'");
CALL add_column_if_not_exists('notifications', 'read_at',      "`read_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('notifications', 'expires_at',   "`expires_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('notifications', 'sent_by_id',   "`sent_by_id` BIGINT NULL DEFAULT NULL COMMENT 'System or user who triggered'");

UPDATE `notifications` n
  JOIN `users` u ON u.user_id = n.user_id
SET n.company_id = u.company_id, n.tenant_id = u.tenant_id
WHERE n.company_id IS NULL;

ALTER TABLE `notifications` MODIFY COLUMN `tenant_id` BIGINT NOT NULL;
ALTER TABLE `notifications` MODIFY COLUMN `company_id` BIGINT NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: announcements
-- ══════════════════════════════════════════════════════════════
SELECT '  → announcements' AS migration_log;
CALL add_column_if_not_exists('announcements', 'tenant_id',       "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `announcement_id`");
CALL add_column_if_not_exists('announcements', 'department_id',   "`department_id` BIGINT NULL DEFAULT NULL COMMENT 'NULL = company-wide'");
CALL add_column_if_not_exists('announcements', 'priority',        "`priority` VARCHAR(50) NOT NULL DEFAULT 'NORMAL'");
CALL add_column_if_not_exists('announcements', 'is_pinned',       "`is_pinned` TINYINT(1) NOT NULL DEFAULT 0");
CALL add_column_if_not_exists('announcements', 'expires_at',      "`expires_at` DATETIME NULL");
CALL add_column_if_not_exists('announcements', 'deleted_at',      "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('announcements', 'created_by',      "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('announcements', 'updated_by',      "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `announcements` a
  JOIN `companies` c ON c.company_id = a.company_id
SET a.tenant_id = c.tenant_id
WHERE a.tenant_id IS NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: meetings
-- ══════════════════════════════════════════════════════════════
SELECT '  → meetings' AS migration_log;
CALL add_column_if_not_exists('meetings', 'tenant_id',      "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `meeting_id`");
CALL add_column_if_not_exists('meetings', 'department_id',  "`department_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('meetings', 'organizer_id',   "`organizer_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('meetings', 'type',           "`type` VARCHAR(50) NOT NULL DEFAULT 'INTERNAL' COMMENT 'INTERNAL|CLIENT|BOARD'");
CALL add_column_if_not_exists('meetings', 'status',         "`status` VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED' COMMENT 'SCHEDULED|CANCELLED|COMPLETED'");
CALL add_column_if_not_exists('meetings', 'agenda',         "`agenda` TEXT NULL");
CALL add_column_if_not_exists('meetings', 'minutes',        "`minutes` TEXT NULL COMMENT 'Meeting minutes / notes'");
CALL add_column_if_not_exists('meetings', 'updated_at',     "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('meetings', 'deleted_at',     "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('meetings', 'created_by',     "`created_by` BIGINT NULL DEFAULT NULL");

UPDATE `meetings` m
  JOIN `companies` c ON c.company_id = m.company_id
SET m.tenant_id = c.tenant_id
WHERE m.tenant_id IS NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: job_postings
-- ══════════════════════════════════════════════════════════════
SELECT '  → job_postings' AS migration_log;
CALL add_column_if_not_exists('job_postings', 'tenant_id',         "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `posting_id`");
CALL add_column_if_not_exists('job_postings', 'department_id',     "`department_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('job_postings', 'employment_type',   "`employment_type` VARCHAR(50) NOT NULL DEFAULT 'FULL_TIME'");
CALL add_column_if_not_exists('job_postings', 'location',          "`location` VARCHAR(255) NULL");
CALL add_column_if_not_exists('job_postings', 'salary_min',        "`salary_min` DECIMAL(15,2) NULL");
CALL add_column_if_not_exists('job_postings', 'salary_max',        "`salary_max` DECIMAL(15,2) NULL");
CALL add_column_if_not_exists('job_postings', 'currency_code',     "`currency_code` VARCHAR(10) NOT NULL DEFAULT 'USD'");
CALL add_column_if_not_exists('job_postings', 'openings',          "`openings` INT NOT NULL DEFAULT 1");
CALL add_column_if_not_exists('job_postings', 'closing_date',      "`closing_date` DATE NULL");
CALL add_column_if_not_exists('job_postings', 'updated_at',        "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('job_postings', 'deleted_at',        "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('job_postings', 'created_by',        "`created_by` BIGINT NULL DEFAULT NULL");

UPDATE `job_postings` jp
  JOIN `companies` c ON c.company_id = jp.company_id
SET jp.tenant_id = c.tenant_id
WHERE jp.tenant_id IS NULL;

-- ══════════════════════════════════════════════════════════════
-- NEW TABLE: file_uploads
-- ══════════════════════════════════════════════════════════════
SELECT '  → file_uploads (NEW)' AS migration_log;
CREATE TABLE IF NOT EXISTS `file_uploads` (
  `file_id`         BIGINT        NOT NULL AUTO_INCREMENT,
  `tenant_id`       BIGINT        NOT NULL,
  `company_id`      BIGINT        NOT NULL,
  `uploaded_by`     BIGINT        NOT NULL,
  `module`          VARCHAR(100)  NOT NULL COMMENT 'projects|hrms|finance|expenses|crm|assets',
  `record_id`       BIGINT        NULL COMMENT 'ID of the parent record',
  `file_name`       VARCHAR(500)  NOT NULL,
  `original_name`   VARCHAR(500)  NULL,
  `file_path`       VARCHAR(1000) NOT NULL,
  `file_type`       VARCHAR(100)  NULL COMMENT 'MIME type',
  `file_size_kb`    INT           NOT NULL DEFAULT 0,
  `storage_driver`  VARCHAR(50)   NOT NULL DEFAULT 'LOCAL' COMMENT 'LOCAL|S3|GCS|AZURE',
  `storage_bucket`  VARCHAR(255)  NULL,
  `is_public`       TINYINT(1)    NOT NULL DEFAULT 0,
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME      NULL DEFAULT NULL,
  PRIMARY KEY (`file_id`),
  INDEX `idx_files_tenant`    (`tenant_id`),
  INDEX `idx_files_company`   (`company_id`),
  INDEX `idx_files_module`    (`module`, `record_id`),
  INDEX `idx_files_uploader`  (`uploaded_by`),
  CONSTRAINT `fk_files_uploader` FOREIGN KEY (`uploaded_by`) REFERENCES `users`     (`user_id`)    ON DELETE CASCADE,
  CONSTRAINT `fk_files_company`  FOREIGN KEY (`company_id`)  REFERENCES `companies` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_files_tenant`   FOREIGN KEY (`tenant_id`)   REFERENCES `tenants`   (`tenant_id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ══════════════════════════════════════════════════════════════
-- NEW TABLE: kpi_snapshots
-- ══════════════════════════════════════════════════════════════
SELECT '  → kpi_snapshots (NEW)' AS migration_log;
CREATE TABLE IF NOT EXISTS `kpi_snapshots` (
  `snapshot_id`     BIGINT        NOT NULL AUTO_INCREMENT,
  `tenant_id`       BIGINT        NOT NULL,
  `company_id`      BIGINT        NOT NULL,
  `department_id`   BIGINT        NULL DEFAULT NULL,
  `kpi_key`         VARCHAR(100)  NOT NULL COMMENT 'revenue_monthly|headcount|attendance_rate|project_completion|etc',
  `period_type`     VARCHAR(20)   NOT NULL COMMENT 'DAILY|WEEKLY|MONTHLY|QUARTERLY|YEARLY',
  `period_label`    VARCHAR(20)   NOT NULL COMMENT '2025-06 | 2025-W24 | 2025-Q2 | 2025',
  `value`           DECIMAL(20,4) NOT NULL,
  `unit`            VARCHAR(50)   NULL COMMENT 'USD|COUNT|PERCENT|HOURS|DAYS',
  `meta_json`       JSON          NULL COMMENT 'Optional breakdown data',
  `recorded_at`     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`snapshot_id`),
  UNIQUE KEY `uq_kpi_period` (`company_id`, `kpi_key`, `period_type`, `period_label`),
  INDEX `idx_kpi_tenant`    (`tenant_id`),
  INDEX `idx_kpi_company`   (`company_id`),
  INDEX `idx_kpi_key`       (`kpi_key`),
  INDEX `idx_kpi_period`    (`period_type`, `period_label`),
  INDEX `idx_kpi_dept`      (`department_id`),
  CONSTRAINT `fk_kpi_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_kpi_tenant`  FOREIGN KEY (`tenant_id`)  REFERENCES `tenants`   (`tenant_id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ══════════════════════════════════════════════════════════════
-- NEW TABLE: dashboard_widgets
-- ══════════════════════════════════════════════════════════════
SELECT '  → dashboard_widgets (NEW)' AS migration_log;
CREATE TABLE IF NOT EXISTS `dashboard_widgets` (
  `widget_id`       BIGINT        NOT NULL AUTO_INCREMENT,
  `tenant_id`       BIGINT        NOT NULL,
  `user_id`         BIGINT        NOT NULL,
  `widget_key`      VARCHAR(100)  NOT NULL COMMENT 'Unique identifier for the widget type e.g. revenue_chart',
  `title`           VARCHAR(255)  NULL COMMENT 'User-overridden title',
  `position_x`      INT           NOT NULL DEFAULT 0,
  `position_y`      INT           NOT NULL DEFAULT 0,
  `width`           INT           NOT NULL DEFAULT 4 COMMENT 'Grid columns (max 12)',
  `height`          INT           NOT NULL DEFAULT 3 COMMENT 'Grid rows',
  `config_json`     JSON          NULL COMMENT 'Chart type, filters, date range overrides',
  `is_visible`      TINYINT(1)    NOT NULL DEFAULT 1,
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`widget_id`),
  UNIQUE KEY `uq_widget_user_key` (`user_id`, `widget_key`),
  INDEX `idx_widget_user`    (`user_id`),
  INDEX `idx_widget_tenant`  (`tenant_id`),
  CONSTRAINT `fk_widget_user`   FOREIGN KEY (`user_id`)   REFERENCES `users`   (`user_id`)   ON DELETE CASCADE,
  CONSTRAINT `fk_widget_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ══════════════════════════════════════════════════════════════
-- NEW TABLE: report_templates
-- ══════════════════════════════════════════════════════════════
SELECT '  → report_templates (NEW)' AS migration_log;
CREATE TABLE IF NOT EXISTS `report_templates` (
  `template_id`     BIGINT        NOT NULL AUTO_INCREMENT,
  `tenant_id`       BIGINT        NOT NULL,
  `company_id`      BIGINT        NOT NULL,
  `name`            VARCHAR(255)  NOT NULL,
  `description`     TEXT          NULL,
  `module`          VARCHAR(100)  NOT NULL COMMENT 'hrms|finance|projects|crm|inventory|assets',
  `type`            VARCHAR(100)  NOT NULL COMMENT 'TABULAR|CHART|PIVOT|SUMMARY|MIXED',
  `output_format`   VARCHAR(50)   NOT NULL DEFAULT 'XLSX' COMMENT 'XLSX|PDF|CSV',
  `config_json`     JSON          NOT NULL COMMENT 'Columns, filters, groupings, sort, date ranges',
  `is_system`       TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '1=built-in template, cannot be deleted',
  `is_shared`       TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '1=visible to all company users',
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME      NULL DEFAULT NULL,
  `created_by`      BIGINT        NULL DEFAULT NULL,
  `updated_by`      BIGINT        NULL DEFAULT NULL,
  PRIMARY KEY (`template_id`),
  INDEX `idx_rpt_tenant`    (`tenant_id`),
  INDEX `idx_rpt_company`   (`company_id`),
  INDEX `idx_rpt_module`    (`module`),
  INDEX `idx_rpt_system`    (`is_system`),
  CONSTRAINT `fk_rpt_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rpt_tenant`  FOREIGN KEY (`tenant_id`)  REFERENCES `tenants`   (`tenant_id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ══════════════════════════════════════════════════════════════
-- NEW TABLE: report_runs
-- ══════════════════════════════════════════════════════════════
SELECT '  → report_runs (NEW)' AS migration_log;
CREATE TABLE IF NOT EXISTS `report_runs` (
  `run_id`          BIGINT        NOT NULL AUTO_INCREMENT,
  `template_id`     BIGINT        NOT NULL,
  `tenant_id`       BIGINT        NOT NULL,
  `company_id`      BIGINT        NOT NULL,
  `run_by`          BIGINT        NOT NULL,
  `status`          VARCHAR(50)   NOT NULL DEFAULT 'PENDING' COMMENT 'PENDING|RUNNING|DONE|FAILED',
  `output_file_id`  BIGINT        NULL DEFAULT NULL COMMENT 'FK → file_uploads',
  `output_url`      VARCHAR(1000) NULL,
  `filters_json`    JSON          NULL COMMENT 'Runtime filter overrides',
  `row_count`       INT           NULL COMMENT 'Number of result rows',
  `started_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at`    DATETIME      NULL,
  `duration_ms`     INT           NULL,
  `error_message`   TEXT          NULL,
  PRIMARY KEY (`run_id`),
  INDEX `idx_runs_template`  (`template_id`),
  INDEX `idx_runs_tenant`    (`tenant_id`),
  INDEX `idx_runs_company`   (`company_id`),
  INDEX `idx_runs_user`      (`run_by`),
  INDEX `idx_runs_status`    (`tenant_id`, `status`),
  CONSTRAINT `fk_runs_template` FOREIGN KEY (`template_id`) REFERENCES `report_templates` (`template_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_runs_user`     FOREIGN KEY (`run_by`)      REFERENCES `users`            (`user_id`)     ON DELETE CASCADE,
  CONSTRAINT `fk_runs_company`  FOREIGN KEY (`company_id`)  REFERENCES `companies`        (`company_id`)  ON DELETE CASCADE,
  CONSTRAINT `fk_runs_tenant`   FOREIGN KEY (`tenant_id`)   REFERENCES `tenants`          (`tenant_id`)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ══════════════════════════════════════════════════════════════
-- NEW TABLE: system_settings
-- ══════════════════════════════════════════════════════════════
SELECT '  → system_settings (NEW)' AS migration_log;
CREATE TABLE IF NOT EXISTS `system_settings` (
  `setting_id`      BIGINT        NOT NULL AUTO_INCREMENT,
  `tenant_id`       BIGINT        NULL DEFAULT NULL COMMENT 'NULL = global platform setting',
  `company_id`      BIGINT        NULL DEFAULT NULL COMMENT 'NULL = tenant-wide setting',
  `key`             VARCHAR(255)  NOT NULL,
  `value`           TEXT          NOT NULL,
  `type`            VARCHAR(50)   NOT NULL DEFAULT 'STRING' COMMENT 'STRING|NUMBER|BOOLEAN|JSON',
  `description`     VARCHAR(500)  NULL,
  `is_public`       TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '1=visible to frontend without auth',
  `is_encrypted`    TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '1=value is encrypted at rest',
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by`      BIGINT        NULL DEFAULT NULL,
  PRIMARY KEY (`setting_id`),
  UNIQUE KEY `uq_setting_scope` (`tenant_id`, `company_id`, `key`),
  INDEX `idx_settings_tenant`  (`tenant_id`),
  INDEX `idx_settings_company` (`company_id`),
  INDEX `idx_settings_public`  (`is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✓ Phase 7 — Workflow, Reporting & Analytics complete.' AS migration_log;
