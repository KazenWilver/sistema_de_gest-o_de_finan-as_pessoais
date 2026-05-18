<?php

declare(strict_types=1);

namespace Sgfp\Services;

use PDO;
use Sgfp\Config\Database;
use Sgfp\Repositories\UserRepository;

final class AdminService
{
    public function __construct(
        private UserRepository $users = new UserRepository()
    ) {
    }

    public function users(): array
    {
        return $this->users->listAllBasic();
    }

    public function stats(): array
    {
        $pdo = Database::pdo();
        $cUsers = (int) $pdo->query('SELECT COUNT(*) AS c FROM users')->fetch(PDO::FETCH_ASSOC)['c'];
        $cTx = (int) $pdo->query('SELECT COUNT(*) AS c FROM transactions')->fetch(PDO::FETCH_ASSOC)['c'];
        $sums = $pdo->query(
            "SELECT
                COALESCE(SUM(CASE WHEN type='income' THEN amount_base ELSE 0 END),0) AS inc,
                COALESCE(SUM(CASE WHEN type='expense' THEN amount_base ELSE 0 END),0) AS exp
             FROM transactions"
        )->fetch(PDO::FETCH_ASSOC);
        return [
            'users' => $cUsers,
            'transactions' => $cTx,
            'total_income_base' => (string) ($sums['inc'] ?? '0'),
            'total_expense_base' => (string) ($sums['exp'] ?? '0'),
        ];
    }
}
