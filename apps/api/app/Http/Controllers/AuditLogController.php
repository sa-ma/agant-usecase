<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Support\CsvExporter;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $logs = AuditLog::with('actor')
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 50));

        return response()->json($logs);
    }

    public function export()
    {
        $rows = AuditLog::with('actor')->orderByDesc('id')->limit(10000)->get();

        $header = ['id', 'actor', 'action', 'entity_type', 'entity_id', 'metadata', 'created_at'];

        $csvRows = $rows->map(fn ($row) => [
            $row->id,
            $row->actor?->email ?? '',
            $row->action,
            $row->entity_type,
            $row->entity_id ?? '',
            json_encode($row->metadata_json ?? []),
            $row->created_at,
        ])->toArray();

        $csv = CsvExporter::build($header, $csvRows);

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="audit-logs.csv"',
        ]);
    }
}
