<?php

declare(strict_types=1);

namespace Sgfp\Repositories;

use PDO;
use Sgfp\Config\Database;

final class CurrencyRepository
{
    public function getRate(string $base, string $target): ?array
    {
        if ($base === $target) {
            return ['base_currency' => $base, 'target_currency' => $target, 'rate' => '1', 'fetched_at' => date('Y-m-d H:i:s')];
        }
        $st = Database::pdo()->prepare(
            'SELECT * FROM currency_rates WHERE base_currency = ? AND target_currency = ? LIMIT 1'
        );
        $st->execute([$base, $target]);
        $r = $st->fetch(PDO::FETCH_ASSOC);
        return $r ?: null;
    }

    public function upsertRate(string $base, string $target, string $rate, string $fetchedAt): void
    {
        $st = Database::pdo()->prepare(
            'INSERT INTO currency_rates (base_currency, target_currency, rate, fetched_at)
             VALUES (?,?,?,?)
             ON DUPLICATE KEY UPDATE rate = VALUES(rate), fetched_at = VALUES(fetched_at)'
        );
        $st->execute([$base, $target, $rate, $fetchedAt]);
    }
}
