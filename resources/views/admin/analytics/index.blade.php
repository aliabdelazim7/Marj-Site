@extends('layouts.admin')

@section('title', 'التحليلات والمبيعات — لوحة تحكم مرج')
@section('page_title', 'تحليلات المبيعات وتفاعل الزوار')

@section('content')
<div class="space-y-8 max-w-5xl mx-auto">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="p-6 rounded-3xl glass-sidebar border border-white/5 space-y-1">
            <span class="text-xs text-slate-400 font-semibold">إجمالي المبيعات المؤكدة</span>
            <div class="text-3xl font-black text-cyan-400">{{ number_format($totalSales) }} <span class="text-xs font-normal text-slate-400">ج.م</span></div>
        </div>
        <div class="p-6 rounded-3xl glass-sidebar border border-white/5 space-y-1">
            <span class="text-xs text-slate-400 font-semibold">الطلبات المسلمة بنجاح</span>
            <div class="text-3xl font-black text-emerald-400">{{ $deliveredOrdersCount }}</div>
        </div>
        <div class="p-6 rounded-3xl glass-sidebar border border-white/5 space-y-1">
            <span class="text-xs text-slate-400 font-semibold">إجمالي عدد الطلبات</span>
            <div class="text-3xl font-black text-white">{{ $ordersCount }}</div>
        </div>
    </div>

    <!-- أفضل المنتجات مبيعاً -->
    <div class="glass-sidebar rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 class="font-bold text-base text-white">الهوديز الأكثر مبيعاً</h3>
        <div class="space-y-3">
            @foreach($topProducts as $tp)
                <div class="p-4 rounded-2xl bg-slate-900/60 flex items-center justify-between text-xs">
                    <strong class="text-white text-sm">{{ $tp->product_name }}</strong>
                    <div class="flex items-center gap-4">
                        <span class="text-slate-400">{{ $tp->total_qty }} قطعة مباعة</span>
                        <span class="font-bold text-cyan-400">{{ number_format($tp->total_revenue) }} ج.م</span>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</div>
@endsection
