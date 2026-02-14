<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'name',
        'kyb_status',
    ];

    public function addresses()
    {
        return $this->hasMany(WhitelistedAddress::class);
    }

    public function requests()
    {
        return $this->hasMany(MintRedeemRequest::class);
    }
}
