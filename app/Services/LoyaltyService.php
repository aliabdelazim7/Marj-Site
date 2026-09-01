<?php

namespace App\Services;

use App\Models\LoyaltyAccount;
use App\Models\LoyaltyLedger;
use App\Models\Order;

class LoyaltyService {
    public function awardPointsForDeliveredOrder(Order $order): bool {
        if ($order->loyalty_awarded || !$order->user_id) {
            return false;
        }

        // نقطة واحدة لكل 10 جنيهات
        $points = (int) floor($order->total / 10);

        if ($points <= 0) {
            $order->update(['loyalty_awarded' => true]);
            return true;
        }

        $account = LoyaltyAccount::firstOrCreate(
            ['user_id' => $order->user_id],
            ['points' => 0]
        );

        $account->increment('points', $points);

        LoyaltyLedger::create([
            'user_id' => $order->user_id,
            'order_id' => $order->id,
            'points' => $points,
            'type' => 'earned_delivery',
            'note' => "مكافأة تسليم الطلب #{$order->order_number}",
        ]);

        $order->update(['loyalty_awarded' => true]);
        return true;
    }

    public function redeemPoints(int $userId, int $pointsToRedeem, int $maxSubtotal): int {
        $account = LoyaltyAccount::where('user_id', $userId)->first();

        if (!$account || $account->points < $pointsToRedeem) {
            return 0;
        }

        // 1 نقطة = 1 جنيه خصم بحد أقصى قيمة السلة
        $discount = (int) min($pointsToRedeem, $account->points, $maxSubtotal);

        if ($discount <= 0) return 0;

        $account->decrement('points', $discount);

        LoyaltyLedger::create([
            'user_id' => $userId,
            'points' => -$discount,
            'type' => 'redeemed_checkout',
            'note' => "خصم نقاط ولاء عند إتمام الطلب",
        ]);

        return $discount;
    }
}
