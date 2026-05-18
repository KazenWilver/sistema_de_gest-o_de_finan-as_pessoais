<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/bootstrap.php';

use Sgfp\Config\Database;
use Sgfp\Helpers\CorsMiddleware;
use Sgfp\Helpers\JsonRequest;
use Sgfp\Helpers\Response;
use Sgfp\Middleware\AdminMiddleware;
use Sgfp\Middleware\AuthMiddleware;
use Sgfp\Router;

header('X-Content-Type-Options: nosniff');

CorsMiddleware::handle();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    Database::connect();
} catch (Throwable $e) {
    Response::error('Falha de ligação à base de dados', [], 503);
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/';

$scriptDir = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '')), '/');
if ($scriptDir !== '' && $scriptDir !== '/' && str_starts_with($uri, $scriptDir)) {
    $uri = substr($uri, strlen($scriptDir)) ?: '/';
}
$uri = '/' . trim($uri, '/');

$raw = file_get_contents('php://input') ?: '';
$body = JsonRequest::decode($raw);

$router = new Router($method, $uri, $body);
$result = $router->dispatch();

if ($result === null) {
    Response::error('Recurso não encontrado', [], 404);
}

[$handler, $needsAuth, $needsAdmin, $params] = $result;

$userId = null;
$userRole = null;

if ($needsAuth || $needsAdmin) {
    $tok = AuthMiddleware::bearerToken();
    if ($tok === null) {
        Response::error('Não autenticado', [], 401);
    }
    $payload = AuthMiddleware::verifyJwt($tok);
    if ($payload === null) {
        Response::error('Token inválido ou expirado', [], 401);
    }
    $userId = (int) $payload['sub'];
    $userRole = (string) ($payload['role'] ?? 'user');
}

if ($needsAdmin && $userRole !== 'admin') {
    Response::error('Acesso reservado a administradores', [], 403);
}

[$class, $action] = $handler;
$controller = new $class();
$controller->$action($params, $userId, $userRole, $body);
