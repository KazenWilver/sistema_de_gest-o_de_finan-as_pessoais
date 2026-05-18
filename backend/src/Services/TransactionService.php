<?php

declare(strict_types=1);

namespace Sgfp\Services;

use Sgfp\Helpers\Response;
use Sgfp\Helpers\Validator;
use Sgfp\Repositories\BudgetRepository;
use Sgfp\Repositories\CategoryRepository;
use Sgfp\Repositories\TransactionRepository;
use Sgfp\Repositories\UserRepository;

final class TransactionService
{
    public function __construct(
        private TransactionRepository $tx = new TransactionRepository(),
        private CategoryRepository $cat = new CategoryRepository(),
        private UserRepository $users = new UserRepository(),
        private BudgetRepository $budgets = new BudgetRepository(),
        private CurrencyService $fx = new CurrencyService()
    ) {
    }

    public function get(int $userId, int $id): array
    {
        $row = $this->tx->findOwned($id, $userId);
        if (!$row) {
            Response::error('Não encontrada', [], 404);
        }
        return $row;
    }

    /** @return array{rows:list<array<string,mixed>>,total:int,meta?:array<string,mixed>} */
    public function list(int $userId, array $q): array
    {
        $filters = [
            'type' => $q['type'] ?? null,
            'category_id' => isset($q['category_id']) ? (int) $q['category_id'] : (isset($q['categoryId']) ? (int) $q['categoryId'] : null),
            'from' => $q['from'] ?? null,
            'to' => $q['to'] ?? null,
            'page' => isset($q['page']) ? (int) $q['page'] : 1,
            'per_page' => isset($q['per_page']) ? (int) $q['per_page'] : 20,
        ];
        return $this->tx->search($userId, $filters);
    }

    public function create(int $userId, array $body): array
    {
        $miss = Validator::requireFields($body, ['category_id', 'type', 'amount', 'currency_code', 'trans_date']);
        if ($miss !== []) {
            Response::error('Validação falhou', $miss, 422);
        }
        if (!Validator::inList($body['type'], ['income', 'expense'])) {
            Response::error('Tipo inválido', ['type' => 'income|expense'], 422);
        }
        if (!Validator::decimalString($body['amount'])) {
            Response::error('Montante inválido', ['amount' => 'Numérico'], 422);
        }
        $cc = strtoupper((string) $body['currency_code']);
        if (!preg_match('/^[A-Z]{3}$/', $cc)) {
            Response::error('Moeda inválida', ['currency_code' => 'ISO 4217'], 422);
        }
        if (!Validator::dateYmd((string) $body['trans_date'])) {
            Response::error('Data inválida', ['trans_date' => 'YYYY-MM-DD'], 422);
        }
        $cid = (int) $body['category_id'];
        $c = $this->cat->findOwned($cid, $userId);
        if (!$c || $c['type'] !== $body['type']) {
            Response::error('Categoria inválida para o tipo', [], 422);
        }
        $u = $this->users->findById($userId);
        $base = strtoupper($u['base_currency']);
        $amountBase = $this->fx->toBaseAmount((string) $body['amount'], $cc, $base);
        $desc = $body['description'] ?? null;
        $id = $this->tx->create(
            $userId,
            $cid,
            (string) $body['type'],
            number_format((float) $body['amount'], 4, '.', ''),
            $cc,
            $amountBase,
            $desc ? substr((string) $desc, 0, 500) : null,
            (string) $body['trans_date']
        );
        $row = $this->tx->findOwned($id, $userId);
        $warn = $this->budgetWarnings($userId, (string) $body['type'], $cid, (string) $body['trans_date']);
        return ['transaction' => $row, 'warnings' => $warn];
    }

    public function update(int $userId, int $id, array $body): array
    {
        $cur = $this->tx->findOwned($id, $userId);
        if (!$cur) {
            Response::error('Transação não encontrada', [], 404);
        }
        $fields = [];
        if (isset($body['category_id'])) {
            $cid = (int) $body['category_id'];
            $type = $body['type'] ?? $cur['type'];
            $c = $this->cat->findOwned($cid, $userId);
            if (!$c || $c['type'] !== $type) {
                Response::error('Categoria inválida', [], 422);
            }
            $fields['category_id'] = $cid;
        }
        if (isset($body['type'])) {
            if (!Validator::inList($body['type'], ['income', 'expense'])) {
                Response::error('Tipo inválido', [], 422);
            }
            $fields['type'] = $body['type'];
        }
        if (isset($body['amount'])) {
            if (!Validator::decimalString($body['amount'])) {
                Response::error('Montante inválido', [], 422);
            }
            $fields['amount'] = number_format((float) $body['amount'], 4, '.', '');
        }
        if (isset($body['currency_code'])) {
            $cc = strtoupper((string) $body['currency_code']);
            if (!preg_match('/^[A-Z]{3}$/', $cc)) {
                Response::error('Moeda inválida', [], 422);
            }
            $fields['currency_code'] = $cc;
        }
        if (isset($body['trans_date'])) {
            if (!Validator::dateYmd((string) $body['trans_date'])) {
                Response::error('Data inválida', [], 422);
            }
            $fields['trans_date'] = $body['trans_date'];
        }
        if (array_key_exists('description', $body)) {
            $fields['description'] = $body['description'] ? substr((string) $body['description'], 0, 500) : null;
        }
        $merged = array_merge($cur, $fields);
        $u = $this->users->findById($userId);
        $base = strtoupper($u['base_currency']);
        $amountBase = $this->fx->toBaseAmount(
            (string) $merged['amount'],
            strtoupper((string) $merged['currency_code']),
            $base
        );
        $fields['amount_base'] = $amountBase;
        if (!$this->tx->update($id, $userId, $fields)) {
            Response::error('Nada para atualizar', [], 400);
        }
        return ['transaction' => $this->tx->findOwned($id, $userId)];
    }

    public function delete(int $userId, int $id): void
    {
        if (!$this->tx->delete($id, $userId)) {
            Response::error('Não encontrada', [], 404);
        }
    }

    /** @return list<string> */
    private function budgetWarnings(int $userId, string $type, int $categoryId, string $day): array
    {
        if ($type !== 'expense') {
            return [];
        }
        $list = $this->budgets->listByUser($userId);
        $warnings = [];
        foreach ($list as $b) {
            if ($day < $b['period_start'] || $day > $b['period_end']) {
                continue;
            }
            $catId = $b['category_id'] !== null ? (int) $b['category_id'] : null;
            if ($catId !== null && $catId !== $categoryId) {
                continue;
            }
            $spent = (float) $this->tx->sumExpenseForBudget($userId, $catId, $b['period_start'], $b['period_end']);
            $limit = (float) $b['amount'];
            if ($limit <= 0) {
                continue;
            }
            $pct = $spent / $limit * 100;
            if ($pct >= 80) {
                $warnings[] = 'Orçamento ' . ($b['category_name'] ?? 'global') . ' em ' . round($pct, 1) . '% do limite';
            }
        }
        return $warnings;
    }
}
