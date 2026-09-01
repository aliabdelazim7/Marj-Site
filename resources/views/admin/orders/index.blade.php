@extends('layouts.admin')

@section('title', 'إدارة الطلبات — لوحة تحكم مرج')
@section('page_title', 'الطلبات والمبيعات')

@section('content')
<div class="space-y-6">
    <div class="glass-sidebar rounded-3xl p-6 border border-white/5 space-y-4">
        <!-- شريط الفلاتر والبحث -->
        <form method="GET" action="{{ route('admin.orders.index') }}" class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-2">
                <input type="text" name="search" value="{{ request('search') }}" placeholder="ابحث برقم الطلب، العميل، الهاتف..." class="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500">
                <select name="status" onchange="this.form.submit()" class="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500">
                    <option value="">جميع الحالات</option>
                    <option value="pending" {{ request('status') === 'pending' ? 'selected' : '' }}>قيد الانتظار</option>
                    <option value="confirmed" {{ request('status') === 'confirmed' ? 'selected' : '' }}>تم التأكيد</option>
                    <option value="processing" {{ request('status') === 'processing' ? 'selected' : '' }}>جاري التجهيز</option>
                    <option value="shipped" {{ request('status') === 'shipped' ? 'selected' : '' }}>تم الشحن</option>
                    <option value="delivered" {{ request('status') === 'delivered' ? 'selected' : '' }}>تم التسليم</option>
                    <option value="cancelled" {{ request('status') === 'cancelled' ? 'selected' : '' }}>ملغي</option>
                </select>
            </div>
        </form>

        <div class="overflow-x-auto">
            <table class="w-full text-right text-xs">
                <thead>
                    <tr class="text-slate-400 border-b border-white/5">
                        <th class="pb-3">رقم الطلب</th>
                        <th class="pb-3">العميل</th>
                        <th class="pb-3">المحافظة</th>
                        <th class="pb-3">طريقة الدفع</th>
                        <th class="pb-3">الحالة</th>
                        <th class="pb-3">الإجمالي</th>
                        <th class="pb-3">التاريخ</th>
                        <th class="pb-3"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    @foreach($orders as $order)
                        <tr class="hover:bg-white/5 transition">
                            <td class="py-3 font-mono font-bold text-white">#{{ $order->order_number }}</td>
                            <td class="py-3 text-slate-300">
                                <div>{{ $order->customer_name }}</div>
                                <div class="text-[10px] text-slate-500">{{ $order->phone }}</div>
                            </td>
                            <td class="py-3 text-slate-400">{{ $order->city }}</td>
                            <td class="py-3 text-slate-400">{{ $order->payment_method === 'cod' ? 'عند الاستلام' : 'تحويل محفظة' }}</td>
                            <td class="py-3">
                                <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold border {{ $order->status_badge_class }}">{{ $order->status_arabic }}</span>
                            </td>
                            <td class="py-3 font-bold text-cyan-400">{{ $order->total }} ج.م</td>
                            <td class="py-3 text-slate-500">{{ $order->created_at->format('Y-m-d') }}</td>
                            <td class="py-3 text-left">
                                <a href="{{ route('admin.orders.show', $order->id) }}" class="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition font-bold">
                                    عرض
                                </a>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="mt-6">
            {{ $orders->links() }}
        </div>
    </div>
</div>
@endsection
