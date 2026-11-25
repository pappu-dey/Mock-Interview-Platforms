-- ========================================================
-- Dashboard & Performance Database Schema
-- Database: interview_platformdb
-- ========================================================

USE `interview_platformdb`;

-- 1. Table structure for `interview_sessions`
CREATE TABLE IF NOT EXISTS `interview_sessions` (
  `session_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `role_id` INT DEFAULT NULL,
  `company` VARCHAR(100) DEFAULT NULL,
  `role_name` VARCHAR(100) DEFAULT NULL,
  `start_time` DATETIME DEFAULT NULL,
  `end_time` DATETIME DEFAULT NULL,
  `overall_score` DECIMAL(5,2) DEFAULT NULL,
  PRIMARY KEY (`session_id`),
  KEY `idx_sessions_user_id` (`user_id`),
  KEY `idx_sessions_role_id` (`role_id`),
  CONSTRAINT `fk_sessions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Table structure for `performance`
CREATE TABLE IF NOT EXISTS `performance` (
  `performance_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `session_id` INT NOT NULL,
  `communication_score` DECIMAL(5,2) DEFAULT NULL,
  `technical_score` DECIMAL(5,2) DEFAULT NULL,
  `confidence_score` DECIMAL(5,2) DEFAULT NULL,
  `overall_score` DECIMAL(5,2) DEFAULT NULL,
  `strengths` TEXT DEFAULT NULL,
  `improvements` TEXT DEFAULT NULL,
  PRIMARY KEY (`performance_id`),
  KEY `idx_perf_user_id` (`user_id`),
  KEY `idx_perf_session_id` (`session_id`),
  CONSTRAINT `fk_perf_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_perf_session` FOREIGN KEY (`session_id`) REFERENCES `interview_sessions` (`session_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Table structure for `answers`
CREATE TABLE IF NOT EXISTS `answers` (
  `answer_id` INT NOT NULL AUTO_INCREMENT,
  `session_id` INT NOT NULL,
  `question_id` INT DEFAULT NULL,
  `answer_text` TEXT DEFAULT NULL,
  `score` DECIMAL(5,2) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `topic` VARCHAR(150) DEFAULT NULL,
  `feedback` TEXT DEFAULT NULL,
  PRIMARY KEY (`answer_id`),
  KEY `idx_answers_session_id` (`session_id`),
  KEY `idx_answers_question_id` (`question_id`),
  KEY `idx_answers_category` (`category`),
  KEY `idx_answers_topic` (`topic`),
  CONSTRAINT `fk_answers_session` FOREIGN KEY (`session_id`) REFERENCES `interview_sessions` (`session_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. Table structure for `daily_activity` (Heatmap & Streak tracking)
CREATE TABLE IF NOT EXISTS `daily_activity` (
  `activity_id` INT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `activity_date` DATE NOT NULL,
  `sessions_count` INT DEFAULT 0,
  `questions_solved` INT DEFAULT 0,
  `mock_tests_completed` INT DEFAULT 0,
  `total_activities` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`activity_id`),
  UNIQUE KEY `uk_user_activity_date` (`user_id`, `activity_date`),
  KEY `idx_activity_user_id` (`user_id`),
  CONSTRAINT `fk_activity_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 5. Table structure for `user_question_progress` (Per-user solved/attempted status)
CREATE TABLE IF NOT EXISTS `user_question_progress` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` INT NOT NULL,
  `question_id` BIGINT NOT NULL,
  `category` VARCHAR(100) DEFAULT NULL,
  `topic` VARCHAR(150) DEFAULT NULL,
  `status` VARCHAR(20) DEFAULT 'SOLVED',
  `is_correct` TINYINT(1) DEFAULT NULL,
  `selected_option` TEXT DEFAULT NULL,
  `score` DECIMAL(5,2) DEFAULT NULL,
  `solved_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_question` (`user_id`, `question_id`),
  KEY `idx_uqp_user_id` (`user_id`),
  KEY `idx_uqp_question_id` (`question_id`),
  CONSTRAINT `fk_uqp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
