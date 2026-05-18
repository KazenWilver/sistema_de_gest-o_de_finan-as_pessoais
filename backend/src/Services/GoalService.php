<?php

declare(strict_types=1);

namespace Sgfp\Services;

use Sgfp\Helpers\Response;
use Sgfp\Helpers\Validator;
use Sgfp\Repositories\GoalRepository;

final class GoalService
{
    public function __construct(private GoalRepository $repo = new GoalRepository())
    {
    }

    /** @return list<array<string,mixed>> */
    public function list(int $userId): array
    {
        return $this->repo->listByUser($userId);
    }

    public function create(int $userId, array $body): array
    {
        $miss = Validator::requireFields($body, ['name', 'target_amount']);
        if ($miss !== []) {
            Response::error('Validação falhou', $miss, 422);
        }
        if (!Validator::decimalString($body['target_amount'])) {
            Response::error('Valor alvo inválido', [], 422);
        }
        $cur = isset($body['current_amount']) ? (string) $body['current_amount'] : '0';
        if (!Validator::decimalString($cur)) {
            Response::error('Progresso inválido', [], 422);
        }
        $dead = $body['deadline'] ?? null;
        if ($dead && !Validator::dateYmd((string) $dead)) {
            Response::error('Data limite inválida', [], 422);
        }
        $id = $this->repo->create(
            $userId,
            substr((string) $body['name'], 0, 200),
            number_format((float) $body['target_amount'], 4, '.', ''),
            number_format((float) $cur, 4, '.', ''),
            $dead ? (string) $dead : null
        );
        return $this->repo->findOwned($id, $userId);
    }

    public function update(int $userId, int $id, array $body): array
    {
        if (!$this->repo->findOwned($id, $userId)) {
            Response::error('Não encontrado', [], 404);
        }
        $fields = [];
        foreach (['name', 'target_amount', 'current_amount', 'deadline'] as $f) {
            if (array_key_exists($f, $body)) {
                if ($f === 'name') {
                    $fields[$f] = substr((string) $body[$f], 0, 200);
                } elseif ($f === 'deadline') {
                    $fields[$f] = $body[$f] ? (string) $body[$f] : null;
                } else {
                    if (!Validator::decimalString($body[$f])) {
                        Response::error('Montante inválido', [], 422);
                    }
                    $fields[$f] = number_format((float) $body[$f], 4, '.', '');
                }
            }
        }
        if ($fields !== [] && !$this->repo->update($id, $userId, $fields)) {
            Response::error('Falha ao atualizar', [], 400);
        }
        return $this->repo->findOwned($id, $userId);
    }

    public function delete(int $userId, int $id): void
    {
        if (!$this->repo->delete($id, $userId)) {
            Response::error('Não encontrado', [], 404);
        }
    }

    public function get(int $userId, int $id): array
    {
        $g = $this->repo->findOwned($id, $userId);
        if (!$g) {
            Response::error('Não encontrada', [], 404);
        }
        return $g;
    }

    public function contribute(int $userId, int $id, array $body): array
    {
        $miss = Validator::requireFields($body, ['amount']);
        if ($miss !== []) {
            Response::error('Montante obrigatório', $miss, 422);
        }
        if (!Validator::decimalString($body['amount'])) {
            Response::error('Montante inválido', [], 422);
        }
        if (!$this->repo->findOwned($id, $userId)) {
            Response::error('Não encontrado', [], 404);
        }
        $this->repo->addAmount($id, $userId, number_format((float) $body['amount'], 4, '.', ''));
        return $this->repo->findOwned($id, $userId);
    }
}
