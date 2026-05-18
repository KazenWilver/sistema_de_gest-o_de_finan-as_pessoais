<?php
/**
 * SGFP — Router.php
 * URI pattern matching with :param support.
 */

class Router
{
    private array $routes = [];

    /**
     * Register a route
     */
    public function add(string $method, string $pattern, string $controller, string $action, array $middleware = []): void
    {
        $this->routes[] = [
            'method'     => strtoupper($method),
            'pattern'    => $pattern,
            'controller' => $controller,
            'action'     => $action,
            'middleware'  => $middleware,
        ];
    }

    // Shorthand methods
    public function get(string $pattern, string $controller, string $action, array $mw = []): void
    {
        $this->add('GET', $pattern, $controller, $action, $mw);
    }

    public function post(string $pattern, string $controller, string $action, array $mw = []): void
    {
        $this->add('POST', $pattern, $controller, $action, $mw);
    }

    public function put(string $pattern, string $controller, string $action, array $mw = []): void
    {
        $this->add('PUT', $pattern, $controller, $action, $mw);
    }

    public function delete(string $pattern, string $controller, string $action, array $mw = []): void
    {
        $this->add('DELETE', $pattern, $controller, $action, $mw);
    }

    /**
     * Resolve the current request to a route
     * Returns [controller, action, params, middleware] or null
     */
    public function resolve(string $method, string $uri): ?array
    {
        $method = strtoupper($method);

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) continue;

            $params = $this->matchPattern($route['pattern'], $uri);
            if ($params !== false) {
                return [
                    'controller' => $route['controller'],
                    'action'     => $route['action'],
                    'params'     => $params,
                    'middleware'  => $route['middleware'],
                ];
            }
        }

        return null;
    }

    /**
     * Match a URI against a pattern, extracting :params
     * Returns array of params on match, false otherwise
     */
    private function matchPattern(string $pattern, string $uri)
    {
        $patternParts = explode('/', trim($pattern, '/'));
        $uriParts     = explode('/', trim($uri, '/'));

        if (count($patternParts) !== count($uriParts)) return false;

        $params = [];

        for ($i = 0; $i < count($patternParts); $i++) {
            if (strpos($patternParts[$i], ':') === 0) {
                // Dynamic segment
                $paramName = substr($patternParts[$i], 1);
                $params[$paramName] = $uriParts[$i];
            } elseif ($patternParts[$i] !== $uriParts[$i]) {
                return false;
            }
        }

        return $params;
    }
}
