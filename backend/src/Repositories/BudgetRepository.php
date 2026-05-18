<?php

declare(strict_types=1);

namespace Sgfp\Repositories;

use PDO;
use Sgfp\Config\Database;

final class BudgetRepository
{
    /** @return list<array<string,mixed>> */
    public function listByUser(int $userId): array
    {
        $st = Database::pdo()->prepare(
            'SELECT b.*, c.name AS category_name FROM budgets b
             LEFT JOIN categories c ON c.id = b.category_id
             WHERE b.user_id = ? ORDER BY b.period_start DESC'
        );
        $st->execute([$userId]);
        return $st->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findOwned(int $id, int $userId): ?array
    {
        $st = Database::pdo()->prepare(
            'SELECT b.*, c.name AS category_name FROM budgets b
             LEFT JOIN categories c ON c.id = b.category_id
             WHERE b.id = ? AND b.user_id = ? LIMIT 1'
        );
        $st->execute([$id, $userId]);
        $r = $st->fetch(PDO::FETCH_ASSOC);
        return $r ?: null;
    }

    public function create(int $userId, ?int $categoryId, string $amount, string $start, string $end): int
    {
        $st = Database::pdo()->prepare(
            'INSERT INTO budgets (user_id, category_id, amount, period_start, period_end) VALUES (?,?,?,?,?)'
        );
        $st->execute([$userId, $categoryId, $amount, $start, $end]);
        return (int) Database::pdo()->lastInsertId();
    }

    public function update(int $id, int $userId, array $fields): bool
    {
        $allowed = ['category_id', 'amount', 'period_start', 'period_end'];
        $sets = [];
        $vals = [];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $fields)) {
                $sets[] = "$f = ?";
                $vals[] = $fields[$f];
            }
        }
        if ($sets === []) {
            return false;
        }
        $vals[] = $id;
        $vals[] = $userId;
        $sql = 'UPDATE budgets SET ' . implode(',', $sets) . ' WHERE id = ? AND user_id = ?';
        $st = Database::pdo()->prepare($sql);
        $st->execute($vals);
        return $st->rowCount() > 0;
    }

    public function delete(int $id, int $userId): bool
    {
        $st = Database::pdo()->prepare('DELETE FROM budgets WHERE id = ? AND user_id = ?');
        $st->execute([$id, $userId]);
        return $st->rowCount() > 0;
    }
}
