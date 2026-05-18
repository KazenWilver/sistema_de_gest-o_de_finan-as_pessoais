<?php
/**
 * SGFP — BudgetRepository.php
 */

require_once __DIR__ . '/../Config/Database.php';

class BudgetRepository
{
    private PDO $db;

    public function __construct() { $this->db = Database::getInstance(); }

    public function findAllByUser(int $userId): array
    {
        $stmt = $this->db->prepare(
            'SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
                COALESCE((SELECT SUM(t.amount) FROM transactions t 
                          WHERE t.user_id = b.user_id AND t.type = "expense"
                          AND (b.category_id IS NULL OR t.category_id = b.category_id)
                          AND t.transaction_date BETWEEN b.start_date AND b.end_date), 0) as spent
             FROM budgets b
             LEFT JOIN categories c ON b.category_id = c.id
             WHERE b.user_id = :user_id ORDER BY b.end_date DESC'
        );
        $stmt->execute(['user_id' => $userId]);
        $budgets = $stmt->fetchAll();
        foreach ($budgets as &$b) {
            $b['spent'] = (float) $b['spent'];
            $b['remaining'] = round($b['limit_amount'] - $b['spent'], 2);
            $b['percentage'] = $b['limit_amount'] > 0 ? round(($b['spent'] / $b['limit_amount']) * 100, 1) : 0;
        }
        return $budgets;
    }

    public function findById(int $id, int $userId): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM budgets WHERE id = :id AND user_id = :user_id');
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO budgets (user_id, category_id, name, limit_amount, period, start_date, end_date)
             VALUES (:user_id, :category_id, :name, :limit_amount, :period, :start_date, :end_date)'
        );
        $stmt->execute([
            'user_id'      => $data['user_id'],
            'category_id'  => $data['category_id'] ?? null,
            'name'         => $data['name'],
            'limit_amount' => $data['limit_amount'],
            'period'       => $data['period'] ?? 'monthly',
            'start_date'   => $data['start_date'],
            'end_date'     => $data['end_date'],
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, int $userId, array $data): bool
    {
        $fields = []; $params = ['id' => $id, 'user_id' => $userId];
        foreach (['category_id', 'name', 'limit_amount', 'period', 'start_date', 'end_date'] as $f) {
            if (array_key_exists($f, $data)) { $fields[] = "$f = :$f"; $params[$f] = $data[$f]; }
        }
        if (empty($fields)) return false;
        $stmt = $this->db->prepare('UPDATE budgets SET ' . implode(', ', $fields) . ' WHERE id = :id AND user_id = :user_id');
        return $stmt->execute($params);
    }

    public function delete(int $id, int $userId): bool
    {
        $stmt = $this->db->prepare('DELETE FROM budgets WHERE id = :id AND user_id = :user_id');
        return $stmt->execute(['id' => $id, 'user_id' => $userId]);
    }

    public function getActiveByUser(int $userId): array
    {
        $stmt = $this->db->prepare(
            'SELECT b.*, c.name as category_name, c.color as category_color,
                COALESCE((SELECT SUM(t.amount) FROM transactions t 
                          WHERE t.user_id = b.user_id AND t.type = "expense"
                          AND (b.category_id IS NULL OR t.category_id = b.category_id)
                          AND t.transaction_date BETWEEN b.start_date AND b.end_date), 0) as spent
             FROM budgets b LEFT JOIN categories c ON b.category_id = c.id
             WHERE b.user_id = :user_id AND b.start_date <= CURDATE() AND b.end_date >= CURDATE()'
        );
        $stmt->execute(['user_id' => $userId]);
        $budgets = $stmt->fetchAll();
        foreach ($budgets as &$b) {
            $b['spent'] = (float) $b['spent'];
            $b['percentage'] = $b['limit_amount'] > 0 ? round(($b['spent'] / $b['limit_amount']) * 100, 1) : 0;
        }
        return $budgets;
    }
}
