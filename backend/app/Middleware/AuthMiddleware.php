<?php
/**
 * SGFP — AuthMiddleware.php
 * Validates JWT, verifies user exists and is active.
 * Inspired by Crypto Monitor's AuthMiddleware pattern.
 */

require_once __DIR__ . '/../Helpers/JwtHelper.php';
require_once __DIR__ . '/../Repositories/UserRepository.php';
require_once __DIR__ . '/../Core/Response.php';

class AuthMiddleware
{
    /**
     * Validate the JWT token, verify user exists and is active.
     * Halts execution if token is invalid or user is inactive.
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

        // Verify user exists and is active (like Crypto Monitor)
        $userRepo = new UserRepository();
        $user = $userRepo->findById($payload['user_id']);

        if (!$user) {
            Response::error('Utilizador não encontrado.', 401);
        }

        if (isset($user['is_active']) && !$user['is_active']) {
            Response::error('Conta desativada. Contacte o administrador.', 403);
        }

        // Inject userId and role into request
        $request->setAttribute('userId', $user['id']);
        $request->setAttribute('userRole', $user['role'] ?? 'user');

        return $payload;
    }
}
