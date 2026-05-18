<?php
/**
 * SGFP — AdminController.php
 */
require_once __DIR__ . '/../Repositories/UserRepository.php';
require_once __DIR__ . '/../Repositories/TransactionRepository.php';
require_once __DIR__ . '/../Core/Response.php';

class AdminController
{
    public function users($request): void
    {
        $repo = new UserRepository();
        Response::json($repo->findAll());
    }

    public function stats($request): void
    {
        $userRepo = new UserRepository();
        $txRepo = new TransactionRepository();
        Response::json([
            'total_users'        => $userRepo->countAll(),
            'total_transactions' => $txRepo->countAll(),
        ]);
    }
}
