<?php

declare(strict_types=1);

namespace Sgfp\Controllers;

use Sgfp\Helpers\Response;
use Sgfp\Helpers\Validator;
use Sgfp\Services\ExportService;

final class ExportController
{
    public function csv(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $q = $_GET;
        $from = $q['from'] ?? date('Y-m-01');
        $to = $q['to'] ?? date('Y-m-t');
        if (!Validator::dateYmd((string) $from) || !Validator::dateYmd((string) $to)) {
            Response::error('Período inválido', [], 422);
        }
        $svc = new ExportService();
        $csv = $svc->csv((int) $userId, $from, $to);
        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="sgfp-transacoes.csv"');
        echo $csv;
        exit;
    }

    public function pdf(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $q = $_GET;
        $from = $q['from'] ?? date('Y-m-01');
        $to = $q['to'] ?? date('Y-m-t');
        if (!Validator::dateYmd((string) $from) || !Validator::dateYmd((string) $to)) {
            Response::error('Período inválido', [], 422);
        }
        $svc = new ExportService();
        $pdf = $svc->pdf((int) $userId, $from, $to);
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="sgfp-transacoes.pdf"');
        echo $pdf;
        exit;
    }
}
