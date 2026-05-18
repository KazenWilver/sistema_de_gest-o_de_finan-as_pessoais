<?php

declare(strict_types=1);

namespace Sgfp\Helpers;

final class Response
{
    public static function success(mixed $data = null, string $message = ''): never
    {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
        }
        echo json_encode([
            'status' => 'success',
            'data' => $data,
            'message' => $message,
            'errors' => new \stdClass(),
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function error(string $message, array $errors = [], int $http = 400): never
    {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code($http);
        }
        echo json_encode([
            'status' => 'error',
            'data' => null,
            'message' => $message,
            'errors' => (object) $errors,
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
