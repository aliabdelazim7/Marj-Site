<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable {
    use HasFactory, Notifiable;

    protected $fillable = [
        'open_id',
        'name',
        'email',
        'password',
        'login_method',
        'role',
        'last_signed_in_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array {
        return [
            'last_signed_in_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function teamMember() {
        return $this->hasOne(StoreTeamMember::class, 'user_id');
    }

    public function orders() {
        return $this->hasMany(Order::class, 'user_id');
    }

    public function wishlists() {
        return $this->hasMany(AccountWishlist::class, 'user_id');
    }

    public function loyaltyAccount() {
        return $this->hasOne(LoyaltyAccount::class, 'user_id');
    }

    public function loyaltyLedgers() {
        return $this->hasMany(LoyaltyLedger::class, 'user_id');
    }

    public function isAdmin(): bool {
        return $this->role === 'admin';
    }
}
