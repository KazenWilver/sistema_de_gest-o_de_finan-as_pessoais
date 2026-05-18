<?php
/**
 * SGFP — AdminMiddleware.php
 * Verifies admin role after AuthMiddleware.
 */

require_once __DIR__ . '/../Core/Response.php';

class AdminMiddleware
{
    /**
     * Check if the authenticated user is an admin
     */
    public static function handle($request): void
    {
        $role = $request->param('userRole');

        if ($role !== 'admin') {
            Response::error('Acesso restrito a administradores.', 403);
        }
    }
}
