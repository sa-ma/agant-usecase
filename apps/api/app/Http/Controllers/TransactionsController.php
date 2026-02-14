<?php

namespace App\Http\Controllers;

use App\Models\MintRedeemRequest;
use App\Support\CsvExporter;
use Illuminate\Http\Request;

class TransactionsController extends Controller
{
    public function index(Request $request)
    {
        $query = MintRedeemRequest::with(['customer', 'fiatLedgerEntry'])
            ->orderByDesc('id');

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return response()->json($query->paginate($request->integer('per_page', 50)));
    }

    public function export(Request $request)
    {
        $query = MintRedeemRequest::with(['customer', 'fiatLedgerEntry'])
            ->orderByDesc('id');

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $rows = $query->limit(10000)->get();

        $header = ['id', 'type', 'status', 'customer', 'address', 'amount_gbp',
                   'chain_tx_hash', 'fiat_ledger_ref', 'created_at'];

        $csvRows = $rows->map(fn ($row) => [
            $row->id,
            $row->type,
            $row->status,
            $row->customer?->name ?? '',
            $row->address,
            $row->amount_gbp,
            $row->chain_tx_hash ?? '',
            $row->fiat_ledger_ref ?? '',
            $row->created_at,
        ])->toArray();

        $csv = CsvExporter::build($header, $csvRows);

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="transactions.csv"',
        ]);
    }
}
