@extends('layouts.admin')

@section('title', 'نظرة عامة — لوحة تحكم مرج')
@section('page_title', 'نظرة عامة على المتجر')

@section('content')
<div class="space-y-8">
    <!-- بطاقات الإحصائيات الرئيسية -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div class="p-5 rounded-2xl glass-sidebar border border-white/5 space-y-2">
            <div class="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>إجمالي المبيعات</span>
                <i data-lucide="dollar-sign" class="w-4 h-4 text-emerald-400"></i>
            </div>
            <div class="text-2xl font-black text-white">{{ number_format($totalRevenue) }} <span class="text-xs font-normal text-slate-400">ج.م</span></div>
        </div>

        <div class="p-5 rounded-2xl glass-sidebar border border-white/5 space-y-2">
            <div class="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>عدد الطلبات</span>
                <i data-lucide="shopping-cart" class="w-4 h-4 text-cyan-400"></i>
            </div>
            <div class="text-2xl font-black text-white">{{ $totalOrders }}</div>
        </div>

        <div class="p-5 rounded-2xl glass-sidebar border border-white/5 space-y-2">
            <div class="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>المنتجات النشطة</span>
                <i data-lucide="shirt" class="w-4 h-4 text-teal-400"></i>
            </div>
            <div class="text-2xl font-black text-white">{{ $activeProductsCount }}</div>
        </div>

        <div class="p-5 rounded-2xl glass-sidebar border border-white/5 space-y-2">
            <div class="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>نواقص المخزون</span>
                <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-400"></i>
            </div>
            <div class="text-2xl font-black text-amber-400">{{ $lowStockVariants->count() }}</div>
        </div>
    </div>

    <!-- تنبيهات نواقص المخزون Safety Stock Alerts -->
    @if($lowStockVariants->isNotEmpty())
        <div class="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-4">
            <h3 class="text-base font-bold text-amber-400 flex items-center gap-2">
                <i data-lucide="alert-triangle" class="w-5 h-5"></i>
                تنبيهات نواقص المخزون (تحت حد الأمان)
            </h3>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                @foreach($lowStockVariants as $variant)
                    <div class="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/20 flex items-center justify-between text-xs">
                        <div>
                            <strong class="text-white block">{{ $variant->product?->nameArabic }}</strong>
                            <span class="text-slate-400">مقاس: {{ $variant->size }} ({{ $variant->sku }})</span>
                        </div>
                        <span class="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold">
                            متبقي {{ $variant->stock }} قطع
                        </span>
                    </div>
                @endforeach
            </div>
        </div>
    @endif

    <!-- أحدث الطلبات -->
    <div class="glass-sidebar rounded-3xl p-6 border border-white/5 space-y-4">
        <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-white">أحدث الطلبات</h3>
            <a href="{{ route('admin.orders.index') }}" class="text-xs text-cyan-400 hover:underline">عرض كل الطلبات</a>
        </div>

        @if($recentOrders->isEmpty())
            <p class="text-xs text-slate-500 text-center py-6">لا توجد طلبات مسجلة بعد.</p>
        @else
            <div class="overflow-x-auto">
                <table class="w-full text-right text-xs">
                    <thead>
                        <tr class="text-slate-400 border-b border-white/5">
                            <th class="pb-3">رقم الطلب</th>
                            <th class="pb-3">العميل</th>
                            <th class="pb-3">المحافظة</th>
                            <th class="pb-3">الحالة</th>
                            <th class="pb-3">الإجمالي</th>
                            <th class="pb-3">التاريخ</th>
                            <th class="pb-3"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        @foreach($recentOrders as $order)
                            <tr class="hover:bg-white/5 transition">
                                <td class="py-3 font-mono font-bold text-white">#{{ $order->order_number }}</td>
                                <td class="py-3 text-slate-300">{{ $order->customer_name }}</td>
                                <td class="py-3 text-slate-400">{{ $order->city }}</td>
                                <td class="py-3">
                                    <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold border {{ $order->status_badge_class }}">{{ $order->status_arabic }}</span>
                                </td>
                                <td class="py-3 font-bold text-cyan-400">{{ $order->total }} ج.م</td>
                                <td class="py-3 text-slate-500">{{ $order->created_at->diffForHumans() }}</td>
                                <td class="py-3 text-left">
                                    <a href="{{ route('admin.orders.show', $order->id) }}" class="p-1.5 rounded-lg bg-white/5 text-slate-300 hover:text-cyan-400 hover:bg-white/10 transition inline-block">
                                        <i data-lucide="eye" class="w-3.5 h-3.5"></i>
                                    </a>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif
    </div>
</div>
@endsection
