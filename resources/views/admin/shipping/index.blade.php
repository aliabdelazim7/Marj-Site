@extends('layouts.admin')

@section('title', 'شحن المحافظات — لوحة تحكم مرج')
@section('page_title', 'إدارة أسعار شحن المحافظات')

@section('content')
<div class="space-y-8 max-w-5xl mx-auto">
    <!-- الإعدادات العامة للشحن -->
    <form action="{{ route('admin.shipping.settings.update') }}" method="POST" class="glass-sidebar rounded-3xl p-6 border border-white/5 space-y-4">
        @csrf
        @method('PUT')
        <h3 class="font-bold text-base text-white">إعدادات الشحن العامة</h3>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">السعر الافتراضي للشحن (ج.م)</label>
                <input type="number" name="shipping_fee" value="{{ $settings->shipping_fee }}" class="w-full px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white">
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">حد الشحن المجاني (ج.م)</label>
                <input type="number" name="free_shipping_threshold" value="{{ $settings->free_shipping_threshold }}" class="w-full px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white">
            </div>
            <div>
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">نطاق الشحن</label>
                <input type="text" name="shipping_scope" value="{{ $settings->shipping_scope }}" class="w-full px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white">
            </div>
            <div class="sm:col-span-3">
                <label class="block text-xs font-semibold text-slate-300 mb-1.5">تنويه الشحن المعروض للعملاء</label>
                <textarea name="shipping_notice" rows="2" class="w-full px-4 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs text-white">{{ $settings->shipping_notice }}</textarea>
            </div>
        </div>

        <button type="submit" class="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">حفظ إعدادات الشحن العامة</button>
    </form>

    <!-- جدول محافظات مصر الـ 27 -->
    <div class="glass-sidebar rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 class="font-bold text-base text-white">أسعار المحافظات الـ 27</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            @foreach($zones as $zone)
                <form action="{{ route('admin.shipping.zones.update', $zone->id) }}" method="POST" class="p-3.5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2 text-xs">
                    @csrf
                    @method('PUT')
                    <div class="flex items-center justify-between font-bold text-white">
                        <span>{{ $zone->governorate }}</span>
                        <div class="flex items-center gap-1">
                            <input type="number" name="fee" value="{{ $zone->fee }}" class="w-16 px-2 py-1 rounded bg-slate-950 border border-white/10 text-cyan-400 font-bold text-center text-xs">
                            <span>ج.م</span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="text" name="delivery_note" value="{{ $zone->delivery_note }}" placeholder="ملاحظة التوصيل" class="w-full px-2 py-1 rounded bg-slate-950 border border-white/10 text-slate-300 text-[10px]">
                        <input type="hidden" name="enabled" value="1">
                        <button type="submit" class="p-1 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-slate-950 transition shrink-0 font-bold text-[10px]">حفظ</button>
                    </div>
                </form>
            @endforeach
        </div>
    </div>
</div>
@endsection
