<?php

declare(strict_types=1);

namespace Sgfp\Controllers;

use Sgfp\Helpers\Response;
use Sgfp\Services\AuthService;

final class AuthController
{
    public function register(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new AuthService();
        Response::success($svc->register($body), 'Registo efectuado');
    }

    public function login(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new AuthService();
        Response::success($svc->login($body), 'Sessão iniciada');
    }

    public function logout(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        Response::success(null, 'Sessão terminada no cliente');
    }

    public function forgot(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new AuthService();
        Response::success($svc->forgot($body));
    }

    public function reset(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new AuthService();
        Response::success($svc->reset($body));
    }

    public function me(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new AuthService();
        Response::success($svc->me((int) $userId));
    }
}
