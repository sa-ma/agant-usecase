<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IdempotencyKey extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'key',
        'endpoint',
        'request_hash',
        'response_json',
        'created_at',
    ];

    protected $casts = [
        'response_json' => 'array',
        'created_at' => 'datetime',
    ];
}
