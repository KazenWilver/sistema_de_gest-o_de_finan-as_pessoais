<?php

declare(strict_types=1);

namespace Sgfp\Helpers;

final class JwtHelper
{
    private static function b64urlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function b64urlDecode(string $data): string
    {
        $pad = 4 - (strlen($data) % 4);
        if ($pad < 4) {
            $data .= str_repeat('=', $pad);
        }
        return (string) base64_decode(strtr($data, '-_', '+/'), true);
    }

    public static function encode(array $payload, string $secret, int $ttlSeconds): string
    {
        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $now = time();
        $payload['iat'] = $now;
        $payload['exp'] = $now + $ttlSeconds;
        $segments = [
            self::b64urlEncode(json_encode($header, JSON_UNESCAPED_UNICODE)),
            self::b64urlEncode(json_encode($payload, JSON_UNESCAPED_UNICODE)),
        ];
        $signing = $segments[0] . '.' . $segments[1];
        $sig = hash_hmac('sha256', $signing, $secret, true);
        $segments[] = self::b64urlEncode($sig);
        return implode('.', $segments);
    }

    /** @return array<string,mixed>|null */
    public static function decode(string $jwt, string $secret): ?array
    {
        $parts = explode('.', $jwt);
        if (count($parts) !== 3) {
            return null;
        }
        [$h, $p, $s] = $parts;
        $signing = $h . '.' . $p;
        $expected = self::b64urlEncode(hash_hmac('sha256', $signing, $secret, true));
        if (!hash_equals($expected, $s)) {
            return null;
        }
        $payload = json_decode(self::b64urlDecode($p), true);
        if (!is_array($payload)) {
            return null;
        }
        if (isset($payload['exp']) && (int) $payload['exp'] < time()) {
            return null;
        }
        return $payload;
    }
}
