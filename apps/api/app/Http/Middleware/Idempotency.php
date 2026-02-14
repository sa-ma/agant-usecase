<?php

namespace App\Http\Middleware;

use App\Models\IdempotencyKey;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Idempotency
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $method = strtoupper($request->getMethod());
        if (! in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
            return $next($request);
        }

        $key = $request->header('Idempotency-Key');
        if (! $key) {
            return $next($request);
        }

        $endpoint = $request->path();
        $hash = hash('sha256', $method.'|'.$endpoint.'|'.$request->getContent());

        $existing = IdempotencyKey::where('key', $key)->where('endpoint', $endpoint)->first();
        if ($existing) {
            if ($existing->request_hash !== $hash) {
                return response()->json(['error' => 'Idempotency key conflict.'], 409);
            }

            $payload = $existing->response_json;
            $status = $payload['status'] ?? 200;
            $body = $payload['body'] ?? $payload;

            return response()->json($body, $status);
        }

        $response = $next($request);
        $contentType = $response->headers->get('Content-Type', '');

        if (str_contains($contentType, 'application/json')) {
            IdempotencyKey::create([
                'key' => $key,
                'endpoint' => $endpoint,
                'request_hash' => $hash,
                'response_json' => [
                    'status' => $response->getStatusCode(),
                    'body' => $response->getData(true),
                ],
                'created_at' => now(),
            ]);
        }

        return $response;
    }
}
