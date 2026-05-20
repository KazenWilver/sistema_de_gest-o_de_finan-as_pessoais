<?php
/**
 * SGFP — TransactionController.php
 */
require_once __DIR__ . '/../Repositories/TransactionRepository.php';
require_once __DIR__ . '/../Helpers/Validator.php';
require_once __DIR__ . '/../Core/Response.php';

class TransactionController
{
    private TransactionRepository $repo;

    public function __construct() { $this->repo = new TransactionRepository(); }

    public function index($request): void
    {
        $userId = $request->param('userId');
        $filters = $request->query();
        $transactions = $this->repo->findAllByUser($userId, $filters);
        $total = $this->repo->countByUser($userId, $filters);
        Response::json([
            'transactions' => $transactions,
            'total'        => $total,
            'page'         => (int)($filters['page'] ?? 1),
            'limit'        => (int)($filters['limit'] ?? 20),
        ]);
    }

    public function show($request): void
    {
        $id = (int) $request->param('id');
        $tx = $this->repo->findById($id, $request->param('userId'));
        if (!$tx) Response::error('Transação não encontrada.', 404);
        Response::json($tx);
    }

    public function store($request): void
    {
        $v = new Validator();
        if (!$v->validate($request->body(), [
            'account_id'       => 'required|numeric',
            'category_id'      => 'required|numeric',
            'type'             => 'required|in:income,expense',
            'amount'           => 'required|numeric|min:0.01',
            'description'      => 'required|min:2',
            'transaction_date' => 'required|date',
        ])) {
            Response::error('Dados inválidos.', 422, $v->errors());
        }
        $data = $request->body();
        $data['user_id'] = $request->param('userId');
        $id = $this->repo->create($data);
        Response::json($this->repo->findById($id, $data['user_id']), 201, 'Transação criada.');
    }

    public function update($request): void
    {
        $id = (int) $request->param('id');
        $userId = $request->param('userId');
        if (!$this->repo->findById($id, $userId)) Response::error('Transação não encontrada.', 404);

        $v = new Validator();
        if (!$v->validate($request->body(), [
            'account_id'       => 'required|numeric',
            'category_id'      => 'required|numeric',
            'type'             => 'required|in:income,expense',
            'amount'           => 'required|numeric|min:0.01',
            'description'      => 'required|min:2',
            'transaction_date' => 'required|date',
        ])) {
            Response::error('Dados inválidos.', 422, $v->errors());
        }

        $this->repo->update($id, $userId, $request->body());
        Response::json($this->repo->findById($id, $userId), 200, 'Transação atualizada.');
    }

    public function destroy($request): void
    {
        $id = (int) $request->param('id');
        $this->repo->delete($id, $request->param('userId'));
        Response::json(null, 200, 'Transação eliminada.');
    }
}
