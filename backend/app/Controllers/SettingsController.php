<?php
/**
 * SGFP — SettingsController.php
 */
require_once __DIR__ . '/../Services/AuthService.php';
require_once __DIR__ . '/../Core/Response.php';

class SettingsController
{
    private AuthService $authService;

    public function __construct() { $this->authService = new AuthService(); }

    public function updateProfile($request): void
    {
        $userId = $request->param('userId');
        $user = $this->authService->updateProfile($userId, $request->body());
        Response::json($user, 200, 'Perfil atualizado.');
    }

    public function updateTheme($request): void
    {
        $userId = $request->param('userId');
        $theme = $request->input('theme', 'light');
        $user = $this->authService->updateProfile($userId, ['theme' => $theme]);
        Response::json($user, 200, 'Tema atualizado.');
    }

    public function updatePassword($request): void
    {
        $userId = $request->param('userId');
        $this->authService->updatePassword($userId, $request->body());
        Response::json(null, 200, 'Password alterada.');
    }
}
