<?php

declare(strict_types=1);

$root = dirname(__DIR__);
$backendRoot = __DIR__;

if (file_exists($backendRoot . '/.env')) {
    $lines = file($backendRoot . '/.env', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#')) {
            continue;
        }
        if (!str_contains($line, '=')) {
            continue;
        }
        [$k, $v] = explode('=', $line, 2);
        $k = trim($k);
        $v = trim($v, " \t\"'");
        if ($k !== '' && getenv($k) === false) {
            putenv("$k=$v");
            $_ENV[$k] = $v;
        }
    }
}

spl_autoload_register(static function (string $class): void {
    $prefix = 'Sgfp\\';
    $base = __DIR__ . '/src/';
    if (strncmp($prefix, $class, strlen($prefix)) !== 0) {
        return;
    }
    $rel = substr($class, strlen($prefix));
    $file = $base . str_replace('\\', '/', $rel) . '.php';
    if (is_file($file)) {
        require_once $file;
    }
});

set_exception_handler(static function (Throwable $e): void {
    if (!headers_sent()) {
        header('Content-Type: application/json; charset=utf-8');
        http_response_code(500);
    }
    $msg = getenv('APP_ENV') === 'development' ? $e->getMessage() : 'Erro interno';
    echo json_encode([
        'status' => 'error',
        'data' => null,
        'message' => $msg,
        'errors' => [],
    ], JSON_UNESCAPED_UNICODE);
});
