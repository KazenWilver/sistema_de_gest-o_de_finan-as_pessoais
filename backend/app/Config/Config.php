<?php
/**
 * SGFP — Config.php
 * Loads environment variables and provides configuration constants.
 */

class Config
{
    private static array $env = [];
    private static bool $loaded = false;

    /**
     * Load .env file into memory
     */
    public static function load(string $path = null): void
    {
        if (self::$loaded) return;

        $path = $path ?? dirname(__DIR__, 2) . '/.env';

        if (!file_exists($path)) {
            throw new RuntimeException('.env file not found at: ' . $path);
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || $line[0] === '#') continue;

            $parts = explode('=', $line, 2);
            if (count($parts) !== 2) continue;

            $key = trim($parts[0]);
            $value = trim($parts[1]);

            self::$env[$key] = $value;
            if (!isset($_ENV[$key])) {
                $_ENV[$key] = $value;
            }
        }

        self::$loaded = true;
    }

    /**
     * Get an environment variable
     */
    public static function get(string $key, $default = null)
    {
        if (!self::$loaded) self::load();
        return self::$env[$key] ?? $_ENV[$key] ?? $default;
    }

    // -- Database shortcuts --
    public static function dbHost(): string   { return self::get('DB_HOST', 'localhost'); }
    public static function dbPort(): string   { return self::get('DB_PORT', '3306'); }
    public static function dbName(): string   { return self::get('DB_NAME', 'sgfp_db'); }
    public static function dbUser(): string   { return self::get('DB_USER', 'root'); }
    public static function dbPass(): string   { return self::get('DB_PASS', ''); }

    // -- JWT shortcuts --
    public static function jwtSecret(): string { return self::get('JWT_SECRET', 'default_secret'); }
    public static function jwtExpiry(): int    { return (int) self::get('JWT_EXPIRY', 604800); }

    // -- Other --
    public static function frontendUrl(): string { return self::get('FRONTEND_URL', 'http://localhost:4200'); }
    public static function claudeApiKey(): string { return self::get('CLAUDE_API_KEY', ''); }
}
