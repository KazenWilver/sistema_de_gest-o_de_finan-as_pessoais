<?php

declare(strict_types=1);

namespace Sgfp\Controllers;

use Sgfp\Helpers\Response;
use Sgfp\Helpers\Validator;
use Sgfp\Services\BudgetService;

final class BudgetController
{
    public function list(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new BudgetService();
        Response::success(['budgets' => $svc->list((int) $userId)]);
    }

    public function create(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new BudgetService();
        Response::success($svc->create((int) $userId, $body));
    }

    public function show(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new BudgetService();
        Response::success($svc->get((int) $userId, (int) $params['id']));
    }

    public function progress(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new BudgetService();
        Response::success($svc->progress((int) $userId, (int) $params['id']));
    }

    public function update(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new BudgetService();
        Response::success($svc->update((int) $userId, (int) $params['id'], $body));
    }

    public function delete(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new BudgetService();
        $svc->delete((int) $userId, (int) $params['id']);
        Response::success(null, 'Removido');
    }
}
