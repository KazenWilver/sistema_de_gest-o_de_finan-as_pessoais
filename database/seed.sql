-- SGFP seed — desenvolvimento local (README: credenciais por defeito)
SET NAMES utf8mb4;

-- Password para admin@sgfp.local e user@sgfp.local: devpassword123
INSERT INTO users (email, password_hash, role, base_currency, language) VALUES
('admin@sgfp.local', '$2a$10$PpMtVtzjMQZFC/M8.fB3Ve2ccd8cZLU/sueEATLvW8SYqtQ6Yv0fO', 'admin', 'EUR', 'pt'),
('user@sgfp.local', '$2a$10$PpMtVtzjMQZFC/M8.fB3Ve2ccd8cZLU/sueEATLvW8SYqtQ6Yv0fO', 'user', 'EUR', 'pt');

SET @u_admin = (SELECT id FROM users WHERE email = 'admin@sgfp.local' LIMIT 1);
SET @u_user  = (SELECT id FROM users WHERE email = 'user@sgfp.local' LIMIT 1);

-- Categorias semeadas por utilizador (modelo plano 2)
INSERT INTO categories (user_id, name, type, icon, color, is_seeded) VALUES
(@u_admin, 'Salário', 'income', 'work', '#22c55e', 1),
(@u_admin, 'Outros rendimentos', 'income', 'add', '#86efac', 1),
(@u_admin, 'Alimentação', 'expense', 'restaurant', '#ef4444', 1),
(@u_admin, 'Transporte', 'expense', 'directions_car', '#f97316', 1),
(@u_admin, 'Habitação', 'expense', 'home', '#a855f7', 1),
(@u_user, 'Salário', 'income', 'work', '#22c55e', 1),
(@u_user, 'Outros rendimentos', 'income', 'add', '#86efac', 1),
(@u_user, 'Alimentação', 'expense', 'restaurant', '#ef4444', 1),
(@u_user, 'Transporte', 'expense', 'directions_car', '#f97316', 1),
(@u_user, 'Habitação', 'expense', 'home', '#a855f7', 1);

-- Exemplo transacções e meta (utilizador normal)
SET @cat_inc = (SELECT id FROM categories WHERE user_id = @u_user AND name = 'Salário' AND type = 'income' LIMIT 1);
SET @cat_food = (SELECT id FROM categories WHERE user_id = @u_user AND name = 'Alimentação' AND type = 'expense' LIMIT 1);

INSERT INTO transactions (user_id, category_id, type, amount, currency_code, amount_base, description, trans_date) VALUES
(@u_user, @cat_inc, 'income', 1500, 'EUR', 1500, 'Salário Maio', CURDATE() - INTERVAL 10 DAY),
(@u_user, @cat_food, 'expense', 120.50, 'EUR', 120.50, 'Compras supermercado', CURDATE() - INTERVAL 3 DAY);

INSERT INTO budgets (user_id, category_id, amount, period_start, period_end) VALUES
(@u_user, @cat_food, 300, DATE_FORMAT(CURDATE(), '%Y-%m-01'), LAST_DAY(CURDATE()));

INSERT INTO goals (user_id, name, target_amount, current_amount, deadline) VALUES
(@u_user, 'Fundo emergência', 5000, 1200, CURDATE() + INTERVAL 365 DAY);
