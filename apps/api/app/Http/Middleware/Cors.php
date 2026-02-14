<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $origin = env('CORS_ORIGIN', 'http://localhost:3000');
        $headers = [
            'Access-Control-Allow-Origin' => $origin,
            'Access-Control-Allow-Methods' => 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
            'Access-Control-Allow-Headers' => 'Content-Type,Authorization,Idempotency-Key,X-API-Token',
            'Access-Control-Allow-Credentials' => 'true',
        ];

        if ($request->getMethod() === 'OPTIONS') {
            return response('', 204, $headers);
        }

        $response = $next($request);
        foreach ($headers as $key => $value) {
            $response->headers->set($key, $value);
        }

        return $response;
    }
}
