-- ============================================================
-- Company Database Schema (companies -> job_roles -> hiring_process)
-- ============================================================

DROP TABLE IF EXISTS `hiring_process`;
DROP TABLE IF EXISTS `job_roles`;
DROP TABLE IF EXISTS `companies`;

-- 1. Companies Table
CREATE TABLE `companies` (
  `company_id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_name` VARCHAR(100) NOT NULL,
  `company_website` VARCHAR(255) DEFAULT NULL,
  `company_logo` VARCHAR(255) DEFAULT NULL,
  `headquarters` VARCHAR(100) DEFAULT NULL,
  `employees` VARCHAR(50) DEFAULT NULL,
  `rating` DOUBLE DEFAULT 0.0,
  `difficulty` VARCHAR(50) DEFAULT 'Medium',
  `insider_tips` TEXT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. Job Roles Table
CREATE TABLE `job_roles` (
  `role_id` INT AUTO_INCREMENT PRIMARY KEY,
  `company_id` INT NOT NULL,
  `role_name` VARCHAR(100) NOT NULL,
  `location` VARCHAR(100) DEFAULT NULL,
  `salary` VARCHAR(100) DEFAULT NULL,
  `experience` VARCHAR(50) DEFAULT NULL,
  `eligibility` TEXT DEFAULT NULL,
  `technical_topics` TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `is_open` TINYINT(1) DEFAULT 1,
  CONSTRAINT `fk_job_roles_company` FOREIGN KEY (`company_id`) REFERENCES `companies` (`company_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. Hiring Process Table
CREATE TABLE `hiring_process` (
  `process_id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT NOT NULL,
  `round_number` INT NOT NULL,
  `round_name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  CONSTRAINT `fk_hiring_process_role` FOREIGN KEY (`role_id`) REFERENCES `job_roles` (`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================
-- Seed Sample Data
-- ============================================================

INSERT INTO `companies` (`company_id`, `company_name`, `company_website`, `company_logo`, `headquarters`, `employees`, `rating`, `difficulty`, `insider_tips`) VALUES
(1, 'Tata Consultancy Services', 'https://www.tcs.com', 'TCS', 'Mumbai, Maharashtra', '600,000+', 4.1, 'Medium', 'Focus heavily on aptitude, basic C/Java programming, and DBMS fundamentals.'),
(2, 'Infosys', 'https://www.infosys.com', 'INF', 'Bengaluru, Karnataka', '340,000+', 4.0, 'Easy', 'Brush up on pseudocode algorithms, SQL queries, and object-oriented concepts.'),
(3, 'Google', 'https://careers.google.com', 'GOOG', 'Mountain View, CA', '180,000+', 4.8, 'Hard', 'Master Data Structures & Algorithms (Trees, Graphs, DP) and System Design principles.');

INSERT INTO `job_roles` (`role_id`, `company_id`, `role_name`, `location`, `salary`, `experience`, `eligibility`, `technical_topics`, `description`, `is_open`) VALUES
(1, 1, 'Software Developer (Digital)', 'Pan India', '₹7.0 LPA – ₹9.0 LPA', '0 - 2 Years', 'B.Tech / B.E / M.Tech in CS, IT, ECE (Min 60% aggregate)', 'Java, Data Structures, SQL, OS, Web Dev', 'Entry-level role focused on enterprise application development.', 1),
(2, 2, 'Specialist Programmer', 'Bengaluru / Hyderabad', '₹9.5 LPA', '0 - 1 Years', 'BE/B.Tech/ME/M.Tech (CS/IT/Circuit branches)', 'Advanced Algorithms, Competitive Coding, System Design', 'High-impact coding role building digital products.', 1),
(3, 3, 'Software Engineer - L3', 'Bengaluru, India', '₹35.0 LPA - ₹45.0 LPA', '0 - 3 Years', 'BS/MS in Computer Science or equivalent', 'DSA, Graphs, Dynamic Programming, Scalable Systems', 'Build hyper-scale global distributed applications.', 1);

INSERT INTO `hiring_process` (`process_id`, `role_id`, `round_number`, `round_name`, `description`) VALUES
(1, 1, 1, 'Online Assessment (NQT)', 'Aptitude, Reasoning, Verbal, and Hands-on Coding (2 problems).'),
(2, 1, 2, 'Technical Interview', 'In-depth review of project work, OOPs, SQL queries, and basic algorithms.'),
(3, 1, 3, 'HR & Managerial Round', 'Behavioral evaluation, communication skills, and location preference.'),
(4, 2, 1, 'HackWithInfy Coding Round', 'Competitive coding challenge with 3 complex algorithmic problems.'),
(5, 2, 2, 'Technical & System Design Interview', 'Discussion on coding round solutions, system design, and algorithms.'),
(6, 3, 1, 'Technical Phone Screen', '45-minute coding interview focusing on Data Structures & Algorithms.'),
(7, 3, 2, 'Onsite / Virtual Loop (4 Rounds)', '3 Data Structure & Algorithmic rounds + 1 Googleliness & Leadership round.');
