<?php

declare(strict_types=1);

namespace Sgfp;

use Sgfp\Controllers\AdminController;
use Sgfp\Controllers\AuthController;
use Sgfp\Controllers\BudgetController;
use Sgfp\Controllers\CategoryController;
use Sgfp\Controllers\CurrencyController;
use Sgfp\Controllers\DashboardController;
use Sgfp\Controllers\ExportController;
use Sgfp\Controllers\GoalController;
use Sgfp\Controllers\ReportController;
use Sgfp\Controllers\SettingsController;
use Sgfp\Controllers\TransactionController;

final class Router
{
    /** @var list<array{method:string,pattern:string,handler:array{0:class-string,1:string},auth:bool,admin:bool}> */
    private array $routes = [];

    public function __construct(
        private string $method,
        private string $uri,
        private array $body
    ) {
        $this->registerRoutes();
    }

    private function registerRoutes(): void
    {
        $add = function (string $m, string $path, array $h, bool $auth, bool $admin = false): void {
            $pattern = '#^' . preg_replace('#\{([a-z]+)\}#', '(?P<$1>[^/]+)', $path) . '$#i';
            $this->routes[] = ['method' => $m, 'pattern' => $pattern, 'handler' => $h, 'auth' => $auth, 'admin' => $admin];
        };

        $add('POST', '/auth/register', [AuthController::class, 'register'], false);
        $add('POST', '/auth/login', [AuthController::class, 'login'], false);
        $add('POST', '/auth/logout', [AuthController::class, 'logout'], true);
        $add('POST', '/auth/forgot', [AuthController::class, 'forgot'], false);
        $add('POST', '/auth/reset', [AuthController::class, 'reset'], false);
        $add('GET', '/auth/me', [AuthController::class, 'me'], true);

        $add('GET', '/transactions', [TransactionController::class, 'list'], true);
        $add('POST', '/transactions', [TransactionController::class, 'create'], true);
        $add('GET', '/transactions/{id}', [TransactionController::class, 'show'], true);
        $add('PUT', '/transactions/{id}', [TransactionController::class, 'update'], true);
        $add('PATCH', '/transactions/{id}', [TransactionController::class, 'update'], true);
        $add('DELETE', '/transactions/{id}', [TransactionController::class, 'delete'], true);

        $add('GET', '/categories', [CategoryController::class, 'list'], true);
        $add('POST', '/categories', [CategoryController::class, 'create'], true);
        $add('GET', '/categories/{id}', [CategoryController::class, 'show'], true);
        $add('PUT', '/categories/{id}', [CategoryController::class, 'update'], true);
        $add('PATCH', '/categories/{id}', [CategoryController::class, 'update'], true);
        $add('DELETE', '/categories/{id}', [CategoryController::class, 'delete'], true);

        $add('GET', '/budgets', [BudgetController::class, 'list'], true);
        $add('POST', '/budgets', [BudgetController::class, 'create'], true);
        $add('GET', '/budgets/{id}', [BudgetController::class, 'show'], true);
        $add('GET', '/budgets/{id}/progress', [BudgetController::class, 'progress'], true);
        $add('PUT', '/budgets/{id}', [BudgetController::class, 'update'], true);
        $add('PATCH', '/budgets/{id}', [BudgetController::class, 'update'], true);
        $add('DELETE', '/budgets/{id}', [BudgetController::class, 'delete'], true);

        $add('GET', '/goals', [GoalController::class, 'list'], true);
        $add('POST', '/goals', [GoalController::class, 'create'], true);
        $add('GET', '/goals/{id}', [GoalController::class, 'show'], true);
        $add('PUT', '/goals/{id}', [GoalController::class, 'update'], true);
        $add('PATCH', '/goals/{id}', [GoalController::class, 'update'], true);
        $add('DELETE', '/goals/{id}', [GoalController::class, 'delete'], true);
        $add('POST', '/goals/{id}/contribute', [GoalController::class, 'contribute'], true);

        $add('GET', '/reports/summary', [ReportController::class, 'summary'], true);
        $add('GET', '/reports/by-category', [ReportController::class, 'byCategory'], true);
        $add('GET', '/reports/trend', [ReportController::class, 'trend'], true);

        $add('GET', '/export/csv', [ExportController::class, 'csv'], true);
        $add('GET', '/export/pdf', [ExportController::class, 'pdf'], true);

        $add('GET', '/currencies/rates', [CurrencyController::class, 'rates'], true);

        $add('GET', '/dashboard', [DashboardController::class, 'index'], true);

        $add('PATCH', '/settings/profile', [SettingsController::class, 'profile'], true);
        $add('PATCH', '/settings/security', [SettingsController::class, 'security'], true);

        $add('GET', '/admin/users', [AdminController::class, 'users'], true, true);
        $add('GET', '/admin/stats', [AdminController::class, 'stats'], true, true);
    }

    /** @return null|array{0:array{0:class-string,1:string},1:bool,2:bool,3:array<string,string>} */
    public function dispatch(): ?array
    {
        foreach ($this->routes as $r) {
            if (strtoupper($r['method']) !== strtoupper($this->method)) {
                continue;
            }
            if (preg_match($r['pattern'], $this->uri, $m)) {
                $params = array_filter($m, 'is_string', ARRAY_FILTER_USE_KEY);
                return [$r['handler'], $r['auth'], $r['admin'], $params];
            }
        }
        return null;
    }
}
