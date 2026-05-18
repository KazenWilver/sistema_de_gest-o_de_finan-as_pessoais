<?php

declare(strict_types=1);

namespace Sgfp\Controllers;

use Sgfp\Helpers\Response;
use Sgfp\Services\CategoryService;

final class CategoryController
{
    public function list(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new CategoryService();
        Response::success(['categories' => $svc->list((int) $userId)]);
    }

    public function create(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new CategoryService();
        Response::success($svc->create((int) $userId, $body));
    }

    public function show(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new CategoryService();
        Response::success($svc->get((int) $userId, (int) $params['id']));
    }

    public function update(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new CategoryService();
        Response::success($svc->update((int) $userId, (int) $params['id'], $body));
    }

    public function delete(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new CategoryService();
        $svc->delete((int) $userId, (int) $params['id']);
        Response::success(null, 'Removida');
    }
}
