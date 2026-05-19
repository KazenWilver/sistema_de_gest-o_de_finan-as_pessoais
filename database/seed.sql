-- ============================================================
-- SGFP — Seed Data
-- ============================================================

-- Admin user (password: admin123)
INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `currency`, `language`, `theme`) VALUES
('Administrador', 'admin@sgfp.ao', '$2y$12$dGccJAqo1vDjEjgg8J52lul7iO1ygUKsYDhCsQ4IAUIbAjhdR0YOq', 'admin', 'AOA', 'pt', 'light');

-- Demo user (password: user1234)
INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `currency`, `language`, `theme`) VALUES
('Utilizador Demo', 'demo@sgfp.ao', '$2y$12$dGccJAqo1vDjEjgg8J52lul7iO1ygUKsYDhCsQ4IAUIbAjhdR0YOq', 'user', 'AOA', 'pt', 'light');

-- Default account for admin (user_id=1)
INSERT INTO `accounts` (`user_id`, `name`, `type`, `currency`) VALUES
(1, 'Carteira', 'cash', 'AOA');

-- Default account for demo user (user_id=2)
INSERT INTO `accounts` (`user_id`, `name`, `type`, `currency`) VALUES
(2, 'Carteira', 'cash', 'AOA'),
(2, 'Banco BAI', 'bank', 'AOA');

-- Default categories for admin (user_id=1)
INSERT INTO `categories` (`user_id`, `name`, `type`, `icon`, `color`, `is_default`) VALUES
(1, 'Salário',       'income',  'wallet',      '#10b981', 1),
(1, 'Freelance',     'income',  'laptop',      '#06b6d4', 1),
(1, 'Investimentos', 'income',  'trending-up', '#8b5cf6', 1),
(1, 'Outros',        'income',  'circle-dots', '#6b7280', 1),
(1, 'Alimentação',   'expense', 'utensils',    '#f59e0b', 1),
(1, 'Transporte',    'expense', 'car',         '#ef4444', 1),
(1, 'Saúde',         'expense', 'heart-pulse', '#8b5cf6', 1),
(1, 'Educação',      'expense', 'book-open',   '#3b82f6', 1),
(1, 'Lazer',         'expense', 'gamepad-2',   '#ec4899', 1),
(1, 'Habitação',     'expense', 'home',        '#14b8a6', 1),
(1, 'Outros',        'expense', 'circle-dots', '#6b7280', 1);

-- Default categories for demo user (user_id=2)
INSERT INTO `categories` (`user_id`, `name`, `type`, `icon`, `color`, `is_default`) VALUES
(2, 'Salário',       'income',  'wallet',      '#10b981', 1),
(2, 'Freelance',     'income',  'laptop',      '#06b6d4', 1),
(2, 'Investimentos', 'income',  'trending-up', '#8b5cf6', 1),
(2, 'Outros',        'income',  'circle-dots', '#6b7280', 1),
(2, 'Alimentação',   'expense', 'utensils',    '#f59e0b', 1),
(2, 'Transporte',    'expense', 'car',         '#ef4444', 1),
(2, 'Saúde',         'expense', 'heart-pulse', '#8b5cf6', 1),
(2, 'Educação',      'expense', 'book-open',   '#3b82f6', 1),
(2, 'Lazer',         'expense', 'gamepad-2',   '#ec4899', 1),
(2, 'Habitação',     'expense', 'home',        '#14b8a6', 1),
(2, 'Outros',        'expense', 'circle-dots', '#6b7280', 1);

-- Sample transactions for demo user
INSERT INTO `transactions` (`user_id`, `account_id`, `category_id`, `type`, `amount`, `currency`, `description`, `transaction_date`, `payment_method`) VALUES
(2, 2, 12, 'income',  350000.00, 'AOA', 'Salário de Maio',        '2026-05-01', 'transferência'),
(2, 2, 13, 'income',   80000.00, 'AOA', 'Projecto freelance web', '2026-05-05', 'transferência'),
(2, 2, 16, 'expense',  25000.00, 'AOA', 'Supermercado Kero',      '2026-05-03', 'multicaixa'),
(2, 2, 17, 'expense',  15000.00, 'AOA', 'Combustível',            '2026-05-04', 'cash'),
(2, 2, 18, 'expense',  35000.00, 'AOA', 'Consulta médica',        '2026-05-06', 'multicaixa'),
(2, 2, 19, 'expense',  12000.00, 'AOA', 'Livros ISPTEC',          '2026-05-07', 'multicaixa'),
(2, 2, 20, 'expense',  18000.00, 'AOA', 'Cinema + jantar',        '2026-05-10', 'cash'),
(2, 2, 21, 'expense',  90000.00, 'AOA', 'Renda do apartamento',   '2026-05-01', 'transferência'),
(2, 2, 16, 'expense',  30000.00, 'AOA', 'Restaurante almoço',     '2026-05-12', 'cash');

-- Sample budget for demo user
INSERT INTO `budgets` (`user_id`, `category_id`, `name`, `limit_amount`, `period`, `start_date`, `end_date`) VALUES
(2, 16, 'Alimentação Maio', 80000.00, 'monthly', '2026-05-01', '2026-05-31'),
(2, 17, 'Transporte Maio',  40000.00, 'monthly', '2026-05-01', '2026-05-31');
