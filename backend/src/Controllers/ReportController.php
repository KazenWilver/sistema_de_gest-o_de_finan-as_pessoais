<?php

declare(strict_types=1);

namespace Sgfp\Controllers;

use Sgfp\Helpers\Response;
use Sgfp\Services\ReportService;

final class ReportController
{
    public function summary(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new ReportService();
        Response::success($svc->summary((int) $userId, $_GET));
    }

    public function byCategory(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new ReportService();
        Response::success($svc->byCategory((int) $userId, $_GET));
    }

    public function trend(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new ReportService();
        Response::success($svc->trend((int) $userId, $_GET));
    }
}
