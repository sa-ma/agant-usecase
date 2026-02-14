<?php

namespace App\Http\Controllers;

use App\Models\MintRedeemRequest;
use App\Models\ReserveSnapshot;

class ReservesController extends Controller
{
    public function show()
    {
        $snapshot = ReserveSnapshot::orderByDesc('id')->first();

        if (! $snapshot) {
            $snapshot = ReserveSnapshot::create([
                'cash_gbp' => 25000000.00,
                'gov_securities_gbp' => 15000000.00,
                'total_reserves_gbp' => 40000000.00,
                'circulating_supply_gbp' => 0.00,
                'created_at' => now(),
            ]);
        }

        $circulating = $this->circulatingSupply();
        $totalReserves = (float) $snapshot->cash_gbp + (float) $snapshot->gov_securities_gbp;

        return response()->json([
            'cash_gbp' => (string) $snapshot->cash_gbp,
            'gov_securities_gbp' => (string) $snapshot->gov_securities_gbp,
            'total_reserves_gbp' => number_format($totalReserves, 2, '.', ''),
            'circulating_supply_gbp' => number_format($circulating, 2, '.', ''),
            'created_at' => $snapshot->created_at,
        ]);
    }

    private function circulatingSupply(): float
    {
        $minted = (float) MintRedeemRequest::where('status', 'settled')->where('type', 'mint')->sum('amount_gbp');
        $burned = (float) MintRedeemRequest::where('status', 'settled')->where('type', 'redeem')->sum('amount_gbp');

        return $minted - $burned;
    }
}
