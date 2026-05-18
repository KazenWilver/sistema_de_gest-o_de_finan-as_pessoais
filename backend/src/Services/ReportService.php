<?php

declare(strict_types=1);

namespace Sgfp\Services;

use Sgfp\Helpers\Response;
use Sgfp\Helpers\Validator;
use Sgfp\Repositories\TransactionRepository;
use Sgfp\Repositories\UserRepository;

final class ReportService
{
    public function __construct(
        private TransactionRepository $tx = new TransactionRepository(),
        private UserRepository $users = new UserRepository()
    ) {
    }

    /** @return array<string,mixed> */
    private function range(array $q): array
    {
        $from = $q['from'] ?? date('Y-m-01');
        $to = $q['to'] ?? date('Y-m-t');
        if (!Validator::dateYmd((string) $from) || !Validator::dateYmd((string) $to)) {
            Response::error('Período inválido', [], 422);
        }
        return ['from' => $from, 'to' => $to];
    }

    public function summary(int $userId, array $q): array
    {
        $r = $this->range($q);
        $t = $this->tx->totalsBetween($userId, $r['from'], $r['to']);
        $u = $this->users->findById($userId);
        return [
            'period' => $r,
            'totals' => $t,
            'base_currency' => $u['base_currency'] ?? 'EUR',
        ];
    }

    public function byCategory(int $userId, array $q): array
    {
        $r = $this->range($q);
        return [
            'period' => $r,
            'breakdown' => $this->tx->sumByCategory($userId, $r['from'], $r['to']),
        ];
    }

    public function trend(int $userId, array $q): array
    {
        $r = $this->range($q);
        return [
            'period' => $r,
            'series' => $this->tx->dailyTrend($userId, $r['from'], $r['to']),
        ];
    }
}
