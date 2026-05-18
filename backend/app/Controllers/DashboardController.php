<?php
/**
 * SGFP — DashboardController.php
 */
require_once __DIR__ . '/../Repositories/TransactionRepository.php';
require_once __DIR__ . '/../Repositories/BudgetRepository.php';
require_once __DIR__ . '/../Core/Response.php';

class DashboardController
{
    private TransactionRepository $txRepo;
    private BudgetRepository $budgetRepo;

    public function __construct()
    {
        $this->txRepo = new TransactionRepository();
        $this->budgetRepo = new BudgetRepository();
    }

    public function summary($request): void
    {
        $userId = $request->param('userId');
        $month = $request->queryParam('month', date('Y-m'));
        $summary = $this->txRepo->getSummary($userId, $month);
        $summary['savings_rate'] = $summary['income'] > 0
            ? round(($summary['balance'] / $summary['income']) * 100, 1)
            : 0;
        Response::json($summary);
    }

    public function recentTransactions($request): void
    {
        $recent = $this->txRepo->getRecent($request->param('userId'), 5);
        Response::json($recent);
    }

    public function charts($request): void
    {
        $userId = $request->param('userId');
        $months = (int) $request->queryParam('months', 6);
        $trend = $this->txRepo->getMonthlyTrend($userId, $months);

        $from = date('Y-m-01');
        $to = date('Y-m-t');
        $byCategory = $this->txRepo->getByCategory($userId, $from, $to);
        $budgets = $this->budgetRepo->getActiveByUser($userId);

        Response::json([
            'trend'       => $trend,
            'byCategory'  => $byCategory,
            'budgets'     => $budgets,
        ]);
    }
}
