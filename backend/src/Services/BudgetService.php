<?php

declare(strict_types=1);

namespace Sgfp\Services;

use Sgfp\Helpers\Response;
use Sgfp\Helpers\Validator;
use Sgfp\Repositories\BudgetRepository;
use Sgfp\Repositories\CategoryRepository;
use Sgfp\Repositories\TransactionRepository;

final class BudgetService
{
    public function __construct(
        private BudgetRepository $repo = new BudgetRepository(),
        private CategoryRepository $cat = new CategoryRepository(),
        private TransactionRepository $tx = new TransactionRepository()
    ) {
    }

    /** @return list<array<string,mixed>> */
    public function list(int $userId): array
    {
        return $this->repo->listByUser($userId);
    }

    public function create(int $userId, array $body): array
    {
        $miss = Validator::requireFields($body, ['amount', 'period_start', 'period_end']);
        if ($miss !== []) {
            Response::error('Validação falhou', $miss, 422);
        }
        if (!Validator::decimalString($body['amount'])) {
            Response::error('Montante inválido', [], 422);
        }
        $catId = null;
        if (!empty($body['category_id'])) {
            $catId = (int) $body['category_id'];
            $c = $this->cat->findOwned($catId, $userId);
            if (!$c || $c['type'] !== 'expense') {
                Response::error('Categoria de despesa obrigatória para orçamento por categoria', [], 422);
            }
        }
        $id = $this->repo->create(
            $userId,
            $catId,
            number_format((float) $body['amount'], 4, '.', ''),
            (string) $body['period_start'],
            (string) $body['period_end']
        );
        return $this->repo->findOwned($id, $userId);
    }

    public function update(int $userId, int $id, array $body): array
    {
        if (!$this->repo->findOwned($id, $userId)) {
            Response::error('Não encontrado', [], 404);
        }
        $fields = [];
        foreach (['amount', 'period_start', 'period_end', 'category_id'] as $f) {
            if (array_key_exists($f, $body)) {
                $fields[$f] = $body[$f];
            }
        }
        if (isset($fields['amount']) && !Validator::decimalString($fields['amount'])) {
            Response::error('Montante inválido', [], 422);
        }
        if (isset($fields['category_id']) && $fields['category_id'] !== null) {
            $cid = (int) $fields['category_id'];
            $c = $this->cat->findOwned($cid, $userId);
            if (!$c || $c['type'] !== 'expense') {
                Response::error('Categoria inválida', [], 422);
            }
            $fields['category_id'] = $cid;
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
        $b = $this->repo->findOwned($id, $userId);
        if (!$b) {
            Response::error('Não encontrado', [], 404);
        }
        return $b;
    }

    /** @return array<string,mixed> */
    public function progress(int $userId, int $id): array
    {
        $b = $this->repo->findOwned($id, $userId);
        if (!$b) {
            Response::error('Não encontrado', [], 404);
        }
        $catId = $b['category_id'] !== null ? (int) $b['category_id'] : null;
        $spent = $this->tx->sumExpenseForBudget($userId, $catId, $b['period_start'], $b['period_end']);
        $limit = (float) $b['amount'];
        $s = (float) $spent;
        $pct = $limit > 0 ? round($s / $limit * 100, 2) : 0;
        return [
            'budget' => $b,
            'spent' => $spent,
            'remaining' => (string) max(0, $limit - $s),
            'percent_used' => $pct,
        ];
    }
}
