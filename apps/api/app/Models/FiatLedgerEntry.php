<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FiatLedgerEntry extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'request_id',
        'direction',
        'amount_gbp',
        'ref',
        'created_at',
    ];

    protected $casts = [
        'amount_gbp' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    public function request()
    {
        return $this->belongsTo(MintRedeemRequest::class, 'request_id');
    }
}
