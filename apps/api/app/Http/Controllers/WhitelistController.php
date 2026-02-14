<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\WhitelistedAddress;
use App\Services\AuditLogger;
use Illuminate\Http\Request;

class WhitelistController extends Controller
{
    public function __construct(private readonly AuditLogger $audit)
    {
    }

    public function index(Customer $customer)
    {
        return response()->json($customer->addresses()->orderByDesc('id')->get());
    }

    public function store(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'address' => ['required', 'regex:/^0x[a-fA-F0-9]{40}$/'],
        ]);

        $address = WhitelistedAddress::create([
            'customer_id' => $customer->id,
            'address' => $data['address'],
            'status' => 'active',
        ]);

        $this->audit->log($request->user(), 'address.whitelisted', 'whitelisted_address', $address->id, [
            'address' => $address->address,
            'customer_id' => $customer->id,
        ]);

        return response()->json($address, 201);
    }

    public function revoke(Request $request, WhitelistedAddress $address)
    {
        $address->status = 'revoked';
        $address->save();

        $this->audit->log($request->user(), 'address.revoked', 'whitelisted_address', $address->id, [
            'address' => $address->address,
            'customer_id' => $address->customer_id,
        ]);

        return response()->json($address);
    }
}
