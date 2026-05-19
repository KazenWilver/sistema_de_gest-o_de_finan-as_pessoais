<?php
/**
 * SGFP — AuthService.php
 * Business logic for authentication.
 */

require_once __DIR__ . '/../Repositories/UserRepository.php';
require_once __DIR__ . '/../Helpers/JwtHelper.php';
require_once __DIR__ . '/../Helpers/Validator.php';
require_once __DIR__ . '/../Core/Response.php';

class AuthService
{
    private UserRepository $userRepo;

    public function __construct()
    {
        $this->userRepo = new UserRepository();
    }

    /**
     * Register a new user
     */
    public function register(array $data): array
    {
        $validator = new Validator();
        if (!$validator->validate($data, [
            'name'     => 'required|min:2|max:100',
            'email'    => 'required|email',
            'password' => 'required|min:6',
        ])) {
            Response::error('Dados inválidos.', 422, $validator->errors());
        }

        // Check if email exists
        if ($this->userRepo->findByEmail($data['email'])) {
            Response::error('Este email já está registado.', 409);
        }

        // Create user
        $userId = $this->userRepo->create([
            'name'          => $data['name'],
            'email'         => $data['email'],
            'password_hash' => password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 10]),
        ]);

        // Create default categories
        $this->createDefaultCategories($userId);

        // Create default account
        $this->createDefaultAccount($userId);

        $user = $this->userRepo->findById($userId);
        $token = JwtHelper::encode([
            'user_id' => $userId,
            'role'    => $user['role'],
        ]);

        return [
            'user'  => $this->sanitizeUser($user),
            'token' => $token,
        ];
    }

    /**
     * Login user
     */
    public function login(array $data): array
    {
        $validator = new Validator();
        if (!$validator->validate($data, [
            'email'    => 'required|email',
            'password' => 'required',
        ])) {
            Response::error('Dados inválidos.', 422, $validator->errors());
        }

        $user = $this->userRepo->findByEmail($data['email']);
        if (!$user || !password_verify($data['password'], $user['password_hash'])) {
            Response::error('Email ou password incorretos.', 401);
        }

        $token = JwtHelper::encode([
            'user_id' => $user['id'],
            'role'    => $user['role'],
        ]);

        return [
            'user'  => $this->sanitizeUser($user),
            'token' => $token,
        ];
    }

    /**
     * Get current user profile
     */
    public function me(int $userId): array
    {
        $user = $this->userRepo->findById($userId);
        if (!$user) {
            Response::error('Utilizador não encontrado.', 404);
        }
        return $this->sanitizeUser($user);
    }

    /**
     * Update user profile
     */
    public function updateProfile(int $userId, array $data): array
    {
        $this->userRepo->update($userId, $data);
        $user = $this->userRepo->findById($userId);
        return $this->sanitizeUser($user);
    }

    /**
     * Update password
     */
    public function updatePassword(int $userId, array $data): void
    {
        $validator = new Validator();
        if (!$validator->validate($data, [
            'current_password' => 'required',
            'new_password'     => 'required|min:6',
        ])) {
            Response::error('Dados inválidos.', 422, $validator->errors());
        }

        $user = $this->userRepo->findById($userId);
        if (!password_verify($data['current_password'], $user['password_hash'])) {
            Response::error('Password actual incorrecta.', 401);
        }

        $this->userRepo->updatePassword($userId, password_hash($data['new_password'], PASSWORD_BCRYPT, ['cost' => 10]));
    }

    /**
     * Request password reset (forgot password)
     */
    public function forgotPassword(array $data): string
    {
        $validator = new Validator();
        if (!$validator->validate($data, ['email' => 'required|email'])) {
            Response::error('Email inválido.', 422, $validator->errors());
        }

        $user = $this->userRepo->findByEmail($data['email']);
        if (!$user) {
            // Don't reveal if email exists
            return 'Se o email existir, receberá instruções de recuperação.';
        }

        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

        $this->userRepo->createResetToken($user['id'], $token, $expiresAt);

        // In academic context: return token directly (no real email sending)
        return $token;
    }

    /**
     * Reset password using token
     */
    public function resetPassword(array $data): void
    {
        $validator = new Validator();
        if (!$validator->validate($data, [
            'token'    => 'required',
            'password' => 'required|min:6',
        ])) {
            Response::error('Dados inválidos.', 422, $validator->errors());
        }

        $resetRecord = $this->userRepo->findResetToken($data['token']);
        if (!$resetRecord) {
            Response::error('Token inválido ou expirado.', 400);
        }

        $this->userRepo->updatePassword(
            $resetRecord['user_id'],
            password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 10])
        );
        $this->userRepo->markTokenUsed($resetRecord['id']);
    }

    /**
     * Remove sensitive fields from user data
     */
    private function sanitizeUser(array $user): array
    {
        unset($user['password_hash']);
        return $user;
    }

    /**
     * Create default categories for a new user
     */
    private function createDefaultCategories(int $userId): void
    {
        $db = Database::getInstance();
        $categories = [
            ['Salário',       'income',  'wallet',      '#10b981'],
            ['Freelance',     'income',  'laptop',      '#06b6d4'],
            ['Investimentos', 'income',  'trending-up', '#8b5cf6'],
            ['Outros',        'income',  'circle-dots', '#6b7280'],
            ['Alimentação',   'expense', 'utensils',    '#f59e0b'],
            ['Transporte',    'expense', 'car',         '#ef4444'],
            ['Saúde',         'expense', 'heart-pulse', '#8b5cf6'],
            ['Educação',      'expense', 'book-open',   '#3b82f6'],
            ['Lazer',         'expense', 'gamepad-2',   '#ec4899'],
            ['Habitação',     'expense', 'home',        '#14b8a6'],
            ['Outros',        'expense', 'circle-dots', '#6b7280'],
        ];

        $stmt = $db->prepare(
            'INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES (?, ?, ?, ?, ?, 1)'
        );

        foreach ($categories as $cat) {
            $stmt->execute([$userId, $cat[0], $cat[1], $cat[2], $cat[3]]);
        }
    }

    /**
     * Create default account for a new user
     */
    private function createDefaultAccount(int $userId): void
    {
        $db = Database::getInstance();
        $stmt = $db->prepare(
            'INSERT INTO accounts (user_id, name, type, currency) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$userId, 'Carteira', 'cash', 'AOA']);
    }
}
