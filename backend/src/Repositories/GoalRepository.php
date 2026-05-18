<?php

declare(strict_types=1);

namespace Sgfp\Repositories;

use PDO;
use Sgfp\Config\Database;

final class GoalRepository
{
    /** @return list<array<string,mixed>> */
    public function listByUser(int $userId): array
    {
        $st = Database::pdo()->prepare('SELECT * FROM goals WHERE user_id = ? ORDER BY deadline IS NULL, deadline, id');
        $st->execute([$userId]);
        return $st->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findOwned(int $id, int $userId): ?array
    {
        $st = Database::pdo()->prepare('SELECT * FROM goals WHERE id = ? AND user_id = ? LIMIT 1');
        $st->execute([$id, $userId]);
        $r = $st->fetch(PDO::FETCH_ASSOC);
        return $r ?: null;
    }

    public function create(int $userId, string $name, string $target, string $current, ?string $deadline): int
    {
        $st = Database::pdo()->prepare(
            'INSERT INTO goals (user_id, name, target_amount, current_amount, deadline) VALUES (?,?,?,?,?)'
        );
        $st->execute([$userId, $name, $target, $current, $deadline]);
        return (int) Database::pdo()->lastInsertId();
    }

    public function update(int $id, int $userId, array $fields): bool
    {
        $allowed = ['name', 'target_amount', 'current_amount', 'deadline'];
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
        $sql = 'UPDATE goals SET ' . implode(',', $sets) . ' WHERE id = ? AND user_id = ?';
        $st = Database::pdo()->prepare($sql);
        $st->execute($vals);
        return $st->rowCount() > 0;
    }

    public function delete(int $id, int $userId): bool
    {
        $st = Database::pdo()->prepare('DELETE FROM goals WHERE id = ? AND user_id = ?');
        $st->execute([$id, $userId]);
        return $st->rowCount() > 0;
    }

    public function addAmount(int $id, int $userId, string $delta): bool
    {
        $st = Database::pdo()->prepare(
            'UPDATE goals SET current_amount = current_amount + ? WHERE id = ? AND user_id = ?'
        );
        $st->execute([$delta, $id, $userId]);
        return $st->rowCount() > 0;
    }
}
