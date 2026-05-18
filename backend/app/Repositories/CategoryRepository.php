<?php
/**
 * SGFP — CategoryRepository.php
 */

require_once __DIR__ . '/../Config/Database.php';

class CategoryRepository
{
    private PDO $db;

    public function __construct() { $this->db = Database::getInstance(); }

    public function findAllByUser(int $userId, ?string $type = null): array
    {
        $sql = 'SELECT * FROM categories WHERE user_id = :user_id';
        $params = ['user_id' => $userId];
        if ($type) { $sql .= ' AND type = :type'; $params['type'] = $type; }
        $sql .= ' ORDER BY is_default DESC, name ASC';
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function findById(int $id, int $userId): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM categories WHERE id = :id AND user_id = :user_id');
        $stmt->execute(['id' => $id, 'user_id' => $userId]);
        return $stmt->fetch() ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO categories (user_id, name, type, icon, color) VALUES (:user_id, :name, :type, :icon, :color)'
        );
        $stmt->execute([
            'user_id' => $data['user_id'],
            'name'    => $data['name'],
            'type'    => $data['type'],
            'icon'    => $data['icon'] ?? 'circle',
            'color'   => $data['color'] ?? '#6366f1',
        ]);
        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, int $userId, array $data): bool
    {
        $fields = []; $params = ['id' => $id, 'user_id' => $userId];
        foreach (['name', 'icon', 'color'] as $f) {
            if (isset($data[$f])) { $fields[] = "$f = :$f"; $params[$f] = $data[$f]; }
        }
        if (empty($fields)) return false;
        $stmt = $this->db->prepare('UPDATE categories SET ' . implode(', ', $fields) . ' WHERE id = :id AND user_id = :user_id');
        return $stmt->execute($params);
    }

    public function delete(int $id, int $userId): bool
    {
        $stmt = $this->db->prepare('DELETE FROM categories WHERE id = :id AND user_id = :user_id AND is_default = 0');
        return $stmt->execute(['id' => $id, 'user_id' => $userId]);
    }

    public function hasTransactions(int $id): bool
    {
        $stmt = $this->db->prepare('SELECT COUNT(*) as cnt FROM transactions WHERE category_id = :id');
        $stmt->execute(['id' => $id]);
        return (int) $stmt->fetch()['cnt'] > 0;
    }
}
