<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    public function __construct(private readonly AuditLogger $audit)
    {
    }

    public function index()
    {
        $customers = Customer::with('addresses')->orderByDesc('id')->get();

        return response()->json($customers);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'kyb_status' => ['nullable', Rule::in(['pending', 'approved', 'rejected'])],
        ]);

        $customer = Customer::create([
            'name' => $data['name'],
            'kyb_status' => $data['kyb_status'] ?? 'pending',
        ]);

        $this->audit->log($request->user(), 'customer.created', 'customer', $customer->id, [
            'kyb_status' => $customer->kyb_status,
        ]);

        return response()->json($customer, 201);
    }

    public function updateKyb(Request $request, Customer $customer)
    {
        $data = $request->validate([
            'kyb_status' => ['required', Rule::in(['pending', 'approved', 'rejected'])],
        ]);

        $customer->kyb_status = $data['kyb_status'];
        $customer->save();

        $this->audit->log($request->user(), 'customer.kyb.updated', 'customer', $customer->id, [
            'kyb_status' => $customer->kyb_status,
        ]);

        return response()->json($customer);
    }
}
