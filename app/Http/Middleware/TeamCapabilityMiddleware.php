<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TeamCapabilityMiddleware {
    public function handle(Request $request, Closure $next, string $capability): Response {
        $user = $request->user();

        if (!$user) {
            abort(401);
        }

        if ($user->isAdmin()) {
            return $next($request);
        }

        $teamMember = $user->teamMember;
        if ($teamMember && $teamMember->canAccess($capability)) {
            return $next($request);
        }

        abort(403, "ليس لديك صلاحية الوصول إلى قسم: {$capability}");
    }
}
