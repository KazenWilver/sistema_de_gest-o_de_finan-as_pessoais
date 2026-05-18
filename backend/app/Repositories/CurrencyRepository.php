<?php
/**
 * SGFP — CurrencyRepository.php
 */

require_once __DIR__ . '/../Config/Database.php';

class CurrencyRepository
{
    private PDO $db;

    public function __construct() { $this->db = Database::getInstance(); }

    public function getRate(string $base, string $target): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM currency_rates WHERE base_currency = :base AND target_currency = :target
             AND fetched_at > DATE_SUB(NOW(), INTERVAL 6 HOUR)'
        );
        $stmt->execute(['base' => $base, 'target' => $target]);
        return $stmt->fetch() ?: null;
    }

    public function upsertRate(string $base, string $target, float $rate): void
    {
        $stmt = $this->db->prepare(
            'INSERT INTO currency_rates (base_currency, target_currency, rate, fetched_at)
             VALUES (:base, :target, :rate, NOW())
             ON DUPLICATE KEY UPDATE rate = :rate2, fetched_at = NOW()'
        );
        $stmt->execute(['base' => $base, 'target' => $target, 'rate' => $rate, 'rate2' => $rate]);
    }
}
