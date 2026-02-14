<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhitelistedAddress extends Model
{
    protected $fillable = [
        'customer_id',
        'address',
        'status',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
