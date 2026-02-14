<?php

namespace App\Console\Commands;

use App\Models\ChainEvent;
use App\Models\FiatLedgerEntry;
use App\Models\MintRedeemRequest;
use App\Services\AuditLogger;
use App\Services\ChainService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ChainIndex extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chain:index {--from= : Override starting block}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Index chain events and reconcile mint/redeem requests.';

    public function __construct(private readonly ChainService $chain, private readonly AuditLogger $audit)
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $fromBlock = $this->option('from');
        $fromBlock = $fromBlock !== null ? (int) $fromBlock : (int) Cache::get('chain:last_block', 0);

        $result = $this->chain->events($fromBlock);
        $events = $result['events'] ?? [];

        foreach ($events as $event) {
            $type = $event['event'] ?? '';
            $txHash = $event['txHash'] ?? null;
            $blockNumber = $event['blockNumber'] ?? null;
            $args = $event['args'] ?? [];

            if (! $txHash || $type === '') {
                continue;
            }

            $address = $args[0] ?? null;
            $amount = $args[1] ?? null;

            $chainEvent = ChainEvent::firstOrCreate([
                'event_type' => $type,
                'tx_hash' => $txHash,
            ], [
                'block_number' => $blockNumber,
                'address' => $address,
                'amount' => $amount,
                'raw_json' => $event,
                'created_at' => now(),
            ]);

            if ($chainEvent->wasRecentlyCreated) {
                $this->handleEvent($type, $txHash, $address, $amount);
            }
        }

        $toBlock = $result['toBlock'] ?? $fromBlock;
        Cache::put('chain:last_block', $toBlock + 1);

        $this->info('Indexed '.count($events).' events.');

        return self::SUCCESS;
    }

    private function handleEvent(string $type, string $txHash, ?string $address, ?string $amount): void
    {
        if (in_array($type, ['Minted', 'Burned'], true)) {
            $request = MintRedeemRequest::where('chain_tx_hash', $txHash)->first();
            if (! $request || $request->status === 'settled') {
                return;
            }

            DB::transaction(function () use ($request, $txHash) {
                $request->status = 'settled';
                $request->fiat_ledger_ref = $request->fiat_ledger_ref ?? $this->makeFiatRef($request->id);
                $request->save();

                FiatLedgerEntry::firstOrCreate(
                    ['request_id' => $request->id],
                    [
                        'direction' => $request->type === 'mint' ? 'in' : 'out',
                        'amount_gbp' => $request->amount_gbp,
                        'ref' => $request->fiat_ledger_ref,
                        'created_at' => now(),
                    ]
                );

                $this->audit->log(null, 'request.settled', 'mint_redeem_request', $request->id, [
                    'chain_tx_hash' => $txHash,
                ]);
            });

            return;
        }

        if (in_array($type, ['Paused', 'Unpaused'], true)) {
            $this->audit->log(null, 'token.'.$type, 'token', null, ['tx_hash' => $txHash]);
            return;
        }

        if (in_array($type, ['AddressFrozen', 'AddressUnfrozen'], true)) {
            $this->audit->log(null, 'token.'.$type, 'token', null, [
                'address' => $address,
                'tx_hash' => $txHash,
            ]);
        }
    }

    private function makeFiatRef(int $requestId): string
    {
        return 'FIAT-'.str_pad((string) $requestId, 6, '0', STR_PAD_LEFT).'-'.now()->format('YmdHis');
    }
}
