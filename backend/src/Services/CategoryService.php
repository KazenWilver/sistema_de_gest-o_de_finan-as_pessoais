<?php

declare(strict_types=1);

namespace Sgfp\Services;

use Sgfp\Helpers\Response;
use Sgfp\Helpers\Validator;
use Sgfp\Repositories\CategoryRepository;

final class CategoryService
{
    public function __construct(private CategoryRepository $repo = new CategoryRepository())
    {
    }

    /** @return list<array{name:string,type:string,icon:string,color:string}> */
    public function defaultSeedTemplate(): array
    {
        return [
            ['name' => 'Salário', 'type' => 'income', 'icon' => 'work', 'color' => '#22c55e'],
            ['name' => 'Outros rendimentos', 'type' => 'income', 'icon' => 'add', 'color' => '#86efac'],
            ['name' => 'Alimentação', 'type' => 'expense', 'icon' => 'restaurant', 'color' => '#ef4444'],
            ['name' => 'Transporte', 'type' => 'expense', 'icon' => 'directions_car', 'color' => '#f97316'],
            ['name' => 'Habitação', 'type' => 'expense', 'icon' => 'home', 'color' => '#a855f7'],
        ];
    }

    public function seedDefaultsForUser(int $userId): void
    {
        foreach ($this->defaultSeedTemplate() as $c) {
            $this->repo->create(
                $userId,
                $c['name'],
                $c['type'],
                $c['icon'],
                $c['color'],
                1
            );
        }
    }

    /** @return list<array<string,mixed>> */
    public function list(int $userId): array
    {
        return $this->repo->listByUser($userId);
    }

    public function get(int $userId, int $id): array
    {
        $c = $this->repo->findOwned($id, $userId);
        if (!$c) {
            Response::error('Não encontrada', [], 404);
        }
        return $c;
    }

    public function create(int $userId, array $body): array
    {
        $miss = Validator::requireFields($body, ['name', 'type']);
        if ($miss !== []) {
            Response::error('Validação falhou', $miss, 422);
        }
        if (!Validator::inList($body['type'], ['income', 'expense'])) {
            Response::error('Tipo inválido', [], 422);
        }
        $id = $this->repo->create(
            $userId,
            substr((string) $body['name'], 0, 100),
            (string) $body['type'],
            $body['icon'] ?? null,
            $body['color'] ?? null,
            0
        );
        return $this->repo->findOwned($id, $userId);
    }

    public function update(int $userId, int $id, array $body): array
    {
        if (!$this->repo->findOwned($id, $userId)) {
            Response::error('Não encontrada', [], 404);
        }
        $fields = [];
        if (isset($body['name'])) {
            $fields['name'] = substr((string) $body['name'], 0, 100);
        }
        if (isset($body['type']) && Validator::inList($body['type'], ['income', 'expense'])) {
            $fields['type'] = $body['type'];
        }
        if (array_key_exists('icon', $body)) {
            $fields['icon'] = $body['icon'];
        }
        if (array_key_exists('color', $body)) {
            $fields['color'] = $body['color'];
        }
        if ($fields !== [] && !$this->repo->update($id, $userId, $fields)) {
            Response::error('Nada para atualizar', [], 400);
        }
        return $this->repo->findOwned($id, $userId);
    }

    public function delete(int $userId, int $id): void
    {
        if (!$this->repo->delete($id, $userId)) {
            Response::error('Não encontrada', [], 404);
        }
    }
}
