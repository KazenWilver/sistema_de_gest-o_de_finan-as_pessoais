<?php

declare(strict_types=1);

namespace Sgfp\Helpers;

final class Validator
{
    public static function requireFields(array $data, array $fields): array
    {
        $missing = [];
        foreach ($fields as $f) {
            if (!array_key_exists($f, $data) || $data[$f] === '' || $data[$f] === null) {
                $missing[$f] = 'Obrigatório';
            }
        }
        return $missing;
    }

    public static function email(string $e): bool
    {
        return filter_var($e, FILTER_VALIDATE_EMAIL) !== false;
    }

    public static function inList(mixed $v, array $list): bool
    {
        return in_array($v, $list, true);
    }

    public static function decimalString(mixed $v): bool
    {
        if (!is_numeric($v)) {
            return false;
        }
        return true;
    }

    public static function dateYmd(string $d): bool
    {
        $dt = \DateTime::createFromFormat('Y-m-d', $d);
        return $dt && $dt->format('Y-m-d') === $d;
    }
}
