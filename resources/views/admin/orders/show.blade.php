@extends('layouts.admin')

@section('title', 'تفاصيل الطلب #' . $order->order_number . ' — لوحة تحكم مرج')
@section('page_title', 'تفاصيل الطلب: #' . $order->order_number)

@section('content')
<div class="max-w-4xl mx-auto space-y-6">
    <!-- بطاقة الحالة وتحديث الحالة -->
    <div class="glass-sidebar rounded-3xl p-6 border border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div>
            <span class="text-xs text-slate-400">حالة الطلب الحالية:</span>
            <div class="flex items-center gap-2 mt-1">
                <span class="px-3 py-1 rounded-xl text-xs font-bold border {{ $order->status_badge_class }}">{{ $order->status_arabic }}</span>
            </div>
        </div>

        <!-- زر رسالة الواتساب للعميل -->
        <a href="{{ $whatsAppStatusUrl }}" target="_blank" class="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-emerald-500 transition">
            <i data-lucide="message-circle" class="w-4 h-4"></i>
            إرسال تحديث للعميل عبر WhatsApp
        </a>

        <!-- تحديث الحالة -->
        <form action="{{ route('admin.orders.update-status', $order->id) }}" method="POST" class="flex items-center gap-2">
            @csrf
            @method('PUT')
            <select name="status" class="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white">
                <option value="pending" {{ $order->status === 'pending' ? 'selected' : '' }}>قيد الانتظار</option>
                <option value="confirmed" {{ $order->status === 'confirmed' ? 'selected' : '' }}>تم التأكيد</option>
                <option value="processing" {{ $order->status === 'processing' ? 'selected' : '' }}>جاري التجهيز</option>
                <option value="shipped" {{ $order->status === 'shipped' ? 'selected' : '' }}>تم الشحن</option>
                <option value="delivered" {{ $order->status === 'delivered' ? 'selected' : '' }}>تم التسليم</option>
                <option value="cancelled" {{ $order->status === 'cancelled' ? 'selected' : '' }}>ملغي</option>
            </select>
            <button type="submit" class="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">تغيير</button>
        </form>
    </div>

    <!-- عناصر الطلب -->
    <div class="glass-sidebar rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 class="font-bold text-base text-white">المنتجات المطلوبة</h3>

        <div class="space-y-3">
            @foreach($order->items as $item)
                <div class="p-3.5 rounded-2xl bg-slate-900/60 flex items-center justify-between text-xs">
                    <div>
                        <strong class="text-white text-sm block">{{ $item->product_name }}</strong>
                        <span class="text-slate-400">مقاس: <strong class="text-cyan-400">{{ $item->size }}</strong> | الكمية: {{ $item->quantity }}</span>
                    </div>
                    <span class="font-bold text-white">{{ $item->line_total }} ج.م</span>
                </div>
            @endforeach
        </div>

        <div class="pt-4 border-t border-white/5 space-y-1.5 text-xs text-slate-300">
            <div class="flex justify-between"><span>المجموع الفرعي:</span> <span>{{ $order->subtotal }} ج.م</span></div>
            @if($order->coupon_discount > 0)
                <div class="flex justify-between text-emerald-400"><span>الخصم ({{ $order->coupon_code }}):</span> <span>-{{ $order->coupon_discount }} ج.م</span></div>
            @endif
            <div class="flex justify-between"><span>الشحن:</span> <span>{{ $order->shipping }} ج.م</span></div>
            <div class="flex justify-between font-black text-white text-sm pt-2 border-t border-white/5">
                <span>الإجمالي:</span>
                <span class="text-cyan-400">{{ $order->total }} ج.م</span>
            </div>
        </div>
    </div>
</div>
@endsection
