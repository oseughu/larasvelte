<?php

namespace App\Helpers;

class Helpers
{
    public static function generateRandomCode(): string
    {
        $value = mt_rand(100000, 999999);

        return strlen((string) $value) !== 6 ? self::generateRandomCode() : (string) $value;
    }
}
