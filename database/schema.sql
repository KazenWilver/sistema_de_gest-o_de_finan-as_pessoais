-- ============================================================
-- SGFP — Sistema de Gestão Financeira Pessoal
-- Schema SQL — MySQL
-- Lab #04 · ISPTEC · 2025/2026
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- TABELA 1: users
-- ============================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id`            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `name`          VARCHAR(100)  NOT NULL,
    `email`         VARCHAR(150)  NOT NULL UNIQUE,
    `password_hash` VARCHAR(255)  NOT NULL,
    `role`          ENUM('admin','user') NOT NULL DEFAULT 'user',
    `currency`      VARCHAR(10)   NOT NULL DEFAULT 'AOA',
    `language`      VARCHAR(5)    NOT NULL DEFAULT 'pt',
    `theme`         VARCHAR(10)   NOT NULL DEFAULT 'light',
    `is_active`     TINYINT(1)    NOT NULL DEFAULT 1,
    `created_at`    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA 2: accounts
-- ============================================================
DROP TABLE IF EXISTS `accounts`;
CREATE TABLE `accounts` (
    `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id`    INT UNSIGNED NOT NULL,
    `name`       VARCHAR(100) NOT NULL,
    `type`       ENUM('cash','bank','mobile_money','savings','other') NOT NULL DEFAULT 'cash',
    `currency`   VARCHAR(10)  NOT NULL DEFAULT 'AOA',
    `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_acc_user` FOREIGN KEY (`user_id`)
        REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA 3: categories
-- ============================================================
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
    `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id`    INT UNSIGNED NOT NULL,
    `name`       VARCHAR(100) NOT NULL,
    `type`       ENUM('income','expense') NOT NULL,
    `icon`       VARCHAR(60)  NOT NULL DEFAULT 'circle',
    `color`      VARCHAR(7)   NOT NULL DEFAULT '#6366f1',
    `is_default` TINYINT(1)   NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_cat_user` FOREIGN KEY (`user_id`)
        REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA 4: transactions
-- ============================================================
DROP TABLE IF EXISTS `transactions`;
CREATE TABLE `transactions` (
    `id`               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id`          INT UNSIGNED   NOT NULL,
    `account_id`       INT UNSIGNED   NOT NULL,
    `category_id`      INT UNSIGNED   NOT NULL,
    `type`             ENUM('income','expense') NOT NULL,
    `amount`           DECIMAL(15,2)  NOT NULL,
    `currency`         VARCHAR(10)    NOT NULL DEFAULT 'AOA',
    `description`      VARCHAR(255)   NOT NULL,
    `transaction_date` DATE           NOT NULL,
    `payment_method`   VARCHAR(50)    NULL,
    `notes`            TEXT           NULL,
    `created_at`       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    `updated_at`       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_tx_user` FOREIGN KEY (`user_id`)
        REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tx_account` FOREIGN KEY (`account_id`)
        REFERENCES `accounts`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_tx_cat` FOREIGN KEY (`category_id`)
        REFERENCES `categories`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA 5: budgets
-- ============================================================
DROP TABLE IF EXISTS `budgets`;
CREATE TABLE `budgets` (
    `id`           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id`      INT UNSIGNED   NOT NULL,
    `category_id`  INT UNSIGNED   NULL,
    `name`         VARCHAR(100)   NOT NULL,
    `limit_amount` DECIMAL(15,2)  NOT NULL,
    `period`       ENUM('weekly','monthly','yearly') NOT NULL DEFAULT 'monthly',
    `start_date`   DATE           NOT NULL,
    `end_date`     DATE           NOT NULL,
    `created_at`   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    `updated_at`   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_bud_user` FOREIGN KEY (`user_id`)
        REFERENCES `users`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_bud_cat` FOREIGN KEY (`category_id`)
        REFERENCES `categories`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA 6: password_resets
-- ============================================================
DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE `password_resets` (
    `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id`    INT UNSIGNED   NOT NULL,
    `token`      VARCHAR(255)   NOT NULL,
    `expires_at` DATETIME       NOT NULL,
    `used`       TINYINT(1)     NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_pr_user` FOREIGN KEY (`user_id`)
        REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA 7: currency_rates
-- ============================================================
DROP TABLE IF EXISTS `currency_rates`;
CREATE TABLE `currency_rates` (
    `id`              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `base_currency`   VARCHAR(10)    NOT NULL,
    `target_currency` VARCHAR(10)    NOT NULL,
    `rate`            DECIMAL(20,6)  NOT NULL,
    `fetched_at`      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uq_pair` (`base_currency`, `target_currency`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX `idx_tx_user_date` ON `transactions` (`user_id`, `transaction_date`);
CREATE INDEX `idx_tx_category` ON `transactions` (`category_id`);
CREATE INDEX `idx_tx_account` ON `transactions` (`account_id`);
CREATE INDEX `idx_bud_user` ON `budgets` (`user_id`);
CREATE INDEX `idx_cat_user` ON `categories` (`user_id`);
CREATE INDEX `idx_acc_user` ON `accounts` (`user_id`);

SET FOREIGN_KEY_CHECKS = 1;
