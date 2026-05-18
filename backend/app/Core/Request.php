<?php
/**
 * SGFP — Request.php
 * HTTP request wrapper.
 */

class Request
{
    private string $method;
    private string $uri;
    private array  $body;
    private array  $query;
    private array  $params;

    public function __construct()
    {
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
        $this->uri    = rtrim($this->uri, '/');
        $this->query  = $_GET;
        $this->params = [];

        // Parse JSON body
        $rawBody = file_get_contents('php://input');
        $this->body = json_decode($rawBody, true) ?? [];
    }

    public function method(): string  { return $this->method; }
    public function uri(): string     { return $this->uri; }
    public function body(): array     { return $this->body; }
    public function query(): array    { return $this->query; }
    public function params(): array   { return $this->params; }

    /**
     * Get a specific body field
     */
    public function input(string $key, $default = null)
    {
        return $this->body[$key] ?? $default;
    }

    /**
     * Get a specific query parameter
     */
    public function queryParam(string $key, $default = null)
    {
        return $this->query[$key] ?? $default;
    }

    /**
     * Get a route parameter (set by Router)
     */
    public function param(string $key, $default = null)
    {
        return $this->params[$key] ?? $default;
    }

    /**
     * Set route parameters (called by Router)
     */
    public function setParams(array $params): void
    {
        $this->params = $params;
    }

    /**
     * Set a custom attribute (e.g., userId from AuthMiddleware)
     */
    public function setAttribute(string $key, $value): void
    {
        $this->params[$key] = $value;
    }

    /**
     * Get authorization header
     */
    public function bearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION']
            ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
            ?? null;

        if ($header && preg_match('/Bearer\s+(.+)$/i', $header, $matches)) {
            return $matches[1];
        }

        return null;
    }
}
