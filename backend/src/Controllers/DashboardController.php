<?php

declare(strict_types=1);

namespace Sgfp\Controllers;

use Sgfp\Helpers\Response;
use Sgfp\Services\DashboardService;

final class DashboardController
{
    public function index(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new DashboardService();
        Response::success($svc->index((int) $userId));
    }
}
