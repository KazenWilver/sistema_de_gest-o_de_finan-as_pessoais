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

    public function updateRole($request): void
    {
        $id = (int) $request->param('id');
        $role = $request->input('role');
        if (!in_array($role, ['user', 'admin'])) {
            Response::error('Role inválido.', 400);
        }
        $repo = new UserRepository();
        $repo->updateRole($id, $role);
        Response::json(['id' => $id, 'role' => $role], 200, 'Role actualizado.');
    }

    public function toggleActive($request): void
    {
        $id = (int) $request->param('id');
        $repo = new UserRepository();
        $user = $repo->findById($id);
        if (!$user) Response::error('Utilizador não encontrado.', 404);
        $newStatus = $user['is_active'] ? 0 : 1;
        $repo->updateActive($id, $newStatus);
        Response::json(['id' => $id, 'is_active' => (bool)$newStatus], 200, 'Estado actualizado.');
    }

    public function deleteUser($request): void
    {
        $id = (int) $request->param('id');
        $repo = new UserRepository();
        $repo->delete($id);
        Response::json(null, 200, 'Utilizador eliminado.');
    }
}
