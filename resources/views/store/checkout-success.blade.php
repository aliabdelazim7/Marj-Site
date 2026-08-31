@extends('layouts.app')

@section('title', 'تم تأكيد طلبك بنجاح — ' . ($storeSettings->brand_name ?? 'مرج'))

@section('content')
<div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-6">
    <div class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/20 animate-bounce">
        <i data-lucide="check" class="w-10 h-10 stroke-[3]"></i>
    </div>

    <div>
        <h1 class="text-3xl sm:text-4xl font-black text-white">تم استلام طلبك بنجاح!</h1>
        <p class="text-sm text-slate-400 mt-2">شكراً لثقتك في متجر مرج. سنقوم بتجهيز وشحن طلبك بأعلى عناية.</p>
    </div>

    <!-- بطاقة تفاصيل الطلب -->
    <div class="glass-panel p-6 rounded-3xl text-right space-y-4">
        <div class="flex items-center justify-between pb-4 border-b border-white/10">
            <span class="text-xs text-slate-400">رقم الطلب:</span>
            <span class="font-mono font-black text-lg text-cyan-400">#{{ $order->order_number }}</span>
        </div>

        <div class="space-y-2 text-xs sm:text-sm text-slate-300">
            <div class="flex justify-between"><span>الاسم:</span> <strong class="text-white">{{ $order->customer_name }}</strong></div>
            <div class="flex justify-between"><span>المحافظة:</span> <strong class="text-white">{{ $order->city }}</strong></div>
            <div class="flex justify-between"><span>العنوان:</span> <strong class="text-white">{{ $order->address }}</strong></div>
            <div class="flex justify-between"><span>طريقة الدفع:</span> <strong class="text-white">{{ $order->payment_method === 'cod' ? 'الدفع عند الاستلام' : 'تحويل يدوي' }}</strong></div>
            <div class="flex justify-between font-bold text-white pt-2 border-t border-white/5">
                <span>الإجمالي:</span>
                <span class="text-base text-cyan-400">{{ $order->total }} ج.م</span>
            </div>
        </div>
    </div>

    <!-- أزرار الواتساب -->
    <div class="space-y-3 pt-4">
        @if($manualPaymentWhatsAppUrl)
            <a href="{{ $manualPaymentWhatsAppUrl }}" target="_blank" class="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition">
                <i data-lucide="message-circle" class="w-5 h-5"></i>
                إرسال صورة إيصال التحويل عبر WhatsApp
            </a>
        @else
            <a href="{{ $whatsAppUrl }}" target="_blank" class="w-full py-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition">
                <i data-lucide="message-circle" class="w-5 h-5"></i>
                تأكيد الطلب وتفاصيل الشحنة عبر WhatsApp
            </a>
        @endif

        <a href="{{ route('track-order', ['order_number' => $order->order_number, 'email' => $order->email]) }}" class="w-full py-3 rounded-2xl glass-panel text-white font-semibold text-sm hover:bg-white/10 transition block">
            متابعة وتتبع حالة الطلب
        </a>
    </div>
</div>
@endsection
