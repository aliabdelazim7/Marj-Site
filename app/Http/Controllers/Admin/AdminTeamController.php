<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StoreTeamInvite;
use App\Models\StoreTeamMember;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminTeamController extends Controller {
    public function index() {
        $members = StoreTeamMember::with(['user', 'creator'])->get();
        $invites = StoreTeamInvite::whereNull('accepted_at')->whereNull('revoked_at')->get();
        return view('admin.team.index', compact('members', 'invites'));
    }

    public function createInvite(Request $request) {
        $request->validate([
            'role' => 'required|in:order_operator,catalog_editor,analytics_viewer,store_manager',
            'expires_in_hours' => 'required|in:24,72,168,720,unlimited',
        ]);

        $token = Str::random(64);
        $expiresAt = $request->expires_in_hours === 'unlimited' ? null : now()->addHours((int) $request->expires_in_hours);

        $invite = StoreTeamInvite::create([
            'token_hash' => hash('sha256', $token),
            'role' => $request->role,
            'created_by_user_id' => auth()->id(),
            'expires_at' => $expiresAt,
        ]);

        $inviteLink = route('team.accept-invite', $token);

        return back()->with('success', "تم إنشاء رابط الدعوة بنجاح!")->with('inviteLink', $inviteLink);
    }

    public function revokeInvite(int $id) {
        $invite = StoreTeamInvite::findOrFail($id);
        $invite->update(['revoked_at' => now()]);
        return back()->with('success', 'تم إلغاء الدعوة.');
    }

    public function revokeMember(int $id) {
        StoreTeamMember::findOrFail($id)->delete();
        return back()->with('success', 'تم إلغاء صلاحية العضو من الفريق.');
    }
}
