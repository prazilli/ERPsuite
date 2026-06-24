-- SQL script to verify/seed the three exact roles
USE `amdox_db`;

-- Temporarily disable foreign key checks to wipe/reset role data safely
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE `refresh_tokens`;
TRUNCATE TABLE `email_verifications`;
TRUNCATE TABLE `users`;
TRUNCATE TABLE `role_permissions`;
TRUNCATE TABLE `roles`;

SET FOREIGN_KEY_CHECKS = 1;

-- Insert the exact three roles
INSERT INTO `roles` (`role_id`, `role_name`, `description`) VALUES
(1, 'Company Head / CEO', 'Company Head or CEO with full access to company operations.'),
(2, 'Department Head', 'Department Head with access to manage department operations.'),
(3, 'Employee', 'Standard employee with access to department-level widgets.');

-- Verify the contents
SELECT * FROM `roles`;
