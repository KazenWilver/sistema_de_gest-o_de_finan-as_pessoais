<?php
/**
 * SGFP — UserRepository.php
 * Data access layer for users table.
 */

require_once __DIR__ . '/../Config/Database.php';

class UserRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::getInstance();
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM users WHERE email = :email');
        $stmt->execute(['email' => $email]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function create(array $data): int
    {
        $stmt = $this->db->prepare(
            'INSERT INTO users (name, email, password_hash, role, currency, language, theme) 
             VALUES (:name, :email, :password_hash, :role, :currency, :language, :theme)'
        );

        $stmt->execute([
            'name'          => $data['name'],
            'email'         => $data['email'],
            'password_hash' => $data['password_hash'],
            'role'          => $data['role'] ?? 'user',
            'currency'      => $data['currency'] ?? 'AOA',
            'language'      => $data['language'] ?? 'pt',
            'theme'         => $data['theme'] ?? 'light',
        ]);

        return (int) $this->db->lastInsertId();
    }

    public function update(int $id, array $data): bool
    {
        $fields = [];
        $params = ['id' => $id];

        foreach (['name', 'currency', 'language', 'theme'] as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = :$field";
                $params[$field] = $data[$field];
            }
        }

        if (empty($fields)) return false;

        $sql = 'UPDATE users SET ' . implode(', ', $fields) . ' WHERE id = :id';
        $stmt = $this->db->prepare($sql);
        return $stmt->execute($params);
    }

    public function updatePassword(int $id, string $hash): bool
    {
        $stmt = $this->db->prepare('UPDATE users SET password_hash = :hash WHERE id = :id');
        return $stmt->execute(['hash' => $hash, 'id' => $id]);
    }

    public function createResetToken(int $userId, string $token, string $expiresAt): bool
    {
        $stmt = $this->db->prepare(
            'INSERT INTO password_resets (user_id, token, expires_at) VALUES (:user_id, :token, :expires_at)'
        );
        return $stmt->execute([
            'user_id'    => $userId,
            'token'      => $token,
            'expires_at' => $expiresAt,
        ]);
    }

    public function findResetToken(string $token): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM password_resets WHERE token = :token AND used = 0 AND expires_at > :now'
        );
        $stmt->execute(['token' => $token, 'now' => date('Y-m-d H:i:s')]);
        $result = $stmt->fetch();
        return $result ?: null;
    }

    public function markTokenUsed(int $tokenId): bool
    {
        $stmt = $this->db->prepare('UPDATE password_resets SET used = 1 WHERE id = :id');
        return $stmt->execute(['id' => $tokenId]);
    }

    public function findAll(): array
    {
        $stmt = $this->db->query(
            'SELECT u.id, u.name, u.email, u.role, u.currency, u.language, u.is_active, u.created_at,
                    (SELECT COUNT(*) FROM transactions t WHERE t.user_id = u.id) as transaction_count
             FROM users u ORDER BY u.created_at DESC'
        );
        return $stmt->fetchAll();
    }

    public function countAll(): int
    {
        $stmt = $this->db->query('SELECT COUNT(*) as total FROM users');
        return (int) $stmt->fetch()['total'];
    }

    public function updateRole(int $id, string $role): bool
    {
        $stmt = $this->db->prepare('UPDATE users SET role = :role WHERE id = :id');
        return $stmt->execute(['role' => $role, 'id' => $id]);
    }

    public function updateActive(int $id, int $active): bool
    {
        $stmt = $this->db->prepare('UPDATE users SET is_active = :active WHERE id = :id');
        return $stmt->execute(['active' => $active, 'id' => $id]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM users WHERE id = :id');
        return $stmt->execute(['id' => $id]);
    }
}
