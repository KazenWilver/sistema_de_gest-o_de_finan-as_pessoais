<?php
/**
 * SGFP — CategoryController.php
 */
require_once __DIR__ . '/../Repositories/CategoryRepository.php';
require_once __DIR__ . '/../Helpers/Validator.php';
require_once __DIR__ . '/../Core/Response.php';

class CategoryController
{
    private CategoryRepository $repo;

    public function __construct() { $this->repo = new CategoryRepository(); }

    public function index($request): void
    {
        $type = $request->queryParam('type');
        $categories = $this->repo->findAllByUser($request->param('userId'), $type);
        Response::json($categories);
    }

    public function store($request): void
    {
        $v = new Validator();
        if (!$v->validate($request->body(), ['name' => 'required|min:2', 'type' => 'required|in:income,expense'])) {
            Response::error('Dados inválidos.', 422, $v->errors());
        }
        $data = $request->body();
        $data['user_id'] = $request->param('userId');
        $id = $this->repo->create($data);
        Response::json($this->repo->findById($id, $data['user_id']), 201, 'Categoria criada.');
    }

    public function update($request): void
    {
        $id = (int) $request->param('id');
        $userId = $request->param('userId');
        if (!$this->repo->findById($id, $userId)) Response::error('Categoria não encontrada.', 404);

        $v = new Validator();
        if (!$v->validate($request->body(), [
            'name' => 'required|min:2',
            'type' => 'required|in:income,expense'
        ])) {
            Response::error('Dados inválidos.', 422, $v->errors());
        }

        $this->repo->update($id, $userId, $request->body());
        Response::json($this->repo->findById($id, $userId), 200, 'Categoria atualizada.');
    }

    public function destroy($request): void
    {
        $id = (int) $request->param('id');
        $userId = $request->param('userId');
        if ($this->repo->hasTransactions($id)) {
            Response::error('Não é possível eliminar categoria com transações.', 409);
        }
        $this->repo->delete($id, $userId);
        Response::json(null, 200, 'Categoria eliminada.');
    }
}
