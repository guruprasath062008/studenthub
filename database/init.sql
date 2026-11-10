-- ============================================================
-- StudentHub – Student Management System
-- Database Initialization Script
-- ============================================================

CREATE DATABASE IF NOT EXISTS `studenthub_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `studenthub_db`;

-- Drop existing tables if re-initializing
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `users`;

-- ------------------------------------------------------------
-- Table: users (Authentication Service)
-- ------------------------------------------------------------
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'faculty',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Table: students (Student API Service)
-- ------------------------------------------------------------
CREATE TABLE `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `roll_number` VARCHAR(50) NOT NULL UNIQUE,
  `first_name` VARCHAR(60) NOT NULL,
  `last_name` VARCHAR(60) NOT NULL,
  `email` VARCHAR(120) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NOT NULL,
  `department` VARCHAR(80) NOT NULL,
  `enrollment_date` DATE NOT NULL,
  `gpa` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('Active', 'Inactive', 'Graduated', 'Suspended') NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_students_roll` (`roll_number`),
  INDEX `idx_students_dept` (`department`),
  INDEX `idx_students_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Seed Data: Pre-registered Users
-- Passwords:
--   admin@studenthub.local   -> Admin@123
--   faculty@studenthub.local -> Faculty@123
-- ------------------------------------------------------------
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('System Administrator', 'admin@studenthub.local', '$2a$10$urBOxvWKhc9QlbzSZ3J6G.HD2kISmXtjmLVZKi3/v7XS2uzxHvlDm', 'admin'),
('Prof. Rajesh Sharma', 'faculty@studenthub.local', '$2a$10$06KDumAvdeeDJtH9c2eaquaWgPCrfFeO/APdsl2yWhyvCRppz/33a', 'faculty');

-- ------------------------------------------------------------
-- Seed Data: Initial Students across Departments
-- ------------------------------------------------------------
INSERT INTO `students` (`roll_number`, `first_name`, `last_name`, `email`, `phone`, `department`, `enrollment_date`, `gpa`, `status`) VALUES
('CS2023001', 'Aarav', 'Patel', 'aarav.patel@student.edu', '+91 9876543210', 'Computer Science', '2023-08-16', 3.85, 'Active'),
('CS2023002', 'Diya', 'Sharma', 'diya.sharma@student.edu', '+91 9876543211', 'Computer Science', '2023-08-16', 3.92, 'Active'),
('IT2023015', 'Rohan', 'Verma', 'rohan.verma@student.edu', '+91 9876543212', 'Information Technology', '2023-08-18', 3.45, 'Active'),
('EE2022040', 'Ananya', 'Iyer', 'ananya.iyer@student.edu', '+91 9876543213', 'Electrical Engineering', '2022-08-20', 3.70, 'Active'),
('ME2022025', 'Vikram', 'Singh', 'vikram.singh@student.edu', '+91 9876543214', 'Mechanical Engineering', '2022-08-20', 3.20, 'Inactive'),
('CE2021008', 'Sneha', 'Nair', 'sneha.nair@student.edu', '+91 9876543215', 'Civil Engineering', '2021-08-22', 3.95, 'Graduated'),
('CS2023009', 'Kavya', 'Reddy', 'kavya.reddy@student.edu', '+91 9876543216', 'Computer Science', '2023-08-16', 3.65, 'Active'),
('IT2022033', 'Arjun', 'Mehta', 'arjun.mehta@student.edu', '+91 9876543217', 'Information Technology', '2022-08-18', 2.90, 'Suspended');
