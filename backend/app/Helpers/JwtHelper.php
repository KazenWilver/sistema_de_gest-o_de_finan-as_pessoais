<?php
/**
 * SGFP — JwtHelper.php
 * Manual HS256 JWT encode/decode implementation.
 */

require_once __DIR__ . '/../Config/Config.php';

class JwtHelper
{
    /**
     * Encode a payload into a JWT token
     */
    public static function encode(array $payload): string
    {
        $header = self::base64UrlEncode(json_encode([
            'typ' => 'JWT',
            'alg' => 'HS256'
        ]));

        // Add standard claims
        $payload['iat'] = time();
        $payload['exp'] = time() + Config::jwtExpiry();

        $payloadEncoded = self::base64UrlEncode(json_encode($payload));
        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payloadEncoded", Config::jwtSecret(), true)
        );

        return "$header.$payloadEncoded.$signature";
    }

    /**
     * Decode and validate a JWT token
     * Returns the payload array or null if invalid
     */
    public static function decode(string $token): ?array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) return null;

        [$header, $payload, $signature] = $parts;

        // Verify signature
        $expectedSignature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", Config::jwtSecret(), true)
        );

        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }

        $data = json_decode(self::base64UrlDecode($payload), true);
        if (!$data) return null;

        // Check expiration
        if (isset($data['exp']) && $data['exp'] < time()) {
            return null;
        }

        return $data;
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
