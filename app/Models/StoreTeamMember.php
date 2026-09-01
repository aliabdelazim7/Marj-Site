<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreTeamMember extends Model {
    protected $fillable = [
        'user_id',
        'role',
        'created_by_user_id',
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function creator() {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    public function canAccess(string $capability): bool {
        $capabilities = [
            'order_operator' => ['dashboard', 'orders'],
            'catalog_editor' => ['dashboard', 'catalog'],
            'analytics_viewer' => ['dashboard', 'analytics'],
            'store_manager' => ['dashboard', 'orders', 'catalog', 'analytics'],
        ];

        return in_array($capability, $capabilities[$this->role] ?? []);
    }
}
