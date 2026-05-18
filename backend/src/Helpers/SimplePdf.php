<?php

declare(strict_types=1);

namespace Sgfp\Helpers;

/**
 * PDF mínimo (Helvetica) para relatórios sem dependência externa.
 */
final class SimplePdf
{
    public function __construct(private string $title)
    {
    }

    /** @param list<string> $rows */
    public function build(array $rows): string
    {
        $lines = ['SGFP — ' . $this->title];
        foreach ($rows as $r) {
            $lines[] = $r;
        }
        $textOps = "BT\n/F1 11 Tf\n";
        $y = 720;
        foreach ($lines as $line) {
            $esc = $this->escapePdfText($line);
            $textOps .= "1 0 0 1 50 {$y} Tm ({$esc}) Tj\n";
            $y -= 14;
            if ($y < 40) {
                break;
            }
        }
        $textOps .= "ET\n";

        $len = strlen($textOps);
        $streamBody = "<< /Length {$len} >>\nstream\n{$textOps}endstream";

        $objects = [];
        $objects[] = "<< /Type /Catalog /Pages 2 0 R >>";
        $objects[] = "<< /Type /Pages /Kids [3 0 R] /Count 1 >>";
        $objects[] = "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>";
        $objects[] = $streamBody;
        $objects[] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

        $pdf = "%PDF-1.4\n";
        $offsets = [];
        $i = 1;
        foreach ($objects as $obj) {
            $offsets[$i] = strlen($pdf);
            $pdf .= "{$i} 0 obj\n{$obj}\nendobj\n";
            $i++;
        }
        $xrefPos = strlen($pdf);
        $count = count($offsets) + 1;
        $pdf .= "xref\n0 {$count}\n";
        $pdf .= "0000000000 65535 f \n";
        for ($j = 1; $j < $count; $j++) {
            $pdf .= sprintf("%010d 00000 n \n", $offsets[$j]);
        }
        $pdf .= "trailer\n<< /Size {$count} /Root 1 0 R >>\n";
        $pdf .= "startxref\n{$xrefPos}\n%%EOF";
        return $pdf;
    }

    private function escapePdfText(string $s): string
    {
        $conv = @iconv('UTF-8', 'Windows-1252//TRANSLIT', $s);
        if ($conv !== false) {
            $s = $conv;
        }
        return str_replace(['\\', '(', ')'], ['\\\\', '\\(', '\\)'], $s);
    }
}
