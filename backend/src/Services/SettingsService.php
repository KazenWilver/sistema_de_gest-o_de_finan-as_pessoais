<?php

declare(strict_types=1);

namespace Sgfp\Services;

use Sgfp\Helpers\Response;
use Sgfp\Helpers\Validator;
use Sgfp\Repositories\UserRepository;

final class SettingsService
{
    public function __construct(private UserRepository $users = new UserRepository())
    {
    }

    public function updateProfile(int $userId, array $body): array
    {
        $lang = $body['language'] ?? null;
        $cur = $body['base_currency'] ?? null;
        if ($lang === null && $cur === null) {
            Response::error('Nada para atualizar', [], 422);
        }
        $u = $this->users->findById($userId);
        if (!$u) {
            Response::error('Utilizador inválido', [], 404);
        }
        $newLang = $u['language'];
        $newCur = $u['base_currency'];
        if ($lang !== null) {
            if (!Validator::inList($lang, ['pt', 'en'])) {
                Response::error('Idioma inválido', [], 422);
            }
            $newLang = $lang;
        }
        if ($cur !== null) {
            $cc = strtoupper((string) $cur);
            if (!preg_match('/^[A-Z]{3}$/', $cc)) {
                Response::error('Moeda inválida', [], 422);
            }
            $newCur = $cc;
        }
        $this->users->updateProfile($userId, $newLang, $newCur);
        $u = $this->users->findById($userId);
        unset($u['password_hash'], $u['reset_token'], $u['reset_token_expires_at']);
        return $u;
    }

    public function updateSecurity(int $userId, array $body): array
    {
        $miss = Validator::requireFields($body, ['current_password', 'new_password']);
        if ($miss !== []) {
            Response::error('Credenciais em falta', $miss, 422);
        }
        if (strlen((string) $body['new_password']) < 8) {
            Response::error('Password fraca', [], 422);
        }
        $u = $this->users->findById($userId);
        if (!password_verify((string) $body['current_password'], $u['password_hash'])) {
            Response::error('Password actual incorrecta', [], 403);
        }
        $hash = password_hash((string) $body['new_password'], PASSWORD_BCRYPT);
        $this->users->updatePassword($userId, $hash);
        return ['message' => 'Password actualizada'];
    }
}
