<?php

declare(strict_types=1);

namespace Sgfp\Helpers;

final class CorsMiddleware
{
    public static function handle(): void
    {
        $allowed = getenv('CORS_ORIGIN') ?: '*';
        $wildcard = $allowed === '*' || $allowed === '';

        if (str_contains($allowed, ',')) {
            $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
            $list = array_map('trim', explode(',', $allowed));
            if ($origin !== '' && in_array($origin, $list, true)) {
                header('Access-Control-Allow-Origin: ' . $origin);
                header('Access-Control-Allow-Credentials: true');
            }
        } else {
            header('Access-Control-Allow-Origin: ' . ($wildcard ? '*' : $allowed));
            if (!$wildcard) {
                header('Access-Control-Allow-Credentials: true');
            }
        }
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
    }
}
