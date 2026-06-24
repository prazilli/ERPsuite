-- ============================================================
-- FILE: migration/03_projects.sql
-- PURPOSE: Project Management module upgrades
-- SAFE: Additive only. No DROP. No TRUNCATE. Idempotent.
-- REQUIRES: 00_preflight.sql + 01_core_tables.sql
-- ============================================================
USE `amdox_db`;

SELECT '▶ Phase 3 — Project Management Module' AS migration_log;

-- ══════════════════════════════════════════════════════════════
-- TABLE: projects
-- ══════════════════════════════════════════════════════════════
SELECT '  → projects' AS migration_log;
CALL add_column_if_not_exists('projects', 'tenant_id',         "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `project_id`");
CALL add_column_if_not_exists('projects', 'department_id',     "`department_id` BIGINT NULL DEFAULT NULL AFTER `company_id`");
CALL add_column_if_not_exists('projects', 'client_id',         "`client_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('projects', 'manager_id',        "`manager_id` BIGINT NULL DEFAULT NULL COMMENT 'Project Manager (FK → users)'");
CALL add_column_if_not_exists('projects', 'priority',          "`priority` VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' COMMENT 'LOW|MEDIUM|HIGH|CRITICAL'");
CALL add_column_if_not_exists('projects', 'type',              "`type` VARCHAR(100) NULL COMMENT 'INTERNAL|CLIENT|RND'");
CALL add_column_if_not_exists('projects', 'currency_code',     "`currency_code` VARCHAR(10) NOT NULL DEFAULT 'USD'");
CALL add_column_if_not_exists('projects', 'billable',          "`billable` TINYINT(1) NOT NULL DEFAULT 1");
CALL add_column_if_not_exists('projects', 'actual_cost',       "`actual_cost` DECIMAL(15,2) NOT NULL DEFAULT 0.00 COMMENT 'Sum of timesheets + expenses'");
CALL add_column_if_not_exists('projects', 'actual_hours',      "`actual_hours` DECIMAL(10,2) NOT NULL DEFAULT 0.00");
CALL add_column_if_not_exists('projects', 'tags',              "`tags` VARCHAR(500) NULL");
CALL add_column_if_not_exists('projects', 'updated_at',        "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('projects', 'deleted_at',        "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('projects', 'created_by',        "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('projects', 'updated_by',        "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `projects` p
  JOIN `companies` c ON c.company_id = p.company_id
SET p.tenant_id = c.tenant_id
WHERE p.tenant_id IS NULL;

ALTER TABLE `projects` MODIFY COLUMN `tenant_id` BIGINT NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: project_assignments  (amdox_db name: may be project_members)
-- ══════════════════════════════════════════════════════════════
SELECT '  → project_assignments' AS migration_log;
CALL add_column_if_not_exists('project_assignments', 'tenant_id',     "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `assignment_id`");
CALL add_column_if_not_exists('project_assignments', 'joined_at',     "`joined_at` DATE NULL DEFAULT NULL");
CALL add_column_if_not_exists('project_assignments', 'left_at',       "`left_at` DATE NULL DEFAULT NULL");
CALL add_column_if_not_exists('project_assignments', 'is_active',     "`is_active` TINYINT(1) NOT NULL DEFAULT 1");
CALL add_column_if_not_exists('project_assignments', 'created_at',    "`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('project_assignments', 'updated_at',    "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('project_assignments', 'created_by',    "`created_by` BIGINT NULL DEFAULT NULL");

UPDATE `project_assignments` pa
  JOIN `projects` p ON p.project_id = pa.project_id
SET pa.tenant_id = p.tenant_id
WHERE pa.tenant_id IS NULL;

-- Compatibility view for amdox_db which may reference project_members
CREATE OR REPLACE VIEW `project_members` AS SELECT * FROM `project_assignments`;

-- ══════════════════════════════════════════════════════════════
-- TABLE: project_milestones
-- ══════════════════════════════════════════════════════════════
SELECT '  → project_milestones' AS migration_log;
CALL add_column_if_not_exists('project_milestones', 'tenant_id',       "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `milestone_id`");
CALL add_column_if_not_exists('project_milestones', 'company_id',      "`company_id` BIGINT NULL DEFAULT NULL AFTER `tenant_id`");
CALL add_column_if_not_exists('project_milestones', 'completed_at',    "`completed_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('project_milestones', 'description',     "`description` TEXT NULL");
CALL add_column_if_not_exists('project_milestones', 'created_at',      "`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('project_milestones', 'updated_at',      "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('project_milestones', 'created_by',      "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('project_milestones', 'updated_by',      "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `project_milestones` pm
  JOIN `projects` p ON p.project_id = pm.project_id
SET pm.tenant_id = p.tenant_id, pm.company_id = p.company_id
WHERE pm.tenant_id IS NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: tasks
-- ══════════════════════════════════════════════════════════════
SELECT '  → tasks' AS migration_log;
CALL add_column_if_not_exists('tasks', 'tenant_id',       "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `task_id`");
CALL add_column_if_not_exists('tasks', 'company_id',      "`company_id` BIGINT NULL DEFAULT NULL AFTER `tenant_id`");
CALL add_column_if_not_exists('tasks', 'milestone_id',    "`milestone_id` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('tasks', 'parent_task_id',  "`parent_task_id` BIGINT NULL DEFAULT NULL COMMENT 'For sub-tasks self-reference'");
CALL add_column_if_not_exists('tasks', 'actual_hours',    "`actual_hours` DECIMAL(8,2) NOT NULL DEFAULT 0.00 COMMENT 'Sum of timesheet entries'");
CALL add_column_if_not_exists('tasks', 'start_date',      "`start_date` DATE NULL DEFAULT NULL");
CALL add_column_if_not_exists('tasks', 'completed_at',    "`completed_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('tasks', 'tags',            "`tags` VARCHAR(500) NULL");
CALL add_column_if_not_exists('tasks', 'created_at',      "`created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('tasks', 'updated_at',      "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('tasks', 'deleted_at',      "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('tasks', 'created_by',      "`created_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('tasks', 'updated_by',      "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `tasks` t
  JOIN `projects` p ON p.project_id = t.project_id
SET t.tenant_id = p.tenant_id, t.company_id = p.company_id
WHERE t.tenant_id IS NULL;

ALTER TABLE `tasks` MODIFY COLUMN `tenant_id` BIGINT NOT NULL;
ALTER TABLE `tasks` MODIFY COLUMN `company_id` BIGINT NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: timesheets
-- ══════════════════════════════════════════════════════════════
SELECT '  → timesheets' AS migration_log;
CALL add_column_if_not_exists('timesheets', 'tenant_id',    "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `timesheet_id`");
CALL add_column_if_not_exists('timesheets', 'company_id',   "`company_id` BIGINT NULL DEFAULT NULL AFTER `tenant_id`");
CALL add_column_if_not_exists('timesheets', 'project_id',   "`project_id` BIGINT NULL DEFAULT NULL COMMENT 'Denormalized for fast queries'");
CALL add_column_if_not_exists('timesheets', 'is_billable',  "`is_billable` TINYINT(1) NOT NULL DEFAULT 1");
CALL add_column_if_not_exists('timesheets', 'status',       "`status` VARCHAR(50) NOT NULL DEFAULT 'SUBMITTED' COMMENT 'SUBMITTED|APPROVED|REJECTED'");
CALL add_column_if_not_exists('timesheets', 'approved_by',  "`approved_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('timesheets', 'approved_at',  "`approved_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('timesheets', 'updated_at',   "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('timesheets', 'deleted_at',   "`deleted_at` DATETIME NULL DEFAULT NULL");
CALL add_column_if_not_exists('timesheets', 'updated_by',   "`updated_by` BIGINT NULL DEFAULT NULL");

UPDATE `timesheets` ts
  JOIN `users` u ON u.user_id = ts.user_id
SET ts.tenant_id = u.tenant_id, ts.company_id = u.company_id
WHERE ts.tenant_id IS NULL;

ALTER TABLE `timesheets` MODIFY COLUMN `tenant_id` BIGINT NOT NULL;
ALTER TABLE `timesheets` MODIFY COLUMN `company_id` BIGINT NOT NULL;

-- ══════════════════════════════════════════════════════════════
-- TABLE: project_documents
-- ══════════════════════════════════════════════════════════════
SELECT '  → project_documents' AS migration_log;
CALL add_column_if_not_exists('project_documents', 'tenant_id',    "`tenant_id` BIGINT NULL DEFAULT NULL AFTER `document_id`");
CALL add_column_if_not_exists('project_documents', 'company_id',   "`company_id` BIGINT NULL DEFAULT NULL AFTER `tenant_id`");
CALL add_column_if_not_exists('project_documents', 'file_type',    "`file_type` VARCHAR(100) NULL");
CALL add_column_if_not_exists('project_documents', 'file_size_kb', "`file_size_kb` INT NOT NULL DEFAULT 0");
CALL add_column_if_not_exists('project_documents', 'uploaded_by',  "`uploaded_by` BIGINT NULL DEFAULT NULL");
CALL add_column_if_not_exists('project_documents', 'updated_at',   "`updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");
CALL add_column_if_not_exists('project_documents', 'deleted_at',   "`deleted_at` DATETIME NULL DEFAULT NULL");

UPDATE `project_documents` pd
  JOIN `projects` p ON p.project_id = pd.project_id
SET pd.tenant_id = p.tenant_id, pd.company_id = p.company_id
WHERE pd.tenant_id IS NULL;

SELECT '✓ Phase 3 — Project Management complete.' AS migration_log;
