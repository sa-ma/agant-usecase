<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\FiatLedgerEntry;
use App\Models\MintRedeemRequest;
use App\Models\WhitelistedAddress;
use App\Services\AuditLogger;
use App\Services\ChainService;
use App\Support\TokenAmount;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class RequestController extends Controller
{
    public function __construct(
        private readonly ChainService $chain,
        private readonly AuditLogger $audit
    ) {
    }

    public function index(Request $request)
    {
        $query = MintRedeemRequest::with(['customer', 'creator', 'approver', 'fiatLedgerEntry'])
            ->orderByDesc('id');

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->integer('customer_id'));
        }

        return response()->json($query->paginate($request->integer('per_page', 50)));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => ['required', Rule::in(['mint', 'redeem'])],
            'customer_id' => ['required', 'exists:customers,id'],
            'address' => ['required', 'regex:/^0x[a-fA-F0-9]{40}$/'],
            'amount_gbp' => ['required', 'regex:/^\d+(\.\d{1,2})?$/'],
        ]);

        $customer = Customer::findOrFail($data['customer_id']);
        $this->ensureCompliance($customer, $data['address']);

        $address = WhitelistedAddress::where('customer_id', $customer->id)
            ->where('address', $data['address'])
            ->where('status', 'active')
            ->first();

        if (! $address) {
            return response()->json(['error' => 'Address not whitelisted.'], 422);
        }

        $requestModel = MintRedeemRequest::create([
            'type' => $data['type'],
            'customer_id' => $customer->id,
            'address' => $data['address'],
            'amount_gbp' => $data['amount_gbp'],
            'status' => 'created',
            'created_by' => $request->user()->id,
        ]);

        $this->audit->log($request->user(), 'request.created', 'mint_redeem_request', $requestModel->id, [
            'type' => $requestModel->type,
            'amount_gbp' => $requestModel->amount_gbp,
        ]);

        return response()->json($requestModel, 201);
    }

    public function approve(Request $request, MintRedeemRequest $mintRedeemRequest)
    {
        if ($mintRedeemRequest->status !== 'created') {
            return response()->json(['error' => 'Request not in created state.'], 422);
        }

        if ($mintRedeemRequest->created_by === $request->user()->id) {
            return response()->json(['error' => 'Maker cannot approve their own request.'], 422);
        }

        $this->ensureCompliance($mintRedeemRequest->customer, $mintRedeemRequest->address);

        $mintRedeemRequest->status = 'approved';
        $mintRedeemRequest->approved_by = $request->user()->id;
        $mintRedeemRequest->save();

        $this->audit->log($request->user(), 'request.approved', 'mint_redeem_request', $mintRedeemRequest->id);

        return response()->json($mintRedeemRequest);
    }

    public function submit(Request $request, MintRedeemRequest $mintRedeemRequest)
    {
        if (! in_array($mintRedeemRequest->status, ['approved', 'submitted', 'settled'], true)) {
            return response()->json(['error' => 'Request not approved.'], 422);
        }

        if ($mintRedeemRequest->chain_tx_hash) {
            return response()->json($mintRedeemRequest);
        }

        $this->ensureCompliance($mintRedeemRequest->customer, $mintRedeemRequest->address);

        $amount = TokenAmount::toTokenUnits((string) $mintRedeemRequest->amount_gbp);
        $response = $mintRedeemRequest->type === 'mint'
            ? $this->chain->mint($mintRedeemRequest->address, $amount)
            : $this->chain->burn($mintRedeemRequest->address, $amount);

        $mintRedeemRequest->status = 'submitted';
        $mintRedeemRequest->chain_tx_hash = $response['hash'] ?? null;
        $mintRedeemRequest->save();

        $this->audit->log($request->user(), 'request.submitted', 'mint_redeem_request', $mintRedeemRequest->id, [
            'chain_tx_hash' => $mintRedeemRequest->chain_tx_hash,
        ]);

        return response()->json($mintRedeemRequest);
    }

    public function settle(Request $request, MintRedeemRequest $mintRedeemRequest)
    {
        if (! in_array($mintRedeemRequest->status, ['submitted', 'approved'], true)) {
            return response()->json(['error' => 'Request not ready to settle.'], 422);
        }

        DB::transaction(function () use ($request, $mintRedeemRequest) {
            $mintRedeemRequest->status = 'settled';
            $mintRedeemRequest->fiat_ledger_ref = $mintRedeemRequest->fiat_ledger_ref ?? $this->makeFiatRef($mintRedeemRequest->id);
            $mintRedeemRequest->save();

            FiatLedgerEntry::firstOrCreate(
                ['request_id' => $mintRedeemRequest->id],
                [
                    'direction' => $mintRedeemRequest->type === 'mint' ? 'in' : 'out',
                    'amount_gbp' => $mintRedeemRequest->amount_gbp,
                    'ref' => $mintRedeemRequest->fiat_ledger_ref,
                    'created_at' => now(),
                ]
            );

            $this->audit->log($request->user(), 'request.settled', 'mint_redeem_request', $mintRedeemRequest->id);
        });

        return response()->json($mintRedeemRequest->fresh());
    }

    public function fail(Request $request, MintRedeemRequest $mintRedeemRequest)
    {
        $data = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $mintRedeemRequest->status = 'failed';
        $mintRedeemRequest->failure_reason = $data['reason'];
        $mintRedeemRequest->save();

        $this->audit->log($request->user(), 'request.failed', 'mint_redeem_request', $mintRedeemRequest->id, [
            'reason' => $mintRedeemRequest->failure_reason,
        ]);

        return response()->json($mintRedeemRequest);
    }

    private function ensureCompliance(Customer $customer, string $address): void
    {
        if ($customer->kyb_status !== 'approved') {
            throw new HttpResponseException(response()->json(['error' => 'Customer KYB not approved.'], 422));
        }

        if ($this->chain->paused()) {
            throw new HttpResponseException(response()->json(['error' => 'Token is paused.'], 422));
        }

        if ($this->chain->frozen($address)) {
            throw new HttpResponseException(response()->json(['error' => 'Address is frozen.'], 422));
        }
    }

    private function makeFiatRef(int $requestId): string
    {
        return 'FIAT-'.str_pad((string) $requestId, 6, '0', STR_PAD_LEFT).'-'.now()->format('YmdHis');
    }
}
