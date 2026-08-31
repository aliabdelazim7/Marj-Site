<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PaymentMethod;

class WhatsAppService {
    public function generateOrderConfirmationUrl(Order $order): string {
        $brand = config('marj.brand_name', 'مرج');
        $phone = config('marj.whatsapp.default_number', '01012345678');

        $text = "مرحباً {$brand} 👋\n";
        $text .= "أود تأكيد طلبي برقم: #{$order->order_number}\n";
        $text .= "الاسم: {$order->customer_name}\n";
        $text .= "المحافظة: {$order->city}\n";
        $text .= "الإجمالي: {$order->total} ج.م\n";
        $text .= "طريقة الدفع: " . ($order->payment_method === 'cod' ? 'الدفع عند الاستلام' : 'تحويل يدوي') . "\n";
        $text .= "شكراً لكم!";

        return 'https://wa.me/' . preg_replace('/[^0-9]/', '', $phone) . '?text=' . urlencode($text);
    }

    public function generateManualPaymentReceiptUrl(Order $order, string $walletNumber): string {
        $text = "مرحباً متجر مرج 🌊\n";
        $text .= "لقد قمت بإتمام طلب جديد برقم: #{$order->order_number}\n";
        $text .= "المبلغ المحول: {$order->total} ج.م\n";
        $text .= "الاسم: {$order->customer_name}\n";
        $text .= "مرفق صورة إيصال التحويل على رقم المحفظة ({$walletNumber}):";

        return 'https://wa.me/' . preg_replace('/[^0-9]/', '', $walletNumber) . '?text=' . urlencode($text);
    }

    public function generateOrderStatusUpdateUrl(Order $order): string {
        $text = "مرحباً {$order->customer_name} 👋\n";
        $text .= "تحديث بخصوص طلبك من متجر مرج #{$order->order_number}:\n";
        $text .= "الحالة الحالية: {$order->status_arabic}\n";

        if ($order->shipment_carrier && $order->tracking_number) {
            $text .= "شركة الشحن: {$order->shipment_carrier}\n";
            $text .= "رقم بوليصة الشحن: {$order->tracking_number}\n";
        }

        if ($order->tracking_url) {
            $text .= "رابط التتبع: {$order->tracking_url}\n";
        }

        $customerPhone = preg_replace('/[^0-9]/', '', $order->phone);
        if (!str_starts_with($customerPhone, '20')) {
            $customerPhone = '20' . ltrim($customerPhone, '0');
        }

        return 'https://wa.me/' . $customerPhone . '?text=' . urlencode($text);
    }
}
