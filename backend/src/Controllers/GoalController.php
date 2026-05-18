<?php

declare(strict_types=1);

namespace Sgfp\Controllers;

use Sgfp\Helpers\Response;
use Sgfp\Services\GoalService;

final class GoalController
{
    public function list(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new GoalService();
        Response::success(['goals' => $svc->list((int) $userId)]);
    }

    public function create(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new GoalService();
        Response::success($svc->create((int) $userId, $body));
    }

    public function show(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new GoalService();
        Response::success($svc->get((int) $userId, (int) $params['id']));
    }

    public function update(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new GoalService();
        Response::success($svc->update((int) $userId, (int) $params['id'], $body));
    }

    public function delete(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new GoalService();
        $svc->delete((int) $userId, (int) $params['id']);
        Response::success(null, 'Removida');
    }

    public function contribute(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new GoalService();
        Response::success($svc->contribute((int) $userId, (int) $params['id'], $body));
    }
}
