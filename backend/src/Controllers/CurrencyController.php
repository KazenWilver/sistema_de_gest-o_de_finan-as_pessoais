<?php

declare(strict_types=1);

namespace Sgfp\Controllers;

use Sgfp\Helpers\Response;
use Sgfp\Repositories\UserRepository;
use Sgfp\Services\CurrencyService;

final class CurrencyController
{
    public function rates(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $targetsRaw = $_GET['targets'] ?? 'USD,GBP';
        $targets = array_values(array_filter(array_map('trim', explode(',', (string) $targetsRaw))));
        $users = new UserRepository();
        $u = $users->findById((int) $userId);
        if (!$u) {
            Response::error('Sessão inválida', [], 401);
        }
        $base = strtoupper($u['base_currency'] ?? 'EUR');
        $svc = new CurrencyService();
        Response::success(['base' => $base, 'rates' => $svc->latestForBase($base, $targets)]);
    }
}
