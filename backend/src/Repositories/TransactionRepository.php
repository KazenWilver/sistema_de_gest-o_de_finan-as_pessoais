<?php

declare(strict_types=1);

namespace Sgfp\Repositories;

use PDO;
use Sgfp\Config\Database;

final class TransactionRepository
{
    /**
     * @param array{type?:string,category_id?:int,categoryId?:int,from?:string,to?:string,page?:int,per_page?:int} $filters
     * @return array{rows:list<array<string,mixed>>,total:int}
     */
    public function search(int $userId, array $filters): array
    {
        $where = ['t.user_id = ?'];
        $params = [$userId];
        if (!empty($filters['type'])) {
            $where[] = 't.type = ?';
            $params[] = $filters['type'];
        }
        $cat = $filters['category_id'] ?? $filters['categoryId'] ?? null;
        if ($cat) {
            $where[] = 't.category_id = ?';
            $params[] = (int) $cat;
        }
        if (!empty($filters['from'])) {
            $where[] = 't.trans_date >= ?';
            $params[] = $filters['from'];
        }
        if (!empty($filters['to'])) {
            $where[] = 't.trans_date <= ?';
            $params[] = $filters['to'];
        }
        $sqlWhere = implode(' AND ', $where);
        $countSt = Database::pdo()->prepare("SELECT COUNT(*) AS c FROM transactions t WHERE {$sqlWhere}");
        $countSt->execute($params);
        $total = (int) ($countSt->fetch(PDO::FETCH_ASSOC)['c'] ?? 0);

        $page = max(1, (int) ($filters['page'] ?? 1));
        $per = min(100, max(1, (int) ($filters['per_page'] ?? 20)));
        $off = ($page - 1) * $per;

        $st = Database::pdo()->prepare(
            "SELECT t.*, c.name AS category_name, c.color AS category_color
             FROM transactions t
             JOIN categories c ON c.id = t.category_id
             WHERE {$sqlWhere}
             ORDER BY t.trans_date DESC, t.id DESC
             LIMIT {$per} OFFSET {$off}"
        );
        $st->execute($params);
        $rows = $st->fetchAll(PDO::FETCH_ASSOC);
        return ['rows' => $rows, 'total' => $total];
    }

    public function findOwned(int $id, int $userId): ?array
    {
        $st = Database::pdo()->prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ? LIMIT 1');
        $st->execute([$id, $userId]);
        $r = $st->fetch(PDO::FETCH_ASSOC);
        return $r ?: null;
    }

    public function create(
        int $userId,
        int $categoryId,
        string $type,
        string $amount,
        string $currencyCode,
        string $amountBase,
        ?string $description,
        string $transDate
    ): int {
        $st = Database::pdo()->prepare(
            'INSERT INTO transactions (user_id, category_id, type, amount, currency_code, amount_base, description, trans_date)
             VALUES (?,?,?,?,?,?,?,?)'
        );
        $st->execute([$userId, $categoryId, $type, $amount, $currencyCode, $amountBase, $description, $transDate]);
        return (int) Database::pdo()->lastInsertId();
    }

    public function update(int $id, int $userId, array $fields): bool
    {
        $allowed = ['category_id', 'type', 'amount', 'currency_code', 'amount_base', 'description', 'trans_date'];
        $sets = [];
        $vals = [];
        foreach ($allowed as $f) {
            if (array_key_exists($f, $fields)) {
                $sets[] = "$f = ?";
                $vals[] = $fields[$f];
            }
        }
        if ($sets === []) {
            return false;
        }
        $vals[] = $id;
        $vals[] = $userId;
        $sql = 'UPDATE transactions SET ' . implode(',', $sets) . ' WHERE id = ? AND user_id = ?';
        $st = Database::pdo()->prepare($sql);
        $st->execute($vals);
        return $st->rowCount() > 0;
    }

    public function delete(int $id, int $userId): bool
    {
        $st = Database::pdo()->prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?');
        $st->execute([$id, $userId]);
        return $st->rowCount() > 0;
    }

    /** @return array{income:string,expense:string,balance:string} */
    public function totalsBetween(int $userId, string $from, string $to): array
    {
        $st = Database::pdo()->prepare(
            "SELECT
                COALESCE(SUM(CASE WHEN type='income' THEN amount_base ELSE 0 END),0) AS inc,
                COALESCE(SUM(CASE WHEN type='expense' THEN amount_base ELSE 0 END),0) AS exp
             FROM transactions WHERE user_id = ? AND trans_date BETWEEN ? AND ?"
        );
        $st->execute([$userId, $from, $to]);
        $r = $st->fetch(PDO::FETCH_ASSOC);
        $inc = (string) $r['inc'];
        $exp = (string) $r['exp'];
        return [
            'income' => $inc,
            'expense' => $exp,
            'balance' => (string) ((float) $inc - (float) $exp),
        ];
    }

    /** @return list<array{category_id:int,name:string,type:string,total:string}> */
    public function sumByCategory(int $userId, string $from, string $to): array
    {
        $st = Database::pdo()->prepare(
            "SELECT c.id AS category_id, c.name, c.type,
                    SUM(t.amount_base) AS total
             FROM transactions t
             JOIN categories c ON c.id = t.category_id
             WHERE t.user_id = ? AND t.trans_date BETWEEN ? AND ?
             GROUP BY c.id, c.name, c.type
             ORDER BY total DESC"
        );
        $st->execute([$userId, $from, $to]);
        return $st->fetchAll(PDO::FETCH_ASSOC);
    }

    /** @return list<array{day:string,income:string,expense:string}> */
    public function dailyTrend(int $userId, string $from, string $to): array
    {
        $st = Database::pdo()->prepare(
            "SELECT trans_date AS day,
                    COALESCE(SUM(CASE WHEN type='income' THEN amount_base ELSE 0 END),0) AS income,
                    COALESCE(SUM(CASE WHEN type='expense' THEN amount_base ELSE 0 END),0) AS expense
             FROM transactions
             WHERE user_id = ? AND trans_date BETWEEN ? AND ?
             GROUP BY trans_date
             ORDER BY trans_date"
        );
        $st->execute([$userId, $from, $to]);
        return $st->fetchAll(PDO::FETCH_ASSOC);
    }

    /** @return list<array<string,mixed>> */
    public function listBetween(int $userId, string $from, string $to): array
    {
        $st = Database::pdo()->prepare(
            "SELECT t.*, c.name AS category_name
             FROM transactions t
             JOIN categories c ON c.id = t.category_id
             WHERE t.user_id = ? AND t.trans_date BETWEEN ? AND ?
             ORDER BY t.trans_date, t.id"
        );
        $st->execute([$userId, $from, $to]);
        return $st->fetchAll(PDO::FETCH_ASSOC);
    }

    public function sumExpenseForBudget(int $userId, ?int $categoryId, string $from, string $to): string
    {
        if ($categoryId === null) {
            $st = Database::pdo()->prepare(
                "SELECT COALESCE(SUM(amount_base),0) AS s FROM transactions
                 WHERE user_id = ? AND type='expense' AND trans_date BETWEEN ? AND ?"
            );
            $st->execute([$userId, $from, $to]);
        } else {
            $st = Database::pdo()->prepare(
                "SELECT COALESCE(SUM(amount_base),0) AS s FROM transactions
                 WHERE user_id = ? AND type='expense' AND category_id = ? AND trans_date BETWEEN ? AND ?"
            );
            $st->execute([$userId, $categoryId, $from, $to]);
        }
        $r = $st->fetch(PDO::FETCH_ASSOC);
        return (string) ($r['s'] ?? '0');
    }
}
