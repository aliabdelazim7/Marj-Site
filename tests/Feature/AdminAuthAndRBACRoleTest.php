<?php

namespace Tests\Feature;

use App\Models\StoreTeamMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAuthAndRBACRoleTest extends TestCase {
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login_when_accessing_admin(): void {
        $response = $this->get(route('admin.dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_regular_user_is_forbidden_from_admin_panel(): void {
        $user = User::factory()->create(['role' => 'user']);

        $response = $this->actingAs($user)->get(route('admin.dashboard'));
        $response->assertStatus(403);
    }

    public function test_admin_user_can_access_admin_dashboard(): void {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));
        $response->assertStatus(200);
        $response->assertSee('نظرة عامة');
    }

    public function test_team_member_with_operator_role_can_access_orders(): void {
        $creator = User::factory()->admin()->create();
        $memberUser = User::factory()->create(['role' => 'user']);

        StoreTeamMember::create([
            'user_id' => $memberUser->id,
            'role' => 'order_operator',
            'created_by_user_id' => $creator->id,
        ]);

        $response = $this->actingAs($memberUser)->get(route('admin.orders.index'));
        $response->assertStatus(200);
    }
}
