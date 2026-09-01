<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LoyaltyLedger extends Model {
    protected $table = 'loyalty_ledger';

    protected $fillable = [
        'user_id',
        'order_id',
        'points',
        'type',
        'note',
    ];

    protected function casts(): array {
        return [
            'points' => 'integer',
        ];
    }

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function order() {
        return $this->belongsTo(Order::class, 'order_id');
    }
}
