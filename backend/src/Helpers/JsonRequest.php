<?php

declare(strict_types=1);

namespace Sgfp\Helpers;

final class JsonRequest
{
    public static function decode(string $raw): array
    {
        if ($raw === '') {
            return [];
        }
        $data = json_decode($raw, true);
        return is_array($data) ? $data : [];
    }
}
