<?php

declare(strict_types=1);

namespace Sgfp\Services;

use Sgfp\Helpers\JwtHelper;
use Sgfp\Helpers\Response;
use Sgfp\Helpers\Validator;
use Sgfp\Repositories\UserRepository;

final class AuthService
{
    public function __construct(
        private UserRepository $users = new UserRepository(),
        private CategoryService $categories = new CategoryService()
    ) {
    }

    public function register(array $body): array
    {
        $miss = Validator::requireFields($body, ['email', 'password']);
        if ($miss !== []) {
            Response::error('Validação falhou', $miss, 422);
        }
        if (!Validator::email($body['email'])) {
            Response::error('Email inválido', ['email' => 'Formato inválido'], 422);
        }
        if (strlen((string) $body['password']) < 8) {
            Response::error('Password fraca', ['password' => 'Mínimo 8 caracteres'], 422);
        }
        if ($this->users->findByEmail($body['email'])) {
            Response::error('Email já registado', ['email' => 'Em uso'], 409);
        }
        $hash = password_hash((string) $body['password'], PASSWORD_BCRYPT);
        $lang = in_array($body['language'] ?? '', ['pt', 'en'], true) ? $body['language'] : 'pt';
        $cur = preg_match('/^[A-Z]{3}$/', strtoupper((string) ($body['base_currency'] ?? 'EUR'))) ? strtoupper($body['base_currency']) : 'EUR';
        $uid = $this->users->create($body['email'], $hash, 'user', $cur, $lang);
        $this->categories->seedDefaultsForUser($uid);
        $user = $this->users->findById($uid);
        return $this->issueAuthPayload($user);
    }

    public function login(array $body): array
    {
        $miss = Validator::requireFields($body, ['email', 'password']);
        if ($miss !== []) {
            Response::error('Credenciais em falta', $miss, 422);
        }
        $u = $this->users->findByEmail($body['email']);
        if (!$u || !password_verify((string) $body['password'], $u['password_hash'])) {
            Response::error('Credenciais inválidas', [], 401);
        }
        return $this->issueAuthPayload($u);
    }

    /** @param array<string,mixed>|null $user */
    private function issueAuthPayload(?array $user): array
    {
        if (!$user) {
            Response::error('Utilizador inválido', [], 500);
        }
        $secret = getenv('JWT_SECRET') ?: '';
        if (strlen($secret) < 16) {
            Response::error('Configuração JWT inválida', [], 500);
        }
        $ttl = (int) (getenv('JWT_TTL_SECONDS') ?: 86400);
        $payload = [
            'sub' => (int) $user['id'],
            'role' => $user['role'],
            'email' => $user['email'],
        ];
        $token = JwtHelper::encode($payload, $secret, $ttl);
        unset($user['password_hash'], $user['reset_token'], $user['reset_token_expires_at']);
        return ['token' => $token, 'user' => $user];
    }

    public function forgot(array $body): array
    {
        $miss = Validator::requireFields($body, ['email']);
        if ($miss !== []) {
            Response::error('Email obrigatório', $miss, 422);
        }
        $u = $this->users->findByEmail($body['email']);
        if ($u) {
            $token = bin2hex(random_bytes(16));
            $exp = date('Y-m-d H:i:s', time() + 3600);
            $this->users->setResetToken((int) $u['id'], $token, $exp);
        }
        return ['message' => 'Se o email existir, receberá instruções'];
    }

    public function reset(array $body): array
    {
        $miss = Validator::requireFields($body, ['token', 'password']);
        if ($miss !== []) {
            Response::error('Dados em falta', $miss, 422);
        }
        if (strlen((string) $body['password']) < 8) {
            Response::error('Password fraca', ['password' => 'Mínimo 8 caracteres'], 422);
        }
        $u = $this->users->findByResetToken($body['token']);
        if (!$u) {
            Response::error('Token inválido ou expirado', [], 400);
        }
        $hash = password_hash((string) $body['password'], PASSWORD_BCRYPT);
        $this->users->updatePassword((int) $u['id'], $hash);
        return ['message' => 'Password atualizada'];
    }

    /** @return array<string,mixed> */
    public function me(int $userId): array
    {
        $u = $this->users->findById($userId);
        if (!$u) {
            Response::error('Não encontrado', [], 404);
        }
        unset($u['password_hash'], $u['reset_token'], $u['reset_token_expires_at']);
        return $u;
    }
}
