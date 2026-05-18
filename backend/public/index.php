<?php
/**
 * SGFP — Front Controller (public/index.php)
 * All requests are routed through here.
 */

// Autoload core files
$base = dirname(__DIR__);

require_once $base . '/app/Config/Config.php';
require_once $base . '/app/Config/Database.php';
require_once $base . '/app/Core/Router.php';
require_once $base . '/app/Core/Request.php';
require_once $base . '/app/Core/Response.php';
require_once $base . '/app/Middleware/CorsMiddleware.php';
require_once $base . '/app/Middleware/AuthMiddleware.php';
require_once $base . '/app/Middleware/AdminMiddleware.php';

// Load env
Config::load($base . '/.env');

// CORS — always run first
CorsMiddleware::handle();

// Build request
$request = new Request();

// Build router and load routes
$router = new Router();
require_once $base . '/app/routes.php';

// Strip base path for when hosted in a subdirectory
$uri = $request->uri();
// Remove /backend/public prefix if present
$uri = preg_replace('#^.*/backend/public#', '', $uri);
$uri = preg_replace('#^.*/backend#', '', $uri);
$uri = ltrim($uri, '/');

// Resolve route
$route = $router->resolve($request->method(), $uri);

if (!$route) {
    Response::error('Endpoint não encontrado.', 404);
}

// Set route params on request
$request->setParams($route['params']);

// Run middleware
foreach ($route['middleware'] as $mw) {
    switch ($mw) {
        case 'auth':
            AuthMiddleware::handle($request);
            break;
        case 'admin':
            AdminMiddleware::handle($request);
            break;
    }
}

// Load controller and call action
$controllerName = $route['controller'];
$actionName = $route['action'];

$controllerFile = $base . '/app/Controllers/' . $controllerName . '.php';
if (!file_exists($controllerFile)) {
    Response::error("Controller '$controllerName' não encontrado.", 500);
}

require_once $controllerFile;

$controller = new $controllerName();

if (!method_exists($controller, $actionName)) {
    Response::error("Action '$actionName' não encontrada em '$controllerName'.", 500);
}

$controller->$actionName($request);
