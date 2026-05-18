<?php

declare(strict_types=1);

namespace Sgfp\Repositories;

use PDO;
use Sgfp\Config\Database;

final class UserRepository
{
    public function findByEmail(string $email): ?array
    {
        $st = Database::pdo()->prepare('SELECT * FROM users WHERE email = ? LIMIT 1');
        $st->execute([$email]);
        $r = $st->fetch(PDO::FETCH_ASSOC);
        return $r ?: null;
    }

    public function findById(int $id): ?array
    {
        $st = Database::pdo()->prepare('SELECT * FROM users WHERE id = ? LIMIT 1');
        $st->execute([$id]);
        $r = $st->fetch(PDO::FETCH_ASSOC);
        return $r ?: null;
    }

    public function findByResetToken(string $token): ?array
    {
        $st = Database::pdo()->prepare('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires_at > NOW() LIMIT 1');
        $st->execute([$token]);
        $r = $st->fetch(PDO::FETCH_ASSOC);
        return $r ?: null;
    }

    public function create(string $email, string $hash, string $role, string $baseCurrency, string $language): int
    {
        $st = Database::pdo()->prepare(
            'INSERT INTO users (email, password_hash, role, base_currency, language) VALUES (?,?,?,?,?)'
        );
        $st->execute([$email, $hash, $role, $baseCurrency, $language]);
        return (int) Database::pdo()->lastInsertId();
    }

    public function setResetToken(int $userId, string $token, string $expiresAt): void
    {
        $st = Database::pdo()->prepare('UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?');
        $st->execute([$token, $expiresAt, $userId]);
    }

    public function updatePassword(int $userId, string $hash): void
    {
        $st = Database::pdo()->prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?');
        $st->execute([$hash, $userId]);
    }

    public function updateProfile(int $userId, string $language, string $baseCurrency): void
    {
        $st = Database::pdo()->prepare('UPDATE users SET language = ?, base_currency = ? WHERE id = ?');
        $st->execute([$language, $baseCurrency, $userId]);
    }

    /** @return list<array<string,mixed>> */
    public function listAllBasic(): array
    {
        $st = Database::pdo()->query('SELECT id, email, role, base_currency, language, created_at FROM users ORDER BY id');
        return $st->fetchAll(PDO::FETCH_ASSOC);
    }
}
