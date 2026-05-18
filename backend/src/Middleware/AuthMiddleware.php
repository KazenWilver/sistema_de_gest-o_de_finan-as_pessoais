<?php

declare(strict_types=1);

namespace Sgfp\Middleware;

use Sgfp\Helpers\JwtHelper;

final class AuthMiddleware
{
    public static function bearerToken(): ?string
    {
        $h = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (stripos($h, 'Bearer ') === 0) {
            return trim(substr($h, 7));
        }
        return null;
    }

    /** @return array<string,mixed>|null */
    public static function verifyJwt(string $token): ?array
    {
        $secret = getenv('JWT_SECRET') ?: '';
        if (strlen($secret) < 16) {
            return null;
        }
        return JwtHelper::decode($token, $secret);
    }
}
