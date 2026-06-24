-- ============================================================
-- FILE: migration/RUN_ALL.sql
-- PURPOSE: Master runner — executes all phases in correct order
-- USAGE: mysql -u root -p amdox_db < migration/RUN_ALL.sql
-- ⚠ ALWAYS TAKE A BACKUP BEFORE RUNNING ON PRODUCTION
-- ============================================================

-- Pre-flight check
SOURCE 00_preflight.sql;

-- Phase 1: Core tables (tenants, companies, departments, users, roles, audit_logs)
SOURCE 01_core_tables.sql;

-- Phase 2: HRMS (attendance, leave, payroll + NEW leave_types, salary_components)
SOURCE 02_hrms.sql;

-- Phase 3: Projects (projects, tasks, timesheets + milestones, documents)
SOURCE 03_projects.sql;

-- Phase 4: Finance (expenses, invoices, vendors + NEW chart_of_accounts, journal_entries, journal_lines, tax_rates)
SOURCE 04_finance.sql;

-- Phase 5: Inventory (NEW inventory_items, purchase_orders, purchase_order_lines, stock_movements)
SOURCE 05_inventory.sql;

-- Phase 6: CRM + Assets (leads, clients, assets + NEW lead_activities)
SOURCE 06_crm_assets.sql;

-- Phase 7: Workflow + Reporting (approvals, notifications + NEW file_uploads, kpi_snapshots, dashboard_widgets, report_templates, report_runs, system_settings)
SOURCE 07_workflow_reports.sql;

-- Phase 8: Composite indexes (performance)
SOURCE 08_indexes.sql;

-- Phase 9: Foreign keys (referential integrity)
SOURCE 09_foreign_keys.sql;

SELECT '════════════════════════════════════════════════════════' AS result;
SELECT '✓ amdox_db Enterprise Upgrade COMPLETE'                  AS result;
SELECT '  Next steps:'                                            AS result;
SELECT '  1. npx prisma db pull'                                  AS result;
SELECT '  2. npx prisma generate'                                 AS result;
SELECT '  3. npm run build (backend)'                             AS result;
SELECT '════════════════════════════════════════════════════════' AS result;
