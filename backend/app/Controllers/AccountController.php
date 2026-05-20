<?php
/**
 * SGFP — AccountController.php
 */
require_once __DIR__ . '/../Repositories/AccountRepository.php';
require_once __DIR__ . '/../Helpers/Validator.php';
require_once __DIR__ . '/../Core/Response.php';

class AccountController
{
    private AccountRepository $repo;

    public function __construct() { $this->repo = new AccountRepository(); }

    public function index($request): void
    {
        $accounts = $this->repo->findAllByUser($request->param('userId'));
        Response::json($accounts);
    }

    public function store($request): void
    {
        $v = new Validator();
        if (!$v->validate($request->body(), ['name' => 'required|min:2', 'type' => 'required|in:cash,bank,mobile_money,savings,other'])) {
            Response::error('Dados inválidos.', 422, $v->errors());
        }
        $data = $request->body();
        $data['user_id'] = $request->param('userId');
        $id = $this->repo->create($data);
        $account = $this->repo->findById($id, $data['user_id']);
        Response::json($account, 201, 'Conta criada com sucesso.');
    }

    public function update($request): void
    {
        $id = (int) $request->param('id');
        $userId = $request->param('userId');
        $existing = $this->repo->findById($id, $userId);
        if (!$existing) Response::error('Conta não encontrada.', 404);

        $v = new Validator();
        if (!$v->validate($request->body(), [
            'name' => 'required|min:2',
            'type' => 'required|in:cash,bank,mobile_money,savings,other'
        ])) {
            Response::error('Dados inválidos.', 422, $v->errors());
        }

        $this->repo->update($id, $userId, $request->body());
        Response::json($this->repo->findById($id, $userId), 200, 'Conta atualizada.');
    }

    public function destroy($request): void
    {
        $id = (int) $request->param('id');
        $userId = $request->param('userId');
        if ($this->repo->hasTransactions($id)) {
            Response::error('Não é possível eliminar conta com transações associadas.', 409);
        }
        $this->repo->delete($id, $userId);
        Response::json(null, 200, 'Conta eliminada.');
    }
}
