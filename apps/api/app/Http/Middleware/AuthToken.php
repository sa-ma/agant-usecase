<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthToken
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken() ?: $request->header('X-API-Token');

        if (! $token) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        $user = User::where('api_token', hash('sha256', $token))->first();

        if (! $user) {
            return response()->json(['error' => 'Unauthenticated.'], 401);
        }

        Auth::setUser($user);
        $request->setUserResolver(fn () => $user);

        return $next($request);
    }
}
