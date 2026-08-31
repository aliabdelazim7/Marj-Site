@extends('layouts.app')

@section('title', 'تتبع حالة الطلب — ' . ($storeSettings->brand_name ?? 'مرج'))

@section('content')
<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
    <div class="text-center mb-8">
        <h1 class="text-3xl font-black text-white">تتبع حالة طلبك</h1>
        <p class="text-sm text-slate-400 mt-1">أدخل رقم الطلب والبريد الإلكتروني لمعرفة مكان وحالة شحنتك لحظة بلحظة.</p>
    </div>

    <!-- نموذج البحث -->
    <form method="GET" action="{{ route('track-order') }}" class="glass-panel p-6 rounded-3xl space-y-4 mb-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">رقم الطلب *</label>
                <input type="text" name="order_number" required value="{{ request('order_number') }}" placeholder="مثال: MRJ-X92A1" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white uppercase focus:outline-none focus:border-cyan-500">
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">البريد الإلكتروني *</label>
                <input type="email" name="email" required value="{{ request('email') }}" placeholder="البريد المستخدم عند الطلب" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
            </div>
        </div>

        <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-950 font-bold text-sm">
            استعلام عن الشحنة
        </button>
    </form>

    <!-- نتائج التتبع -->
    @if(isset($order) && $order)
        <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
            <div class="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                    <span class="text-xs text-slate-400">طلب رقم:</span>
                    <h3 class="text-xl font-black text-white">#{{ $order->order_number }}</h3>
                </div>
                <span class="px-3.5 py-1.5 rounded-xl text-xs font-black border {{ $order->status_badge_class }}">
                    {{ $order->status_arabic }}
                </span>
            </div>

            <!-- خط سير وتطور الطلب Timeline -->
            @php
                $steps = [
                    'pending' => 'قيد الانتظار',
                    'confirmed' => 'تم التأكيد',
                    'processing' => 'جاري التجهيز',
                    'shipped' => 'تم الشحن مع المندوب',
                    'delivered' => 'تم التسليم بنجاح',
                ];
                $statuses = array_keys($steps);
                $currentIndex = array_search($order->status, $statuses);
                if ($currentIndex === false && $order->status === 'cancelled') $currentIndex = -1;
            @endphp

            <div class="space-y-4">
                <h4 class="text-xs font-bold uppercase tracking-wider text-cyan-400">مراحل الشحن</h4>
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                    @foreach($steps as $key => $label)
                        @php $stepIndex = array_search($key, $statuses); @endphp
                        <div class="p-3 rounded-xl border transition {{ $stepIndex <= $currentIndex ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 font-bold' : 'bg-slate-900/40 border-white/5 text-slate-500' }}">
                            <div class="mb-1">
                                @if($stepIndex <= $currentIndex) ✓ @else {{ $stepIndex + 1 }} @endif
                            </div>
                            <span>{{ $label }}</span>
                        </div>
                    @endforeach
                </div>
            </div>

            @if($order->shipment_carrier || $order->tracking_number)
                <div class="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs space-y-1">
                    @if($order->shipment_carrier) <div>شركة الشحن: <strong>{{ $order->shipment_carrier }}</strong></div> @endif
                    @if($order->tracking_number) <div>رقم بوليصة الشحن: <strong>{{ $order->tracking_number }}</strong></div> @endif
                    @if($order->tracking_url) <div><a href="{{ $order->tracking_url }}" target="_blank" class="text-cyan-400 underline font-bold">رابط تتبع بوليصة الشحن مباشرة ➔</a></div> @endif
                </div>
            @endif
        </div>
    @endif
</div>
@endsection
