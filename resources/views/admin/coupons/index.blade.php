@extends('layouts.admin')

@section('title', 'إدارة الكوبونات — لوحة تحكم مرج')
@section('page_title', 'كوبونات الخصم والعروض')

@section('content')
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
    <form action="{{ route('admin.coupons.store') }}" method="POST" class="glass-sidebar rounded-3xl p-6 border border-white/5 space-y-4">
        @csrf
        <h3 class="font-bold text-base text-white">إنشاء كوبون جديد</h3>
        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">كود الكوبون *</label>
            <input type="text" name="code" required placeholder="MARJ10" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white uppercase focus:outline-none focus:border-cyan-500">
        </div>
        <div class="grid grid-cols-2 gap-2">
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">النوع *</label>
                <select name="type" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white">
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت (ج.م)</option>
                </select>
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">القيمة *</label>
                <input type="number" name="value" required min="1" placeholder="10" class="w-full px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white">
            </div>
        </div>
        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">الحد الأدنى للطلب (ج.م)</label>
            <input type="number" name="minimum_subtotal" value="0" class="w-full px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white">
        </div>
        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">تاريخ البدء *</label>
            <input type="datetime-local" name="starts_at" required value="{{ date('Y-m-d\TH:i') }}" class="w-full px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white">
        </div>
        <input type="hidden" name="enabled" value="1">
        <button type="submit" class="w-full py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">إنشاء الكوبون</button>
    </form>

    <div class="lg:col-span-2 glass-sidebar rounded-3xl p-6 border border-white/5">
        <h3 class="font-bold text-base text-white mb-4">الكوبونات النشطة</h3>
        <div class="space-y-3">
            @foreach($coupons as $coupon)
                <div class="p-4 rounded-2xl bg-slate-900/60 flex items-center justify-between text-xs">
                    <div>
                        <strong class="text-cyan-400 font-mono text-base block">{{ $coupon->code }}</strong>
                        <span class="text-slate-400">
                            {{ $coupon->type === 'percentage' ? $coupon->value . '%' : $coupon->value . ' ج.م' }} خصم | تم الاستخدام {{ $coupon->used_count }} مرة
                        </span>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</div>
@endsection
