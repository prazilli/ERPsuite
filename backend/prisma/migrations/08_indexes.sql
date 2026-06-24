-- ============================================================
-- FILE: migration/08_indexes.sql
-- PURPOSE: All composite performance indexes across every table
-- SAFE: Uses add_index_if_not_exists — fully idempotent
-- REQUIRES: All previous migration scripts (00-07)
-- ============================================================
USE `amdox_db`;

SELECT '▶ Phase 8 — Composite Indexes' AS migration_log;

-- ── tenants ──────────────────────────────────────────────────
CALL add_index_if_not_exists('tenants', 'idx_tenants_active',   'INDEX `idx_tenants_active` (`is_active`)');

-- ── companies ────────────────────────────────────────────────
CALL add_index_if_not_exists('companies', 'idx_comp_tenant',        'INDEX `idx_comp_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('companies', 'idx_comp_tenant_active', 'INDEX `idx_comp_tenant_active` (`tenant_id`, `is_active`)');

-- ── departments ───────────────────────────────────────────────
CALL add_index_if_not_exists('departments', 'idx_dept_tenant',           'INDEX `idx_dept_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('departments', 'idx_dept_company',          'INDEX `idx_dept_company` (`company_id`)');
CALL add_index_if_not_exists('departments', 'idx_dept_head',             'INDEX `idx_dept_head` (`head_user_id`)');

-- ── roles ─────────────────────────────────────────────────────
CALL add_index_if_not_exists('roles', 'idx_roles_tenant',      'INDEX `idx_roles_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('roles', 'idx_roles_system',      'INDEX `idx_roles_system` (`is_system`)');

-- ── users ─────────────────────────────────────────────────────
CALL add_index_if_not_exists('users', 'idx_users_tenant',           'INDEX `idx_users_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('users', 'idx_users_company',          'INDEX `idx_users_company` (`company_id`)');
CALL add_index_if_not_exists('users', 'idx_users_department',       'INDEX `idx_users_department` (`department_id`)');
CALL add_index_if_not_exists('users', 'idx_users_role',             'INDEX `idx_users_role` (`role_id`)');
CALL add_index_if_not_exists('users', 'idx_users_tenant_active',    'INDEX `idx_users_tenant_active` (`tenant_id`, `is_active`)');
CALL add_index_if_not_exists('users', 'idx_users_company_active',   'INDEX `idx_users_company_active` (`company_id`, `is_active`)');
CALL add_index_if_not_exists('users', 'idx_users_deleted',          'INDEX `idx_users_deleted` (`deleted_at`)');

-- ── email_verifications ───────────────────────────────────────
CALL add_index_if_not_exists('email_verifications', 'idx_ev_user_purpose',  'INDEX `idx_ev_user_purpose` (`user_id`, `purpose`)');
CALL add_index_if_not_exists('email_verifications', 'idx_ev_expires',       'INDEX `idx_ev_expires` (`expires_at`)');
CALL add_index_if_not_exists('email_verifications', 'idx_ev_verified',      'INDEX `idx_ev_verified` (`verified`)');

-- ── refresh_tokens ────────────────────────────────────────────
CALL add_index_if_not_exists('refresh_tokens', 'idx_rt_user_revoked',  'INDEX `idx_rt_user_revoked` (`user_id`, `revoked`)');
CALL add_index_if_not_exists('refresh_tokens', 'idx_rt_expires',       'INDEX `idx_rt_expires` (`expires_at`)');

-- ── employee_profiles ─────────────────────────────────────────
CALL add_index_if_not_exists('employee_profiles', 'idx_ep_tenant',        'INDEX `idx_ep_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('employee_profiles', 'idx_ep_company',       'INDEX `idx_ep_company` (`company_id`)');
CALL add_index_if_not_exists('employee_profiles', 'idx_ep_manager',       'INDEX `idx_ep_manager` (`manager_id`)');
CALL add_index_if_not_exists('employee_profiles', 'idx_ep_status',        'INDEX `idx_ep_status` (`tenant_id`, `status`)');
CALL add_index_if_not_exists('employee_profiles', 'idx_ep_emp_number',    'INDEX `idx_ep_emp_number` (`company_id`, `employee_number`)');

-- ── attendance ────────────────────────────────────────────────
CALL add_index_if_not_exists('attendance', 'idx_att_tenant',          'INDEX `idx_att_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('attendance', 'idx_att_company',         'INDEX `idx_att_company` (`company_id`)');
CALL add_index_if_not_exists('attendance', 'idx_att_user_date',       'INDEX `idx_att_user_date` (`user_id`, `date`)');
CALL add_index_if_not_exists('attendance', 'idx_att_company_status',  'INDEX `idx_att_company_status` (`company_id`, `status`)');
CALL add_index_if_not_exists('attendance', 'idx_att_tenant_status',   'INDEX `idx_att_tenant_status` (`tenant_id`, `status`)');
CALL add_index_if_not_exists('attendance', 'idx_att_date',            'INDEX `idx_att_date` (`date`)');

-- ── leave_types ───────────────────────────────────────────────
-- (indexes defined in CREATE TABLE — already in place)

-- ── leave_requests ───────────────────────────────────────────
CALL add_index_if_not_exists('leave_requests', 'idx_lr_tenant',          'INDEX `idx_lr_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('leave_requests', 'idx_lr_company',         'INDEX `idx_lr_company` (`company_id`)');
CALL add_index_if_not_exists('leave_requests', 'idx_lr_company_status',  'INDEX `idx_lr_company_status` (`company_id`, `status`)');
CALL add_index_if_not_exists('leave_requests', 'idx_lr_user_status',     'INDEX `idx_lr_user_status` (`user_id`, `status`)');
CALL add_index_if_not_exists('leave_requests', 'idx_lr_tenant_status',   'INDEX `idx_lr_tenant_status` (`tenant_id`, `status`)');
CALL add_index_if_not_exists('leave_requests', 'idx_lr_dates',           'INDEX `idx_lr_dates` (`start_date`, `end_date`)');

-- ── payroll ──────────────────────────────────────────────────
CALL add_index_if_not_exists('payroll', 'idx_pay_tenant',          'INDEX `idx_pay_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('payroll', 'idx_pay_company',         'INDEX `idx_pay_company` (`company_id`)');
CALL add_index_if_not_exists('payroll', 'idx_pay_company_status',  'INDEX `idx_pay_company_status` (`company_id`, `status`)');
CALL add_index_if_not_exists('payroll', 'idx_pay_user_status',     'INDEX `idx_pay_user_status` (`user_id`, `status`)');
CALL add_index_if_not_exists('payroll', 'idx_pay_user_month',      'INDEX `idx_pay_user_month` (`user_id`, `month`)');

-- ── salary_structures ─────────────────────────────────────────
CALL add_index_if_not_exists('salary_structures', 'idx_ss_tenant',   'INDEX `idx_ss_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('salary_structures', 'idx_ss_company',  'INDEX `idx_ss_company` (`company_id`)');

-- ── projects ─────────────────────────────────────────────────
CALL add_index_if_not_exists('projects', 'idx_proj_tenant',          'INDEX `idx_proj_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('projects', 'idx_proj_company',         'INDEX `idx_proj_company` (`company_id`)');
CALL add_index_if_not_exists('projects', 'idx_proj_company_status',  'INDEX `idx_proj_company_status` (`company_id`, `status`)');
CALL add_index_if_not_exists('projects', 'idx_proj_tenant_status',   'INDEX `idx_proj_tenant_status` (`tenant_id`, `status`)');
CALL add_index_if_not_exists('projects', 'idx_proj_manager',         'INDEX `idx_proj_manager` (`manager_id`)');
CALL add_index_if_not_exists('projects', 'idx_proj_client',          'INDEX `idx_proj_client` (`client_id`)');
CALL add_index_if_not_exists('projects', 'idx_proj_dates',           'INDEX `idx_proj_dates` (`start_date`, `end_date`)');

-- ── tasks ────────────────────────────────────────────────────
CALL add_index_if_not_exists('tasks', 'idx_tasks_tenant',          'INDEX `idx_tasks_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('tasks', 'idx_tasks_company',         'INDEX `idx_tasks_company` (`company_id`)');
CALL add_index_if_not_exists('tasks', 'idx_tasks_project_status',  'INDEX `idx_tasks_project_status` (`project_id`, `status`)');
CALL add_index_if_not_exists('tasks', 'idx_tasks_company_status',  'INDEX `idx_tasks_company_status` (`company_id`, `status`)');
CALL add_index_if_not_exists('tasks', 'idx_tasks_user_status',     'INDEX `idx_tasks_user_status` (`assigned_to_id`, `status`)');
CALL add_index_if_not_exists('tasks', 'idx_tasks_tenant_status',   'INDEX `idx_tasks_tenant_status` (`tenant_id`, `status`)');
CALL add_index_if_not_exists('tasks', 'idx_tasks_due_date',        'INDEX `idx_tasks_due_date` (`due_date`)');
CALL add_index_if_not_exists('tasks', 'idx_tasks_parent',          'INDEX `idx_tasks_parent` (`parent_task_id`)');

-- ── timesheets ───────────────────────────────────────────────
CALL add_index_if_not_exists('timesheets', 'idx_ts_tenant',          'INDEX `idx_ts_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('timesheets', 'idx_ts_company',         'INDEX `idx_ts_company` (`company_id`)');
CALL add_index_if_not_exists('timesheets', 'idx_ts_user_status',     'INDEX `idx_ts_user_status` (`user_id`, `status`)');
CALL add_index_if_not_exists('timesheets', 'idx_ts_task',            'INDEX `idx_ts_task` (`task_id`)');
CALL add_index_if_not_exists('timesheets', 'idx_ts_project',         'INDEX `idx_ts_project` (`project_id`)');
CALL add_index_if_not_exists('timesheets', 'idx_ts_date',            'INDEX `idx_ts_date` (`date`)');

-- ── expenses ─────────────────────────────────────────────────
CALL add_index_if_not_exists('expenses', 'idx_exp_tenant',          'INDEX `idx_exp_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('expenses', 'idx_exp_company',         'INDEX `idx_exp_company` (`company_id`)');
CALL add_index_if_not_exists('expenses', 'idx_exp_company_status',  'INDEX `idx_exp_company_status` (`company_id`, `status`)');
CALL add_index_if_not_exists('expenses', 'idx_exp_user_status',     'INDEX `idx_exp_user_status` (`user_id`, `status`)');
CALL add_index_if_not_exists('expenses', 'idx_exp_tenant_status',   'INDEX `idx_exp_tenant_status` (`tenant_id`, `status`)');

-- ── invoices ─────────────────────────────────────────────────
CALL add_index_if_not_exists('invoices', 'idx_inv_tenant',          'INDEX `idx_inv_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('invoices', 'idx_inv_company',         'INDEX `idx_inv_company` (`company_id`)');
CALL add_index_if_not_exists('invoices', 'idx_inv_company_status',  'INDEX `idx_inv_company_status` (`company_id`, `status`)');
CALL add_index_if_not_exists('invoices', 'idx_inv_tenant_status',   'INDEX `idx_inv_tenant_status` (`tenant_id`, `status`)');
CALL add_index_if_not_exists('invoices', 'idx_inv_client',          'INDEX `idx_inv_client` (`client_id`)');
CALL add_index_if_not_exists('invoices', 'idx_inv_due_date',        'INDEX `idx_inv_due_date` (`due_date`)');

-- ── vendors ──────────────────────────────────────────────────
CALL add_index_if_not_exists('vendors', 'idx_vendors_tenant',        'INDEX `idx_vendors_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('vendors', 'idx_vendors_company',       'INDEX `idx_vendors_company` (`company_id`)');
CALL add_index_if_not_exists('vendors', 'idx_vendors_company_active','INDEX `idx_vendors_company_active` (`company_id`, `is_active`)');

-- ── vendor_bills ─────────────────────────────────────────────
CALL add_index_if_not_exists('vendor_bills', 'idx_vb_tenant',         'INDEX `idx_vb_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('vendor_bills', 'idx_vb_company',        'INDEX `idx_vb_company` (`company_id`)');
CALL add_index_if_not_exists('vendor_bills', 'idx_vb_company_status', 'INDEX `idx_vb_company_status` (`company_id`, `status`)');
CALL add_index_if_not_exists('vendor_bills', 'idx_vb_vendor',         'INDEX `idx_vb_vendor` (`vendor_id`)');
CALL add_index_if_not_exists('vendor_bills', 'idx_vb_due_date',       'INDEX `idx_vb_due_date` (`due_date`)');

-- ── leads ────────────────────────────────────────────────────
CALL add_index_if_not_exists('leads', 'idx_leads_tenant',          'INDEX `idx_leads_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('leads', 'idx_leads_company',         'INDEX `idx_leads_company` (`company_id`)');
CALL add_index_if_not_exists('leads', 'idx_leads_company_status',  'INDEX `idx_leads_company_status` (`company_id`, `status`)');
CALL add_index_if_not_exists('leads', 'idx_leads_tenant_status',   'INDEX `idx_leads_tenant_status` (`tenant_id`, `status`)');
CALL add_index_if_not_exists('leads', 'idx_leads_assigned',        'INDEX `idx_leads_assigned` (`assigned_to_id`, `status`)');

-- ── clients ──────────────────────────────────────────────────
CALL add_index_if_not_exists('clients', 'idx_clients_tenant',          'INDEX `idx_clients_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('clients', 'idx_clients_company',         'INDEX `idx_clients_company` (`company_id`)');
CALL add_index_if_not_exists('clients', 'idx_clients_company_active',  'INDEX `idx_clients_company_active` (`company_id`, `is_active`)');

-- ── assets ───────────────────────────────────────────────────
CALL add_index_if_not_exists('assets', 'idx_assets_tenant',          'INDEX `idx_assets_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('assets', 'idx_assets_company',         'INDEX `idx_assets_company` (`company_id`)');
CALL add_index_if_not_exists('assets', 'idx_assets_company_status',  'INDEX `idx_assets_company_status` (`company_id`, `condition`)');
CALL add_index_if_not_exists('assets', 'idx_assets_category',        'INDEX `idx_assets_category` (`company_id`, `category`)');
CALL add_index_if_not_exists('assets', 'idx_assets_vendor',          'INDEX `idx_assets_vendor` (`vendor_id`)');

-- ── approvals ────────────────────────────────────────────────
CALL add_index_if_not_exists('approvals', 'idx_appr_tenant',          'INDEX `idx_appr_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('approvals', 'idx_appr_company',         'INDEX `idx_appr_company` (`company_id`)');
CALL add_index_if_not_exists('approvals', 'idx_appr_company_status',  'INDEX `idx_appr_company_status` (`company_id`, `status`)');
CALL add_index_if_not_exists('approvals', 'idx_appr_tenant_status',   'INDEX `idx_appr_tenant_status` (`tenant_id`, `status`)');
CALL add_index_if_not_exists('approvals', 'idx_appr_user_status',     'INDEX `idx_appr_user_status` (`requested_by_id`, `status`)');
CALL add_index_if_not_exists('approvals', 'idx_appr_module',          'INDEX `idx_appr_module` (`module`, `record_id`)');
CALL add_index_if_not_exists('approvals', 'idx_appr_priority',        'INDEX `idx_appr_priority` (`tenant_id`, `priority`, `status`)');

-- ── notifications ─────────────────────────────────────────────
CALL add_index_if_not_exists('notifications', 'idx_notif_tenant',       'INDEX `idx_notif_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('notifications', 'idx_notif_company',      'INDEX `idx_notif_company` (`company_id`)');
CALL add_index_if_not_exists('notifications', 'idx_notif_user_read',    'INDEX `idx_notif_user_read` (`user_id`, `is_read`)');
CALL add_index_if_not_exists('notifications', 'idx_notif_user_type',    'INDEX `idx_notif_user_type` (`user_id`, `type`)');
CALL add_index_if_not_exists('notifications', 'idx_notif_expires',      'INDEX `idx_notif_expires` (`expires_at`)');

-- ── audit_logs ───────────────────────────────────────────────
CALL add_index_if_not_exists('audit_logs', 'idx_audit_tenant',       'INDEX `idx_audit_tenant` (`tenant_id`)');
CALL add_index_if_not_exists('audit_logs', 'idx_audit_company',      'INDEX `idx_audit_company` (`company_id`)');
CALL add_index_if_not_exists('audit_logs', 'idx_audit_user',         'INDEX `idx_audit_user` (`user_id`)');
CALL add_index_if_not_exists('audit_logs', 'idx_audit_module',       'INDEX `idx_audit_module` (`module`, `action`)');
CALL add_index_if_not_exists('audit_logs', 'idx_audit_ts',           'INDEX `idx_audit_ts` (`timestamp`)');
CALL add_index_if_not_exists('audit_logs', 'idx_audit_tenant_ts',    'INDEX `idx_audit_tenant_ts` (`tenant_id`, `timestamp`)');

SELECT '✓ Phase 8 — Indexes complete.' AS migration_log;
