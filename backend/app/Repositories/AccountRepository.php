<?php
/**
 * SGFP — AccountRepository.php
 */

require_once __DIR__ . '/../Config/Database.php';

class AccountRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findAllByUser(int $userId): array
    {
        $stmt = $this->db->prepare(
            'SELECT a.*,
                COALESCE((SELECT SUM(CASE WHEN t.type="income" THEN t.amount ELSE 0 END) 
                          FROM transactions t WHERE t.account_id = a.id), 0) as total_income,
                COALESCE((SELECT SUM(CASE WHEN t.type="expense" THEN t.amount ELSE 0 END) 
                          FROM transactions t WHERE t.account_id = a.id), 0) as total_expense
             FROM accounts a WHERE a.user_id = :user_id ORDER BY a.created_at'
        );
        $stmt->execute(['user_id' => $userId]);
        $accounts = $stmt->fetchAll();
        foreach ($accounts as &$acc) {
            $acc['balance'] = round($acc['total_income'] - $acc['total_expense'], 2);
        }
        return $accounts;
    }

    public function findById(int $id, int $userId): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM accounts WHERE id = :id AND user_id = :user_id');
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO accounts (user_id, name, type, currency) VALUES (:user_id, :name, :type, :currency)'
        );
        $stmt->execute([
            'user_id'  => $data['user_id'],
            'name'     => $data['name'],
            'type'     => $data['type'] ?? 'cash',
            'currency' => $data['currency'] ?? 'AOA',
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, int $userId, array $data): bool
    {
        $fields = [];
        $params = ['id' => $id, 'user_id' => $userId];
        foreach (['name', 'type', 'currency'] as $f) {
            if (isset($data[$f])) { $fields[] = "$f = :$f"; $params[$f] = $data[$f]; }
        }
        if (empty($fields)) return false;
        $stmt = $this->db->prepare('UPDATE accounts SET ' . implode(', ', $fields) . ' WHERE id = :id AND user_id = :user_id');
        return $stmt->execute($params);
    }

    public function delete(int $id, int $userId): bool
    {
        $stmt = $this->db->prepare('DELETE FROM accounts WHERE id = :id AND user_id = :user_id');
        return $stmt->execute(['id' => $id, 'user_id' => $userId]);
    }

    public function hasTransactions(int $id): bool
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) as cnt FROM transactions WHERE account_id = :id');
        $stmt->execute(['id' => $id]);
        return (int) $stmt->fetch()['cnt'] > 0;
    }
}
