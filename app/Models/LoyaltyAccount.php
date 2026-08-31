<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltyAccount extends Model {
    protected $fillable = [
        'user_id',
        'points',
    ];

    protected function casts(): array {
        return [
            'points' => 'integer',
        ];
    }

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }
}
