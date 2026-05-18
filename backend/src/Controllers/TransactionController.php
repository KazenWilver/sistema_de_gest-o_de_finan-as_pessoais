<?php

declare(strict_types=1);

namespace Sgfp\Controllers;

use Sgfp\Helpers\Response;
use Sgfp\Services\TransactionService;

final class TransactionController
{
    public function list(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new TransactionService();
        $res = $svc->list((int) $userId, $_GET);
        Response::success([
            'items' => $res['rows'],
            'total' => $res['total'],
            'page' => (int) ($_GET['page'] ?? 1),
            'per_page' => (int) ($_GET['per_page'] ?? 20),
        ]);
    }

    public function create(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new TransactionService();
        Response::success($svc->create((int) $userId, $body));
    }

    public function show(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new TransactionService();
        Response::success($svc->get((int) $userId, (int) $params['id']));
    }

    public function update(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new TransactionService();
        Response::success($svc->update((int) $userId, (int) $params['id'], $body));
    }

    public function delete(array $params, ?int $userId, ?string $userRole, array $body): void
    {
        $svc = new TransactionService();
        $svc->delete((int) $userId, (int) $params['id']);
        Response::success(null, 'Removida');
    }
}
