<?php
/**
 * SGFP — CurrencyController.php
 * Currency conversion using Frankfurter API.
 */
require_once __DIR__ . '/../Repositories/CurrencyRepository.php';
require_once __DIR__ . '/../Core/Response.php';

class CurrencyController
{
    private CurrencyRepository $repo;

    public function __construct() { $this->repo = new CurrencyRepository(); }

    public function rates($request): void
    {
        $base = $request->queryParam('base', 'USD');
        $targets = ['AOA', 'EUR', 'USD', 'BRL', 'GBP'];

        $rates = [];
        $needsFetch = false;

        foreach ($targets as $target) {
            if ($target === $base) { $rates[$target] = 1.0; continue; }
            $cached = $this->repo->getRate($base, $target);
            if ($cached) {
                $rates[$target] = (float) $cached['rate'];
            } else {
                $needsFetch = true;
            }
        }

        if ($needsFetch) {
            $fetched = $this->fetchFromApi($base);
            if ($fetched) {
                foreach ($fetched as $currency => $rate) {
                    $this->repo->upsertRate($base, $currency, $rate);
                    $rates[$currency] = $rate;
                }
            }
        }

        Response::json(['base' => $base, 'rates' => $rates]);
    }

    private function fetchFromApi(string $base): ?array
    {
        $targetStr = 'AOA,EUR,USD,BRL,GBP';
        $url = "https://api.frankfurter.app/latest?from=$base&to=$targetStr";

        $ctx = stream_context_create(['http' => ['timeout' => 10]]);
        $response = @file_get_contents($url, false, $ctx);

        if (!$response) return null;

        $data = json_decode($response, true);
        return $data['rates'] ?? null;
    }
}
