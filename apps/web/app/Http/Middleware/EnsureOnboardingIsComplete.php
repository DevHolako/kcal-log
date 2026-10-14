<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboardingIsComplete
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user && ! $request->is('api/*') && ! $request->is('onboarding*') && ! $request->is('logout') && ! $request->is('settings*')) {
            $hasProfile = $user->profile()->exists();
            $hasActiveTarget = $user->targetProfiles()->where('is_active', true)->exists();

            if (! $hasProfile || ! $hasActiveTarget) {
                return redirect()->route('onboarding');
            }
        }

        return $next($request);
    }
}
