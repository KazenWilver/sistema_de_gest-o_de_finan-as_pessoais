<?php
/**
 * SGFP — ExportController.php
 * CSV and PDF export.
 */
require_once __DIR__ . '/../Repositories/TransactionRepository.php';
require_once __DIR__ . '/../Core/Response.php';

class ExportController
{
    private TransactionRepository $repo;

    public function __construct() { $this->repo = new TransactionRepository(); }

    public function exportCsv($request): void
    {
        $userId = $request->param('userId');
        $filters = $request->query();
        $transactions = $this->repo->getAllForExport($userId, $filters);

        $csv = "Data,Tipo,Categoria,Conta,Descrição,Valor,Moeda\n";
        foreach ($transactions as $tx) {
            $tipo = $tx['type'] === 'income' ? 'Receita' : 'Despesa';
            $csv .= sprintf(
                "%s,%s,\"%s\",\"%s\",\"%s\",%s,%s\n",
                $tx['transaction_date'],
                $tipo,
                str_replace('"', '""', $tx['category_name'] ?? ''),
                str_replace('"', '""', $tx['account_name'] ?? ''),
                str_replace('"', '""', $tx['description']),
                $tx['amount'],
                $tx['currency']
            );
        }

        Response::download($csv, 'transacoes_' . date('Y-m-d') . '.csv', 'text/csv; charset=utf-8');
    }

    public function exportPdf($request): void
    {
        $userId = $request->param('userId');
        $filters = $request->query();
        $transactions = $this->repo->getAllForExport($userId, $filters);
        $summary = $this->repo->getSummary($userId, $filters['month'] ?? date('Y-m'));

        // Check if FPDF is available
        $fpdfPath = dirname(__DIR__, 2) . '/vendor/fpdf/fpdf.php';
        if (!file_exists($fpdfPath)) {
            // Fallback: generate a simple HTML-based PDF-like response
            $this->generateHtmlReport($transactions, $summary);
            return;
        }

        require_once $fpdfPath;

        $pdf = new FPDF();
        $pdf->AddPage();
        $pdf->SetFont('Arial', 'B', 16);
        $pdf->Cell(0, 10, utf8_decode('Relatório Financeiro - SGFP'), 0, 1, 'C');
        $pdf->SetFont('Arial', '', 10);
        $pdf->Cell(0, 8, 'Gerado em: ' . date('d/m/Y H:i'), 0, 1, 'C');
        $pdf->Ln(5);

        // Summary
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->Cell(0, 8, 'Resumo', 0, 1);
        $pdf->SetFont('Arial', '', 10);
        $pdf->Cell(60, 7, 'Receitas: ' . number_format($summary['income'], 2, ',', '.') . ' AOA', 0, 0);
        $pdf->Cell(60, 7, 'Despesas: ' . number_format($summary['expense'], 2, ',', '.') . ' AOA', 0, 0);
        $pdf->Cell(60, 7, 'Saldo: ' . number_format($summary['balance'], 2, ',', '.') . ' AOA', 0, 1);
        $pdf->Ln(5);

        // Table header
        $pdf->SetFont('Arial', 'B', 9);
        $pdf->Cell(25, 7, 'Data', 1);
        $pdf->Cell(20, 7, 'Tipo', 1);
        $pdf->Cell(30, 7, 'Categoria', 1);
        $pdf->Cell(60, 7, utf8_decode('Descrição'), 1);
        $pdf->Cell(30, 7, 'Valor', 1);
        $pdf->Ln();

        // Table rows
        $pdf->SetFont('Arial', '', 8);
        foreach ($transactions as $tx) {
            $tipo = $tx['type'] === 'income' ? 'Receita' : 'Despesa';
            $pdf->Cell(25, 6, $tx['transaction_date'], 1);
            $pdf->Cell(20, 6, $tipo, 1);
            $pdf->Cell(30, 6, utf8_decode($tx['category_name'] ?? ''), 1);
            $pdf->Cell(60, 6, utf8_decode(substr($tx['description'], 0, 40)), 1);
            $pdf->Cell(30, 6, number_format($tx['amount'], 2, ',', '.'), 1);
            $pdf->Ln();
        }

        $content = $pdf->Output('S');
        Response::download($content, 'relatorio_' . date('Y-m-d') . '.pdf', 'application/pdf');
    }

    private function generateHtmlReport(array $transactions, array $summary): void
    {
        $html = '<html><head><meta charset="utf-8"><title>Relatório SGFP</title></head><body>';
        $html .= '<h1>Relatório Financeiro - SGFP</h1>';
        $html .= '<p>Receitas: ' . number_format($summary['income'], 2, ',', '.') . ' AOA</p>';
        $html .= '<p>Despesas: ' . number_format($summary['expense'], 2, ',', '.') . ' AOA</p>';
        $html .= '<p>Saldo: ' . number_format($summary['balance'], 2, ',', '.') . ' AOA</p>';
        $html .= '<table border="1"><tr><th>Data</th><th>Tipo</th><th>Categoria</th><th>Descrição</th><th>Valor</th></tr>';
        foreach ($transactions as $tx) {
            $html .= '<tr><td>' . $tx['transaction_date'] . '</td><td>' . $tx['type'] . '</td><td>' . ($tx['category_name'] ?? '') . '</td><td>' . $tx['description'] . '</td><td>' . $tx['amount'] . '</td></tr>';
        }
        $html .= '</table></body></html>';
        Response::download($html, 'relatorio_' . date('Y-m-d') . '.html', 'text/html');
    }
}
