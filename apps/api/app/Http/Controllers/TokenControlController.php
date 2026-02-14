<?php

namespace App\Http\Controllers;

use App\Models\ChainEvent;
use App\Services\AuditLogger;
use App\Services\ChainService;
use Illuminate\Http\Request;

class TokenControlController extends Controller
{
    public function __construct(
        private readonly ChainService $chain,
        private readonly AuditLogger $audit
    ) {
    }

    public function pause(Request $request)
    {
        $response = $this->chain->pause();
        $this->recordChainEvent('Paused', $response['hash'] ?? null);

        $this->audit->log($request->user(), 'token.paused', 'token');

        return response()->json($response);
    }

    public function unpause(Request $request)
    {
        $response = $this->chain->unpause();
        $this->recordChainEvent('Unpaused', $response['hash'] ?? null);

        $this->audit->log($request->user(), 'token.unpaused', 'token');

        return response()->json($response);
    }

    public function freeze(Request $request)
    {
        $data = $request->validate([
            'address' => ['required', 'regex:/^0x[a-fA-F0-9]{40}$/'],
        ]);

        $response = $this->chain->freeze($data['address']);
        $this->recordChainEvent('AddressFrozen', $response['hash'] ?? null, $data['address']);

        $this->audit->log($request->user(), 'token.address.frozen', 'token', null, [
            'address' => $data['address'],
        ]);

        return response()->json($response);
    }

    public function unfreeze(Request $request)
    {
        $data = $request->validate([
            'address' => ['required', 'regex:/^0x[a-fA-F0-9]{40}$/'],
        ]);

        $response = $this->chain->unfreeze($data['address']);
        $this->recordChainEvent('AddressUnfrozen', $response['hash'] ?? null, $data['address']);

        $this->audit->log($request->user(), 'token.address.unfrozen', 'token', null, [
            'address' => $data['address'],
        ]);

        return response()->json($response);
    }

    public function status()
    {
        $frozen = $this->currentFrozenAddresses();

        try {
            $paused = $this->chain->paused();
        } catch (\RuntimeException) {
            $paused = false;
        }

        return response()->json([
            'paused' => $paused,
            'frozen_count' => count($frozen),
            'frozen_addresses' => $frozen,
        ]);
    }

    private function recordChainEvent(string $eventType, ?string $hash, ?string $address = null): void
    {
        if (! $hash) {
            return;
        }

        ChainEvent::firstOrCreate([
            'event_type' => $eventType,
            'tx_hash' => $hash,
        ], [
            'address' => $address,
            'created_at' => now(),
        ]);
    }

    private function currentFrozenAddresses(): array
    {
        $events = ChainEvent::whereIn('event_type', ['AddressFrozen', 'AddressUnfrozen'])
            ->orderBy('id')
            ->get();

        $frozen = [];
        foreach ($events as $event) {
            $address = strtolower((string) $event->address);
            if ($address === '') {
                continue;
            }

            if ($event->event_type === 'AddressFrozen') {
                $frozen[$address] = true;
            } else {
                unset($frozen[$address]);
            }
        }

        return array_keys($frozen);
    }
}
