<?php
/**
 * SGFP — CorsMiddleware.php
 * Handles CORS headers for Angular dev server.
 */

require_once __DIR__ . '/../Config/Config.php';

class CorsMiddleware
{
    public static function handle(): void
    {
        $origin = Config::frontendUrl();

        header("Access-Control-Allow-Origin: $origin");
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');

        // Handle preflight requests
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
