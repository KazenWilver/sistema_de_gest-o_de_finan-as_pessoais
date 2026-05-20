<?php
/**
 * SGFP — TransactionRepository.php
 */

require_once __DIR__ . '/../Config/Database.php';

class TransactionRepository
{
    private PDO $db;

    public function __construct() { $this->db = Database::getInstance(); }

    public function findAllByUser(int $userId, array $filters = []): array
    {
        $sql = 'SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color,
                       a.name as account_name
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                LEFT JOIN accounts a ON t.account_id = a.id
                WHERE t.user_id = :user_id';
        $params = ['user_id' => $userId];

        if (!empty($filters['type'])) {
            $sql .= ' AND t.type = :type'; $params['type'] = $filters['type'];
        }
        if (!empty($filters['category_id'])) {
            $sql .= ' AND t.category_id = :category_id'; $params['category_id'] = $filters['category_id'];
        }
        if (!empty($filters['account_id'])) {
            $sql .= ' AND t.account_id = :account_id'; $params['account_id'] = $filters['account_id'];
        }
        if (!empty($filters['from'])) {
            $sql .= ' AND t.transaction_date >= :date_from'; $params['date_from'] = $filters['from'];
        }
        if (!empty($filters['to'])) {
            $sql .= ' AND t.transaction_date <= :date_to'; $params['date_to'] = $filters['to'];
        }

        $sort = $filters['sort'] ?? 'transaction_date';
        $order = strtoupper($filters['order'] ?? 'DESC');
        $allowed = ['transaction_date', 'amount', 'created_at'];
        if (!in_array($sort, $allowed)) $sort = 'transaction_date';
        if (!in_array($order, ['ASC', 'DESC'])) $order = 'DESC';
        $sql .= " ORDER BY t.$sort $order";

        $page = max(1, (int)($filters['page'] ?? 1));
        $limit = min(100, max(1, (int)($filters['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;
        $sql .= " LIMIT $limit OFFSET $offset";

        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function countByUser(int $userId, array $filters = []): int
    {
        $sql = 'SELECT COUNT(*) as total FROM transactions t WHERE t.user_id = :user_id';
        $params = ['user_id' => $userId];
        if (!empty($filters['type'])) { $sql .= ' AND t.type = :type'; $params['type'] = $filters['type']; }
        if (!empty($filters['category_id'])) { $sql .= ' AND t.category_id = :category_id'; $params['category_id'] = $filters['category_id']; }
        if (!empty($filters['from'])) { $sql .= ' AND t.transaction_date >= :date_from'; $params['date_from'] = $filters['from']; }
        if (!empty($filters['to'])) { $sql .= ' AND t.transaction_date <= :date_to'; $params['date_to'] = $filters['to']; }
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return (int)$stmt->fetch()['total'];
    }

    public function findById(int $id, int $userId): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT t.*, c.name as category_name, a.name as account_name
             FROM transactions t
             LEFT JOIN categories c ON t.category_id = c.id
             LEFT JOIN accounts a ON t.account_id = a.id
             WHERE t.id = :id AND t.user_id = :user_id'
        );
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO transactions (user_id, account_id, category_id, type, amount, currency, description, transaction_date, payment_method, notes)
             VALUES (:user_id, :account_id, :category_id, :type, :amount, :currency, :description, :transaction_date, :payment_method, :notes)'
        );
        $stmt->execute([
            'user_id'          => $data['user_id'],
            'account_id'       => $data['account_id'],
            'category_id'      => $data['category_id'],
            'type'             => $data['type'],
            'amount'           => $data['amount'],
            'currency'         => $data['currency'] ?? 'AOA',
            'description'      => $data['description'],
            'transaction_date' => $data['transaction_date'],
            'payment_method'   => $data['payment_method'] ?? null,
            'notes'            => $data['notes'] ?? null,
        ]);
        return (int)$this->db->lastInsertId();
    }

    public function update(int $id, int $userId, array $data): bool
    {
        $fields = []; $params = ['id' => $id, 'user_id' => $userId];
        foreach (['account_id', 'category_id', 'type', 'amount', 'currency', 'description', 'transaction_date', 'payment_method', 'notes'] as $f) {
            if (array_key_exists($f, $data)) { $fields[] = "$f = :$f"; $params[$f] = $data[$f]; }
        }
        if (empty($fields)) return false;
        $stmt = $this->db->prepare('UPDATE transactions SET ' . implode(', ', $fields) . ' WHERE id = :id AND user_id = :user_id');
        return $stmt->execute($params);
    }

    public function delete(int $id, int $userId): bool
    {
        $stmt = $this->db->prepare('DELETE FROM transactions WHERE id = :id AND user_id = :user_id');
        return $stmt->execute(['id' => $id, 'user_id' => $userId]);
    }

    public function getSummary(int $userId, string $month): array
    {
        $from = $month . '-01';
        $to = date('Y-m-t', strtotime($from));
        $stmt = $this->db->prepare(
            'SELECT type, SUM(amount) as total FROM transactions
             WHERE user_id = :user_id AND transaction_date BETWEEN :from AND :to
             GROUP BY type'
        );
        $stmt->execute(['user_id' => $userId, 'from' => $from, 'to' => $to]);
        $rows = $stmt->fetchAll();
        $income = 0; $expense = 0;
        foreach ($rows as $r) {
            if ($r['type'] === 'income') $income = (float)$r['total'];
            else $expense = (float)$r['total'];
        }
        return ['income' => $income, 'expense' => $expense, 'balance' => $income - $expense];
    }

    public function getByCategory(int $userId, string $from, string $to): array
    {
        $stmt = $this->db->prepare(
            'SELECT c.name, c.name as category_name, c.color, c.icon, t.type, SUM(t.amount) as total
             FROM transactions t JOIN categories c ON t.category_id = c.id
             WHERE t.user_id = :user_id AND t.transaction_date BETWEEN :from AND :to
             GROUP BY c.id, t.type ORDER BY total DESC'
        );
        $stmt->execute(['user_id' => $userId, 'from' => $from, 'to' => $to]);
        return $stmt->fetchAll();
    }

    public function getMonthlyTrend(int $userId, int $months = 6): array
    {
        $dateThreshold = date('Y-m-d', strtotime("-$months months"));
        $stmt = $this->db->prepare(
            "SELECT DATE_FORMAT(transaction_date, '%Y-%m') as month,
                    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
             FROM transactions WHERE user_id = :user_id
             AND transaction_date >= :date_threshold
             GROUP BY month ORDER BY month"
        );
        $stmt->execute(['user_id' => $userId, 'date_threshold' => $dateThreshold]);
        return $stmt->fetchAll();
    }

    public function getRecent(int $userId, int $limit = 5): array
    {
        $stmt = $this->db->prepare(
            'SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color, a.name as account_name
             FROM transactions t
             LEFT JOIN categories c ON t.category_id = c.id
             LEFT JOIN accounts a ON t.account_id = a.id
             WHERE t.user_id = :user_id ORDER BY t.transaction_date DESC, t.created_at DESC LIMIT ' . $limit
        );
        $stmt->execute(['user_id' => $userId]);
        return $stmt->fetchAll();
    }

    public function getAllForExport(int $userId, array $filters = []): array
    {
        $sql = 'SELECT t.transaction_date, t.type, c.name as category_name, a.name as account_name,
                       t.description, t.amount, t.currency
                FROM transactions t
                LEFT JOIN categories c ON t.category_id = c.id
                LEFT JOIN accounts a ON t.account_id = a.id
                WHERE t.user_id = :user_id';
        $params = ['user_id' => $userId];
        if (!empty($filters['from'])) { $sql .= ' AND t.transaction_date >= :from'; $params['from'] = $filters['from']; }
        if (!empty($filters['to'])) { $sql .= ' AND t.transaction_date <= :to'; $params['to'] = $filters['to']; }
        if (!empty($filters['type'])) { $sql .= ' AND t.type = :type'; $params['type'] = $filters['type']; }
        $sql .= ' ORDER BY t.transaction_date DESC';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function countAll(): int
    {
        return (int) $this->db->query('SELECT COUNT(*) as c FROM transactions')->fetch()['c'];
    }
}
