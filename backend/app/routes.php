<?php
/**
 * SGFP — routes.php
 * All API route definitions.
 */

// Auth (public)
$router->post('api/auth/register',        'AuthController',      'register');
$router->post('api/auth/login',           'AuthController',      'login');
$router->post('api/auth/forgot-password', 'AuthController',      'forgotPassword');
$router->post('api/auth/reset-password',  'AuthController',      'resetPassword');

// Auth (protected)
$router->get ('api/auth/me',              'AuthController',      'me',              ['auth']);
$router->post('api/auth/logout',          'AuthController',      'logout',          ['auth']);
$router->put ('api/auth/profile',         'AuthController',      'updateProfile',   ['auth']);
$router->put ('api/auth/password',        'AuthController',      'updatePassword',  ['auth']);

// Accounts
$router->get ('api/accounts',             'AccountController',   'index',           ['auth']);
$router->post('api/accounts',             'AccountController',   'store',           ['auth']);
$router->put ('api/accounts/:id',         'AccountController',   'update',          ['auth']);
$router->delete('api/accounts/:id',       'AccountController',   'destroy',         ['auth']);

// Categories
$router->get ('api/categories',           'CategoryController',  'index',           ['auth']);
$router->post('api/categories',           'CategoryController',  'store',           ['auth']);
$router->put ('api/categories/:id',       'CategoryController',  'update',          ['auth']);
$router->delete('api/categories/:id',     'CategoryController',  'destroy',         ['auth']);

// Transactions
$router->get ('api/transactions',         'TransactionController', 'index',         ['auth']);
$router->get ('api/transactions/:id',     'TransactionController', 'show',          ['auth']);
$router->post('api/transactions',         'TransactionController', 'store',         ['auth']);
$router->put ('api/transactions/:id',     'TransactionController', 'update',        ['auth']);
$router->delete('api/transactions/:id',   'TransactionController', 'destroy',       ['auth']);

// Budgets
$router->get ('api/budgets',             'BudgetController',     'index',           ['auth']);
$router->get ('api/budgets/progress',    'BudgetController',     'progress',        ['auth']);
$router->post('api/budgets',             'BudgetController',     'store',           ['auth']);
$router->put ('api/budgets/:id',         'BudgetController',     'update',          ['auth']);
$router->delete('api/budgets/:id',       'BudgetController',     'destroy',         ['auth']);

// Dashboard
$router->get ('api/dashboard/summary',   'DashboardController',  'summary',         ['auth']);
$router->get ('api/dashboard/recent',    'DashboardController',  'recentTransactions', ['auth']);
$router->get ('api/dashboard/charts',    'DashboardController',  'charts',          ['auth']);

// Reports
$router->get ('api/reports/summary',     'ReportController',     'summary',         ['auth']);
$router->get ('api/reports/category',    'ReportController',     'byCategory',      ['auth']);
$router->get ('api/reports/trend',       'ReportController',     'trend',           ['auth']);

// Export
$router->get ('api/export/csv',          'ExportController',     'exportCsv',       ['auth']);
$router->get ('api/export/pdf',          'ExportController',     'exportPdf',       ['auth']);

// Currency
$router->get ('api/currency/rates',      'CurrencyController',   'rates',           ['auth']);

// Settings
$router->put ('api/settings/profile',    'SettingsController',   'updateProfile',   ['auth']);
$router->put ('api/settings/theme',      'SettingsController',   'updateTheme',     ['auth']);
$router->put ('api/settings/password',   'SettingsController',   'updatePassword',  ['auth']);

// Admin
$router->get ('api/admin/users',         'AdminController',      'users',           ['auth', 'admin']);
$router->get ('api/admin/stats',         'AdminController',      'stats',           ['auth', 'admin']);
