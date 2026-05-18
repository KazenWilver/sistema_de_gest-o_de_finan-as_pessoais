<?php

declare(strict_types=1);

namespace Sgfp\Repositories;

use PDO;
use Sgfp\Config\Database;

final class CategoryRepository
{
    /** @return list<array<string,mixed>> */
    public function listByUser(int $userId): array
    {
        $st = Database::pdo()->prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY type, name');
        $st->execute([$userId]);
        return $st->fetchAll(PDO::FETCH_ASSOC);
    }

    public function findOwned(int $id, int $userId): ?array
    {
        $st = Database::pdo()->prepare('SELECT * FROM categories WHERE id = ? AND user_id = ? LIMIT 1');
        $st->execute([$id, $userId]);
        $r = $st->fetch(PDO::FETCH_ASSOC);
        return $r ?: null;
    }

    public function create(int $userId, string $name, string $type, ?string $icon, ?string $color, int $seeded = 0): int
    {
        $st = Database::pdo()->prepare(
            'INSERT INTO categories (user_id, name, type, icon, color, is_seeded) VALUES (?,?,?,?,?,?)'
        );
        $st->execute([$userId, $name, $type, $icon, $color, $seeded]);
        return (int) Database::pdo()->lastInsertId();
    }

    public function update(int $id, int $userId, array $fields): bool
    {
        $allowed = ['name', 'type', 'icon', 'color'];
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
        $sql = 'UPDATE categories SET ' . implode(',', $sets) . ' WHERE id = ? AND user_id = ?';
        $st = Database::pdo()->prepare($sql);
        $st->execute($vals);
        return $st->rowCount() > 0;
    }

    public function delete(int $id, int $userId): bool
    {
        $st = Database::pdo()->prepare('DELETE FROM categories WHERE id = ? AND user_id = ?');
        $st->execute([$id, $userId]);
        return $st->rowCount() > 0;
    }
}
