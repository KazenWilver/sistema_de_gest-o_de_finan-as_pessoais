<?php

declare(strict_types=1);

namespace Sgfp\Services;

use Sgfp\Repositories\BudgetRepository;
use Sgfp\Repositories\TransactionRepository;
use Sgfp\Repositories\UserRepository;

final class DashboardService
{
    public function __construct(
        private TransactionRepository $tx = new TransactionRepository(),
        private BudgetRepository $budgets = new BudgetRepository(),
        private BudgetService $budgetSvc = new BudgetService(),
        private UserRepository $users = new UserRepository()
    ) {
    }

    /** @return array<string,mixed> */
    public function index(int $userId): array
    {
        $from = date('Y-m-01');
        $to = date('Y-m-t');
        $totals = $this->tx->totalsBetween($userId, $from, $to);
        $recent = $this->tx->search($userId, ['from' => null, 'to' => null, 'page' => 1, 'per_page' => 5]);
        $budgetList = $this->budgets->listByUser($userId);
        $budgetSummary = [];
        foreach ($budgetList as $b) {
            if (date('Y-m-d') < $b['period_start'] || date('Y-m-d') > $b['period_end']) {
                continue;
            }
            $budgetSummary[] = $this->budgetSvc->progress($userId, (int) $b['id']);
        }
        $u = $this->users->findById($userId);
        return [
            'period_month' => ['from' => $from, 'to' => $to],
            'totals' => $totals,
            'base_currency' => $u['base_currency'] ?? 'EUR',
            'recent' => $recent['rows'],
            'budgets_active' => $budgetSummary,
        ];
    }
}
