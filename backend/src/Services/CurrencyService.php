<?php

declare(strict_types=1);

namespace Sgfp\Services;

use Sgfp\Repositories\CurrencyRepository;

final class CurrencyService
{
    public function __construct(private CurrencyRepository $repo = new CurrencyRepository())
    {
    }

    /** Converte montante na moeda `from` para moeda base do utilizador. */
    public function toBaseAmount(string $amount, string $fromCurrency, string $baseCurrency): string
    {
        if (strtoupper($fromCurrency) === strtoupper($baseCurrency)) {
            return $this->norm($amount);
        }
        $rate = $this->getLiveRate(strtoupper($fromCurrency), strtoupper($baseCurrency));
        $out = (float) $amount * (float) $rate;
        return number_format($out, 4, '.', '');
    }

    /**
     * Taxa: quantas unidades de `target` por 1 unidade de `base` (API Frankfurter).
     * @return array{rate:string,fetched_at:string,cached:bool}
     */
    public function ensureRate(string $base, string $target): array
    {
        if ($base === $target) {
            return ['rate' => '1', 'fetched_at' => date('Y-m-d H:i:s'), 'cached' => true];
        }
        $row = $this->repo->getRate($base, $target);
        if ($row && strtotime($row['fetched_at']) > time() - 43200) {
            return ['rate' => (string) $row['rate'], 'fetched_at' => $row['fetched_at'], 'cached' => true];
        }
        $rate = $this->fetchFrankfurter($base, $target);
        $now = date('Y-m-d H:i:s');
        $this->repo->upsertRate($base, $target, $rate, $now);
        return ['rate' => $rate, 'fetched_at' => $now, 'cached' => false];
    }

    private function getLiveRate(string $from, string $to): string
    {
        $data = $this->ensureRate($from, $to);
        return $data['rate'];
    }

    private function fetchFrankfurter(string $base, string $target): string
    {
        $url = 'https://api.frankfurter.app/latest?from=' . rawurlencode($base) . '&to=' . rawurlencode($target);
        $ctx = stream_context_create(['http' => ['timeout' => 8]]);
        $json = @file_get_contents($url, false, $ctx);
        if ($json === false) {
            $fallback = $this->repo->getRate($base, $target);
            if ($fallback) {
                return (string) $fallback['rate'];
            }
            return '1';
        }
        $data = json_decode($json, true);
        if (!is_array($data) || empty($data['rates'][$target])) {
            $fallback = $this->repo->getRate($base, $target);
            if ($fallback) {
                return (string) $fallback['rate'];
            }
            return '1';
        }
        return (string) $data['rates'][$target];
    }

    /** @return array<string,array{rate:string,fetched_at:string,cached:bool}> */
    public function latestForBase(string $base, array $targets): array
    {
        $out = [];
        foreach ($targets as $t) {
            $t = strtoupper($t);
            if ($t === strtoupper($base)) {
                continue;
            }
            $out[$t] = $this->ensureRate(strtoupper($base), $t);
        }
        return $out;
    }

    private function norm(string $a): string
    {
        return number_format((float) $a, 4, '.', '');
    }
}
