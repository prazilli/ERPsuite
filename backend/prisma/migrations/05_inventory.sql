-- ============================================================
-- FILE: migration/05_inventory.sql
-- PURPOSE: Inventory module — new tables
-- SAFE: CREATE TABLE IF NOT EXISTS only. Idempotent.
-- REQUIRES: 00_preflight.sql + 01_core_tables.sql + 04_finance.sql
-- ============================================================
USE `amdox_db`;

SELECT '▶ Phase 5 — Inventory Module' AS migration_log;

-- ══════════════════════════════════════════════════════════════
-- NEW TABLE: inventory_items
-- ══════════════════════════════════════════════════════════════
SELECT '  → inventory_items (NEW)' AS migration_log;
CREATE TABLE IF NOT EXISTS `inventory_items` (
  `item_id`           BIGINT          NOT NULL AUTO_INCREMENT,
  `tenant_id`         BIGINT          NOT NULL,
  `company_id`        BIGINT          NOT NULL,
  `sku`               VARCHAR(100)    NOT NULL,
  `name`              VARCHAR(255)    NOT NULL,
  `description`       TEXT            NULL,
  `category`          VARCHAR(100)    NULL,
  `unit`              VARCHAR(50)     NOT NULL DEFAULT 'UNIT' COMMENT 'UNIT|KG|LTR|MTR|BOX|SET',
  `unit_price`        DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
  `cost_price`        DECIMAL(15,2)   NOT NULL DEFAULT 0.00,
  `stock_qty`         DECIMAL(12,3)   NOT NULL DEFAULT 0.000,
  `reserved_qty`      DECIMAL(12,3)   NOT NULL DEFAULT 0.000 COMMENT 'Qty locked in pending POs',
  `reorder_level`     DECIMAL(12,3)   NOT NULL DEFAULT 0.000,
  `reorder_qty`       DECIMAL(12,3)   NOT NULL DEFAULT 0.000 COMMENT 'Suggested order qty on reorder',
  `tax_rate_id`       BIGINT          NULL DEFAULT NULL,
  `coa_account_id`    BIGINT          NULL DEFAULT NULL COMMENT 'Inventory asset account in COA',
  `barcode`           VARCHAR(100)    NULL,
  `image_url`         VARCHAR(500)    NULL,
  `is_active`         TINYINT(1)      NOT NULL DEFAULT 1,
  `created_at`        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`        DATETIME        NULL DEFAULT NULL,
  `created_by`        BIGINT          NULL DEFAULT NULL,
  `updated_by`        BIGINT          NULL DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  UNIQUE KEY  `uq_sku_company`        (`company_id`, `sku`),
  INDEX `idx_inv_tenant`              (`tenant_id`),
  INDEX `idx_inv_company`             (`company_id`),
  INDEX `idx_inv_tenant_active`       (`tenant_id`, `is_active`),
  INDEX `idx_inv_company_active`      (`company_id`, `is_active`),
  INDEX `idx_inv_reorder`             (`company_id`, `stock_qty`, `reorder_level`),
  CONSTRAINT `fk_inv_company`     FOREIGN KEY (`company_id`)    REFERENCES `companies`         (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_inv_tenant`      FOREIGN KEY (`tenant_id`)     REFERENCES `tenants`           (`tenant_id`)  ON DELETE CASCADE,
  CONSTRAINT `fk_inv_tax_rate`    FOREIGN KEY (`tax_rate_id`)   REFERENCES `tax_rates`         (`tax_id`)     ON DELETE SET NULL,
  CONSTRAINT `fk_inv_coa`         FOREIGN KEY (`coa_account_id`)REFERENCES `chart_of_accounts` (`account_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ══════════════════════════════════════════════════════════════
-- NEW TABLE: purchase_orders
-- ══════════════════════════════════════════════════════════════
SELECT '  → purchase_orders (NEW)' AS migration_log;
CREATE TABLE IF NOT EXISTS `purchase_orders` (
  `po_id`           BIGINT        NOT NULL AUTO_INCREMENT,
  `tenant_id`       BIGINT        NOT NULL,
  `company_id`      BIGINT        NOT NULL,
  `vendor_id`       BIGINT        NOT NULL,
  `po_number`       VARCHAR(100)  NOT NULL,
  `status`          VARCHAR(50)   NOT NULL DEFAULT 'DRAFT' COMMENT 'DRAFT|SENT|PARTIAL|RECEIVED|CANCELLED',
  `order_date`      DATE          NOT NULL,
  `expected_date`   DATE          NULL,
  `received_date`   DATE          NULL,
  `currency_code`   VARCHAR(10)   NOT NULL DEFAULT 'USD',
  `subtotal`        DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `tax_amount`      DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `shipping_cost`   DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `total_amount`    DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `approved_by_id`  BIGINT        NULL DEFAULT NULL,
  `approved_at`     DATETIME      NULL DEFAULT NULL,
  `notes`           TEXT          NULL,
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at`      DATETIME      NULL DEFAULT NULL,
  `created_by`      BIGINT        NULL DEFAULT NULL,
  `updated_by`      BIGINT        NULL DEFAULT NULL,
  PRIMARY KEY (`po_id`),
  UNIQUE KEY  `uq_po_number_company` (`company_id`, `po_number`),
  INDEX `idx_po_tenant`           (`tenant_id`),
  INDEX `idx_po_company`          (`company_id`),
  INDEX `idx_po_vendor`           (`vendor_id`),
  INDEX `idx_po_tenant_status`    (`tenant_id`, `status`),
  INDEX `idx_po_company_status`   (`company_id`, `status`),
  INDEX `idx_po_date`             (`order_date`),
  CONSTRAINT `fk_po_company`      FOREIGN KEY (`company_id`)   REFERENCES `companies` (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_po_tenant`       FOREIGN KEY (`tenant_id`)    REFERENCES `tenants`   (`tenant_id`)  ON DELETE CASCADE,
  CONSTRAINT `fk_po_vendor`       FOREIGN KEY (`vendor_id`)    REFERENCES `vendors`   (`vendor_id`)  ON DELETE RESTRICT,
  CONSTRAINT `fk_po_approver`     FOREIGN KEY (`approved_by_id`) REFERENCES `users`   (`user_id`)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ══════════════════════════════════════════════════════════════
-- NEW TABLE: purchase_order_lines
-- ══════════════════════════════════════════════════════════════
SELECT '  → purchase_order_lines (NEW)' AS migration_log;
CREATE TABLE IF NOT EXISTS `purchase_order_lines` (
  `line_id`         BIGINT        NOT NULL AUTO_INCREMENT,
  `po_id`           BIGINT        NOT NULL,
  `tenant_id`       BIGINT        NOT NULL,
  `item_id`         BIGINT        NULL DEFAULT NULL,
  `description`     TEXT          NULL COMMENT 'Used if item_id is null (free-text line)',
  `quantity`        DECIMAL(12,3) NOT NULL,
  `unit_price`      DECIMAL(15,2) NOT NULL,
  `tax_rate_id`     BIGINT        NULL DEFAULT NULL,
  `tax_amount`      DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `line_total`      DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `received_qty`    DECIMAL(12,3) NOT NULL DEFAULT 0.000 COMMENT 'Updated as goods received',
  `created_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`line_id`),
  INDEX `idx_pol_po`      (`po_id`),
  INDEX `idx_pol_item`    (`item_id`),
  INDEX `idx_pol_tenant`  (`tenant_id`),
  CONSTRAINT `fk_pol_po`       FOREIGN KEY (`po_id`)       REFERENCES `purchase_orders` (`po_id`)     ON DELETE CASCADE,
  CONSTRAINT `fk_pol_item`     FOREIGN KEY (`item_id`)     REFERENCES `inventory_items` (`item_id`)   ON DELETE SET NULL,
  CONSTRAINT `fk_pol_tax`      FOREIGN KEY (`tax_rate_id`) REFERENCES `tax_rates`       (`tax_id`)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ══════════════════════════════════════════════════════════════
-- NEW TABLE: stock_movements  (for inventory audit trail)
-- ══════════════════════════════════════════════════════════════
SELECT '  → stock_movements (NEW)' AS migration_log;
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `movement_id`     BIGINT        NOT NULL AUTO_INCREMENT,
  `tenant_id`       BIGINT        NOT NULL,
  `company_id`      BIGINT        NOT NULL,
  `item_id`         BIGINT        NOT NULL,
  `type`            VARCHAR(50)   NOT NULL COMMENT 'IN|OUT|ADJUSTMENT|TRANSFER',
  `quantity`        DECIMAL(12,3) NOT NULL COMMENT 'Positive=IN, Negative=OUT',
  `unit_cost`       DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  `reference_type`  VARCHAR(100)  NULL COMMENT 'PO|SALE|ADJUSTMENT|RETURN',
  `reference_id`    BIGINT        NULL,
  `notes`           TEXT          NULL,
  `moved_at`        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by`      BIGINT        NULL DEFAULT NULL,
  PRIMARY KEY (`movement_id`),
  INDEX `idx_sm_tenant`    (`tenant_id`),
  INDEX `idx_sm_company`   (`company_id`),
  INDEX `idx_sm_item`      (`item_id`),
  INDEX `idx_sm_type`      (`tenant_id`, `type`),
  CONSTRAINT `fk_sm_item`    FOREIGN KEY (`item_id`)    REFERENCES `inventory_items` (`item_id`)   ON DELETE CASCADE,
  CONSTRAINT `fk_sm_company` FOREIGN KEY (`company_id`) REFERENCES `companies`       (`company_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sm_tenant`  FOREIGN KEY (`tenant_id`)  REFERENCES `tenants`         (`tenant_id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SELECT '✓ Phase 5 — Inventory Module complete.' AS migration_log;
