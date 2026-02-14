<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChainEvent extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'event_type',
        'tx_hash',
        'block_number',
        'address',
        'amount',
        'raw_json',
        'created_at',
    ];

    protected $casts = [
        'raw_json' => 'array',
        'created_at' => 'datetime',
    ];
}
