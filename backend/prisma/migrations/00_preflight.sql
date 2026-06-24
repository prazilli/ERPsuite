-- ============================================================
-- FILE: migration/00_preflight.sql
-- PURPOSE: Idempotent helper stored procedures
-- SAFE: Re-runnable. Does NOT drop any existing tables or data.
-- ============================================================
USE `amdox_db`;

-- ── Helper: Add column only if it doesn't exist ────────────
DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DELIMITER $$
CREATE PROCEDURE add_column_if_not_exists(
  IN tbl     VARCHAR(64),
  IN col     VARCHAR(64),
  IN col_def TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = tbl
      AND COLUMN_NAME  = col
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN ', col_def);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    SELECT CONCAT('  ✓ Added column `', col, '` to `', tbl, '`') AS migration_log;
  ELSE
    SELECT CONCAT('  – Column `', col, '` already exists on `', tbl, '` — skipped') AS migration_log;
  END IF;
END$$
DELIMITER ;

-- ── Helper: Add index only if it doesn't exist ─────────────
DROP PROCEDURE IF EXISTS add_index_if_not_exists;
DELIMITER $$
CREATE PROCEDURE add_index_if_not_exists(
  IN tbl     VARCHAR(64),
  IN idx     VARCHAR(64),
  IN idx_def TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = tbl
      AND INDEX_NAME   = idx
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD ', idx_def);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    SELECT CONCAT('  ✓ Added index `', idx, '` to `', tbl, '`') AS migration_log;
  ELSE
    SELECT CONCAT('  – Index `', idx, '` already exists on `', tbl, '` — skipped') AS migration_log;
  END IF;
END$$
DELIMITER ;

-- ── Helper: Add FK only if it doesn't exist ────────────────
DROP PROCEDURE IF EXISTS add_fk_if_not_exists;
DELIMITER $$
CREATE PROCEDURE add_fk_if_not_exists(
  IN tbl     VARCHAR(64),
  IN fk_name VARCHAR(64),
  IN fk_def  TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA    = DATABASE()
      AND TABLE_NAME      = tbl
      AND CONSTRAINT_NAME = fk_name
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
  ) THEN
    SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD CONSTRAINT `', fk_name, '` ', fk_def);
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    SELECT CONCAT('  ✓ Added FK `', fk_name, '` to `', tbl, '`') AS migration_log;
  ELSE
    SELECT CONCAT('  – FK `', fk_name, '` already exists on `', tbl, '` — skipped') AS migration_log;
  END IF;
END$$
DELIMITER ;

SELECT '✓ Preflight helpers installed.' AS migration_log;
