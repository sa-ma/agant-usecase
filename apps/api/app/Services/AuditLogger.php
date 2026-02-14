<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;

class AuditLogger
{
    public function log(?User $actor, string $action, string $entityType, ?int $entityId = null, array $metadata = []): AuditLog
    {
        return AuditLog::create([
            'actor_id' => $actor?->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'metadata_json' => $metadata,
            'created_at' => now(),
        ]);
    }
}
