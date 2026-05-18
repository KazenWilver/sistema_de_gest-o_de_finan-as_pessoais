<?php
/**
 * SGFP — ReportController.php
 */
require_once __DIR__ . '/../Repositories/TransactionRepository.php';
require_once __DIR__ . '/../Core/Response.php';

class ReportController
{
    private TransactionRepository $repo;

    public function __construct() { $this->repo = new TransactionRepository(); }

    public function summary($request): void
    {
        $month = $request->queryParam('month', date('Y-m'));
        Response::json($this->repo->getSummary($request->param('userId'), $month));
    }

    public function byCategory($request): void
    {
        $from = $request->queryParam('from', date('Y-m-01'));
        $to = $request->queryParam('to', date('Y-m-t'));
        Response::json($this->repo->getByCategory($request->param('userId'), $from, $to));
    }

    public function trend($request): void
    {
        $months = (int) $request->queryParam('months', 6);
        Response::json($this->repo->getMonthlyTrend($request->param('userId'), $months));
    }
}
