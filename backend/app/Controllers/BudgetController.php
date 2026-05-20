<?php
/**
 * SGFP — BudgetController.php
 */
require_once __DIR__ . '/../Repositories/BudgetRepository.php';
require_once __DIR__ . '/../Helpers/Validator.php';
require_once __DIR__ . '/../Core/Response.php';

class BudgetController
{
    private BudgetRepository $repo;

    public function __construct() { $this->repo = new BudgetRepository(); }

    public function index($request): void
    {
        Response::json($this->repo->findAllByUser($request->param('userId')));
    }

    public function store($request): void
    {
        $v = new Validator();
        if (!$v->validate($request->body(), [
            'name'         => 'required|min:2',
            'limit_amount' => 'required|numeric|min:1',
            'start_date'   => 'required|date',
            'end_date'     => 'required|date',
        ])) {
            Response::error('Dados inválidos.', 422, $v->errors());
        }
        $data = $request->body();
        $data['user_id'] = $request->param('userId');
        $id = $this->repo->create($data);
        Response::json($this->repo->findById($id, $data['user_id']), 201, 'Orçamento criado.');
    }

    public function update($request): void
    {
        $id = (int) $request->param('id');
        $userId = $request->param('userId');
        if (!$this->repo->findById($id, $userId)) Response::error('Orçamento não encontrado.', 404);

        $v = new Validator();
        if (!$v->validate($request->body(), [
            'name'         => 'required|min:2',
            'limit_amount' => 'required|numeric|min:1',
            'start_date'   => 'required|date',
            'end_date'     => 'required|date',
        ])) {
            Response::error('Dados inválidos.', 422, $v->errors());
        }

        $this->repo->update($id, $userId, $request->body());
        Response::json($this->repo->findById($id, $userId), 200, 'Orçamento atualizado.');
    }

    public function destroy($request): void
    {
        $id = (int) $request->param('id');
        $this->repo->delete($id, $request->param('userId'));
        Response::json(null, 200, 'Orçamento eliminado.');
    }

    public function progress($request): void
    {
        $budgets = $this->repo->getActiveByUser($request->param('userId'));
        Response::json($budgets);
    }
}
