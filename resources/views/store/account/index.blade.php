@extends('layouts.app')

@section('title', 'حسابي — ' . ($storeSettings->brand_name ?? 'مرج'))

@section('content')
<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
    <!-- رأس الملف الشخصي ونقاط الولاء -->
    <div class="glass-panel p-6 sm:p-8 rounded-3xl flex flex-wrap items-center justify-between gap-6">
        <div>
            <h1 class="text-2xl sm:text-3xl font-black text-white">أهلاً بك، {{ $user->name }} 👋</h1>
            <p class="text-xs sm:text-sm text-slate-400 mt-1">{{ $user->email }}</p>
        </div>

        <!-- بطاقة نقاط الولاء -->
        <div class="px-6 py-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/30 text-center">
            <span class="text-xs text-cyan-300 font-bold block">رصيد نقاط الولاء</span>
            <div class="text-3xl font-black text-white mt-0.5">{{ $user->loyaltyAccount?->points ?? 0 }} <span class="text-xs font-normal text-cyan-400">نقطة</span></div>
            <span class="text-[10px] text-slate-400">تساوي {{ $user->loyaltyAccount?->points ?? 0 }} ج.م خصم عند الطلب</span>
        </div>
    </div>

    <!-- سجل الطلبات السابقة -->
    <div class="space-y-4">
        <h3 class="text-xl font-black text-white">طلباتي السابقة</h3>

        @if($user->orders->isEmpty())
            <div class="p-8 rounded-3xl glass-panel text-center text-sm text-slate-400">
                لم تقم بإجراء أي طلبات حتى الآن.
                <a href="{{ route('products.index') }}" class="text-cyan-400 font-bold block mt-2">تسوق تشكيلة الهوديز الآن</a>
            </div>
        @else
            <div class="space-y-4">
                @foreach($user->orders as $order)
                    <div class="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <div class="flex items-center gap-3">
                                <span class="font-mono font-bold text-white text-base">#{{ $order->order_number }}</span>
                                <span class="px-2.5 py-0.5 rounded-lg text-xs font-bold border {{ $order->status_badge_class }}">{{ $order->status_arabic }}</span>
                            </div>
                            <div class="text-xs text-slate-400 mt-1">{{ $order->created_at->format('Y-m-d | h:i A') }} • {{ $order->items->count() }} منتج</div>
                        </div>

                        <div class="flex items-center gap-4">
                            <span class="font-black text-base text-cyan-400">{{ $order->total }} ج.م</span>
                            <a href="{{ route('track-order', ['order_number' => $order->order_number, 'email' => $order->email]) }}" class="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-cyan-500 hover:text-slate-950 text-xs font-bold transition">
                                تفاصيل الطلب
                            </a>
                        </div>
                    </div>
                @endforeach
            </div>
        @endif
    </div>
</div>
@endsection
