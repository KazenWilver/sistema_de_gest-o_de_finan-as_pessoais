<?php

declare(strict_types=1);

namespace Sgfp\Controllers;

use Sgfp\Helpers\Response;
use Sgfp\Services\SettingsService;

final class SettingsController
{
    public function profile(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new SettingsService();
        Response::success($svc->updateProfile((int) $userId, $body));
    }

    public function security(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new SettingsService();
        Response::success($svc->updateSecurity((int) $userId, $body));
    }
}
