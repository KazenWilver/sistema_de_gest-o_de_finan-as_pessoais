<?php
/**
 * SGFP — AuthController.php
 * Handles authentication endpoints.
 */

require_once __DIR__ . '/../Services/AuthService.php';
require_once __DIR__ . '/../Core/Response.php';

class AuthController
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    public function register($request): void
    {
        $result = $this->authService->register($request->body());
        Response::json($result, 201, 'Registo realizado com sucesso.');
    }

    public function login($request): void
    {
        $result = $this->authService->login($request->body());
        Response::json($result, 200, 'Login realizado com sucesso.');
    }

    public function logout($request): void
    {
        // JWT is stateless — logout is handled on frontend
        Response::json(null, 200, 'Logout realizado com sucesso.');
    }

    public function forgotPassword($request): void
    {
        $token = $this->authService->forgotPassword($request->body());
        Response::json(['reset_token' => $token], 200, 'Instruções de recuperação enviadas.');
    }

    public function resetPassword($request): void
    {
        $this->authService->resetPassword($request->body());
        Response::json(null, 200, 'Password alterada com sucesso.');
    }

    public function me($request): void
    {
        $userId = $request->param('userId');
        $user = $this->authService->me($userId);
        Response::json($user);
    }

    public function updateProfile($request): void
    {
        $userId = $request->param('userId');
        $user = $this->authService->updateProfile($userId, $request->body());
        Response::json($user, 200, 'Perfil atualizado com sucesso.');
    }

    public function updatePassword($request): void
    {
        $userId = $request->param('userId');
        $this->authService->updatePassword($userId, $request->body());
        Response::json(null, 200, 'Password alterada com sucesso.');
    }
}
