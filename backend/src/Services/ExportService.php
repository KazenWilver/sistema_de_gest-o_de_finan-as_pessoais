<?php

declare(strict_types=1);

namespace Sgfp\Services;

use Sgfp\Helpers\SimplePdf;
use Sgfp\Repositories\TransactionRepository;

final class ExportService
{
    public function __construct(private TransactionRepository $tx = new TransactionRepository())
    {
    }

    public function csv(int $userId, string $from, string $to): string
    {
        $rows = $this->tx->listBetween($userId, $from, $to);
        $out = fopen('php://memory', 'r+');
        fputcsv($out, ['id', 'date', 'type', 'amount', 'currency', 'amount_base', 'category', 'description']);
        foreach ($rows as $r) {
            fputcsv($out, [
                $r['id'],
                $r['trans_date'],
                $r['type'],
                $r['amount'],
                $r['currency_code'],
                $r['amount_base'],
                $r['category_name'] ?? '',
                $r['description'] ?? '',
            ]);
        }
        rewind($out);
        $csv = stream_get_contents($out) ?: '';
        fclose($out);
        return $csv;
    }

    public function pdf(int $userId, string $from, string $to): string
    {
        $rows = $this->tx->listBetween($userId, $from, $to);
        $lines = ["Período {$from} a {$to}"];
        foreach ($rows as $r) {
            $lines[] = sprintf(
                '%s | %s | %s %s | %s | %s',
                $r['trans_date'],
                $r['type'],
                $r['amount'],
                $r['currency_code'],
                $r['category_name'] ?? '',
                $r['description'] ?? ''
            );
        }
        $pdf = new SimplePdf('Exportação Transações');
        return $pdf->build($lines);
    }
}
