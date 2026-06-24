-- ============================================================
-- FILE: migration/09_foreign_keys.sql
-- PURPOSE: All missing FK constraints across the schema
-- SAFE: Uses add_fk_if_not_exists — fully idempotent
-- REQUIRES: All previous migration scripts (00-08)
-- ============================================================
USE `amdox_db`;

SELECT '▶ Phase 9 — Foreign Key Enforcement' AS migration_log;

SET FOREIGN_KEY_CHECKS = 0;

-- ── departments → tenants ────────────────────────────────────
CALL add_fk_if_not_exists('departments', 'fk_dept_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');

CALL add_fk_if_not_exists('departments', 'fk_dept_head_user',
  'FOREIGN KEY (`head_user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL');

-- ── users → tenants ──────────────────────────────────────────
CALL add_fk_if_not_exists('users', 'fk_users_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');

-- ── employee_profiles → tenants/companies ────────────────────
CALL add_fk_if_not_exists('employee_profiles', 'fk_ep_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('employee_profiles', 'fk_ep_company',
  'FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('employee_profiles', 'fk_ep_department',
  'FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL');

-- ── attendance → companies + tenants ─────────────────────────
CALL add_fk_if_not_exists('attendance', 'fk_att_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('attendance', 'fk_att_company',
  'FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('attendance', 'fk_att_department',
  'FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL');

-- ── leave_requests ───────────────────────────────────────────
CALL add_fk_if_not_exists('leave_requests', 'fk_lr_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('leave_requests', 'fk_lr_company',
  'FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('leave_requests', 'fk_lr_leave_type',
  'FOREIGN KEY (`leave_type_id`) REFERENCES `leave_types` (`leave_type_id`) ON DELETE SET NULL');
CALL add_fk_if_not_exists('leave_requests', 'fk_lr_approver',
  'FOREIGN KEY (`approved_by_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL');

-- ── payroll ──────────────────────────────────────────────────
CALL add_fk_if_not_exists('payroll', 'fk_pay_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('payroll', 'fk_pay_company',
  'FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('payroll', 'fk_pay_approver',
  'FOREIGN KEY (`approved_by_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL');

-- ── salary_structures ─────────────────────────────────────────
CALL add_fk_if_not_exists('salary_structures', 'fk_ss_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('salary_structures', 'fk_ss_company',
  'FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE');

-- ── projects ─────────────────────────────────────────────────
CALL add_fk_if_not_exists('projects', 'fk_proj_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('projects', 'fk_proj_manager',
  'FOREIGN KEY (`manager_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL');
CALL add_fk_if_not_exists('projects', 'fk_proj_client',
  'FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`) ON DELETE SET NULL');
CALL add_fk_if_not_exists('projects', 'fk_proj_department',
  'FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL');

-- ── tasks ────────────────────────────────────────────────────
CALL add_fk_if_not_exists('tasks', 'fk_tasks_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('tasks', 'fk_tasks_company',
  'FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('tasks', 'fk_tasks_milestone',
  'FOREIGN KEY (`milestone_id`) REFERENCES `project_milestones` (`milestone_id`) ON DELETE SET NULL');
CALL add_fk_if_not_exists('tasks', 'fk_tasks_parent',
  'FOREIGN KEY (`parent_task_id`) REFERENCES `tasks` (`task_id`) ON DELETE SET NULL');

-- ── timesheets ───────────────────────────────────────────────
CALL add_fk_if_not_exists('timesheets', 'fk_ts_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('timesheets', 'fk_ts_company',
  'FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('timesheets', 'fk_ts_project',
  'FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('timesheets', 'fk_ts_approver',
  'FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL');

-- ── expenses ─────────────────────────────────────────────────
CALL add_fk_if_not_exists('expenses', 'fk_exp_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('expenses', 'fk_exp_project',
  'FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE SET NULL');
CALL add_fk_if_not_exists('expenses', 'fk_exp_approver',
  'FOREIGN KEY (`approved_by_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL');
CALL add_fk_if_not_exists('expenses', 'fk_exp_department',
  'FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL');

-- ── invoices ─────────────────────────────────────────────────
CALL add_fk_if_not_exists('invoices', 'fk_inv_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('invoices', 'fk_inv_project',
  'FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`) ON DELETE SET NULL');

-- ── vendors ──────────────────────────────────────────────────
CALL add_fk_if_not_exists('vendors', 'fk_vendors_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');

-- ── vendor_bills ─────────────────────────────────────────────
CALL add_fk_if_not_exists('vendor_bills', 'fk_vb_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');

-- ── leads ────────────────────────────────────────────────────
CALL add_fk_if_not_exists('leads', 'fk_leads_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('leads', 'fk_leads_assigned',
  'FOREIGN KEY (`assigned_to_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL');
CALL add_fk_if_not_exists('leads', 'fk_leads_client',
  'FOREIGN KEY (`client_id`) REFERENCES `clients` (`client_id`) ON DELETE SET NULL');
CALL add_fk_if_not_exists('leads', 'fk_leads_department',
  'FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL');

-- ── clients ──────────────────────────────────────────────────
CALL add_fk_if_not_exists('clients', 'fk_clients_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('clients', 'fk_clients_assigned',
  'FOREIGN KEY (`assigned_to_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL');

-- ── assets ───────────────────────────────────────────────────
CALL add_fk_if_not_exists('assets', 'fk_assets_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('assets', 'fk_assets_vendor',
  'FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`vendor_id`) ON DELETE SET NULL');
CALL add_fk_if_not_exists('assets', 'fk_assets_department',
  'FOREIGN KEY (`department_id`) REFERENCES `departments` (`department_id`) ON DELETE SET NULL');

-- ── asset_assignments ─────────────────────────────────────────
CALL add_fk_if_not_exists('asset_assignments', 'fk_aa_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('asset_assignments', 'fk_aa_company',
  'FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE');

-- ── approvals ────────────────────────────────────────────────
CALL add_fk_if_not_exists('approvals', 'fk_appr_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');

-- ── notifications ─────────────────────────────────────────────
CALL add_fk_if_not_exists('notifications', 'fk_notif_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE CASCADE');
CALL add_fk_if_not_exists('notifications', 'fk_notif_company',
  'FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE');

-- ── audit_logs ───────────────────────────────────────────────
CALL add_fk_if_not_exists('audit_logs', 'fk_audit_tenant',
  'FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`tenant_id`) ON DELETE SET NULL');
CALL add_fk_if_not_exists('audit_logs', 'fk_audit_company',
  'FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE SET NULL');

SET FOREIGN_KEY_CHECKS = 1;

SELECT '✓ Phase 9 — Foreign Keys complete.' AS migration_log;
SELECT '═══════════════════════════════════════════════' AS migration_log;
SELECT '✓ ALL PHASES COMPLETE. amdox_db is upgraded.'  AS migration_log;
SELECT '  Run: npx prisma db pull && npx prisma generate' AS migration_log;
SELECT '═══════════════════════════════════════════════' AS migration_log;
