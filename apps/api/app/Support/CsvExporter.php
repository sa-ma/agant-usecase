<?php

namespace App\Support;

class CsvExporter
{
    public static function sanitizeCell(mixed $value): string
    {
        $value = (string) $value;

        if ($value !== '' && in_array($value[0], ['=', '+', '-', '@', "\t", "\r"], true)) {
            $value = "'" . $value;
        }

        return '"' . str_replace('"', '""', $value) . '"';
    }

    /**
     * @param  string[]  $headers
     * @param  array<int, array<int, mixed>>  $rows
     */
    public static function build(array $headers, array $rows): string
    {
        $lines = [];
        $lines[] = implode(',', array_map([self::class, 'sanitizeCell'], $headers));

        foreach ($rows as $row) {
            $lines[] = implode(',', array_map([self::class, 'sanitizeCell'], $row));
        }

        return implode("\n", $lines) . "\n";
    }
}
