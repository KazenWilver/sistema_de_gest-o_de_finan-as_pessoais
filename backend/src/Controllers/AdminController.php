<?php

declare(strict_types=1);

namespace Sgfp\Controllers;

use Sgfp\Helpers\Response;
use Sgfp\Services\AdminService;

final class AdminController
{
    public function users(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new AdminService();
        Response::success(['users' => $svc->users()]);
    }

    public function stats(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new AdminService();
        Response::success($svc->stats());
    }
}
