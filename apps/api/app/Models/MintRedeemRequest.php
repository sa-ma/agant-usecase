<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MintRedeemRequest extends Model
{
    protected $fillable = [
        'type',
        'customer_id',
        'address',
        'amount_gbp',
        'status',
        'created_by',
        'approved_by',
        'chain_tx_hash',
        'fiat_ledger_ref',
        'failure_reason',
    ];

    protected $casts = [
        'amount_gbp' => 'decimal:2',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function fiatLedgerEntry()
    {
        return $this->hasOne(FiatLedgerEntry::class, 'request_id');
    }
}
