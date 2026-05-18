<?php
/**
 * SGFP — AuthMiddleware.php
 * Validates JWT and injects userId into the request.
 */

require_once __DIR__ . '/../Helpers/JwtHelper.php';
require_once __DIR__ . '/../Core/Response.php';

class AuthMiddleware
{
    /**
     * Validate the JWT token and return the decoded payload
     * Halts execution if token is invalid
     */
    public static function handle($request): array
    {
        $token = $request->bearerToken();

        if (!$token) {
            Response::error('Token de autenticação não fornecido.', 401);
        }

        $payload = JwtHelper::decode($token);

        if (!$payload || !isset($payload['user_id'])) {
            Response::error('Token inválido ou expirado.', 401);
        }

        // Inject userId into request
        $request->setAttribute('userId', $payload['user_id']);
        $request->setAttribute('userRole', $payload['role'] ?? 'user');

        return $payload;
    }
}
