<?php

namespace App\Support;

class TokenAmount
{
    public static function toTokenUnits(string $amount): string
    {
        $normalized = trim($amount);
        if ($normalized === '') {
            return '0';
        }

        $parts = explode('.', $normalized, 2);
        $whole = ltrim($parts[0] ?? '0', '0');
        if ($whole === '') {
            $whole = '0';
        }
        $fraction = $parts[1] ?? '';
        $fraction = substr($fraction, 0, 2);
        $fraction = str_pad($fraction, 2, '0');

        $digits = ltrim($whole.$fraction, '0');
        if ($digits === '') {
            $digits = '0';
        }

        return $digits.str_repeat('0', 16);
    }
}
