<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreTeamInvite extends Model {
    protected $fillable = [
        'token_hash',
        'role',
        'created_by_user_id',
        'expires_at',
        'accepted_at',
        'accepted_by_user_id',
        'revoked_at',
    ];

    protected function casts(): array {
        return [
            'expires_at' => 'datetime',
            'accepted_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function isPending(): bool {
        return is_null($this->accepted_at) && is_null($this->revoked_at) && ($this->expires_at === null || $this->expires_at->isFuture());
    }
}
