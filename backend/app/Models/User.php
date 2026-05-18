<?php
/**
 * SGFP — User Model
 */

class User
{
    public int    $id;
    public string $name;
    public string $email;
    public string $role;
    public string $currency;
    public string $language;
    public string $theme;
    public string $created_at;

    public static function fromArray(array $data): self
    {
        $user = new self();
        $user->id         = (int) ($data['id'] ?? 0);
        $user->name       = $data['name'] ?? '';
        $user->email      = $data['email'] ?? '';
        $user->role       = $data['role'] ?? 'user';
        $user->currency   = $data['currency'] ?? 'AOA';
        $user->language   = $data['language'] ?? 'pt';
        $user->theme      = $data['theme'] ?? 'light';
        $user->created_at = $data['created_at'] ?? '';
        return $user;
    }

    public function toArray(): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'role'       => $this->role,
            'currency'   => $this->currency,
            'language'   => $this->language,
            'theme'      => $this->theme,
            'created_at' => $this->created_at,
        ];
    }
}
