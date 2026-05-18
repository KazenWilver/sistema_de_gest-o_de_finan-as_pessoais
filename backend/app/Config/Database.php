<?php
/**
 * SGFP — Database.php
 * PDO Singleton — one connection per request.
 */

require_once __DIR__ . '/Config.php';

class Database
{
    private static ?PDO $instance = null;

    /**
     * Get the single PDO instance
     */
    public static function getInstance(): PDO
    {
        if (self::$instance === null) {
            Config::load();

            $dsn = sprintf(
                'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
                Config::dbHost(),
                Config::dbPort(),
                Config::dbName()
            );

            try {
                self::$instance = new PDO($dsn, Config::dbUser(), Config::dbPass(), [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE  => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES    => false,
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode([
                    'status'  => 'error',
                    'message' => 'Database connection failed: ' . $e->getMessage()
                ]);
                exit;
            }
        }

        return self::$instance;
    }

    // Prevent cloning and deserialization
    private function __construct() {}
    private function __clone() {}
    public function __wakeup() { throw new RuntimeException('Cannot deserialize singleton'); }
}
