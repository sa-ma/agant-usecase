<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReserveSnapshot extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'cash_gbp',
        'gov_securities_gbp',
        'total_reserves_gbp',
        'circulating_supply_gbp',
        'created_at',
    ];

    protected $casts = [
        'cash_gbp' => 'decimal:2',
        'gov_securities_gbp' => 'decimal:2',
        'total_reserves_gbp' => 'decimal:2',
        'circulating_supply_gbp' => 'decimal:2',
        'created_at' => 'datetime',
    ];
}
