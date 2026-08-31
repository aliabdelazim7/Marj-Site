@extends('layouts.admin')

@section('title', 'إعدادات المتجر — لوحة تحكم مرج')
@section('page_title', 'إعدادات المتجر العامة والسياسات')

@section('content')
<div class="max-w-3xl mx-auto">
    <form action="{{ route('admin.settings.update') }}" method="POST" class="glass-sidebar rounded-3xl p-6 sm:p-8 border border-white/5 space-y-6">
        @csrf
        @method('PUT')

        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">اسم المتجر / العلامة التجارية *</label>
            <input type="text" name="brand_name" required value="{{ $settings->brand_name }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
        </div>

        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">نطاق الشحن *</label>
            <input type="text" name="shipping_scope" required value="{{ $settings->shipping_scope }}" class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">
        </div>

        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">تنويه الشحن *</label>
            <textarea name="shipping_notice" rows="3" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">{{ $settings->shipping_notice }}</textarea>
        </div>

        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">سياسة الاستبدال والاسترجاع *</label>
            <textarea name="return_policy" rows="3" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">{{ $settings->return_policy }}</textarea>
        </div>

        <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">تنويه طرق الدفع *</label>
            <textarea name="payment_notice" rows="3" required class="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-500">{{ $settings->payment_notice }}</textarea>
        </div>

        <button type="submit" class="px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition">
            حفظ إعدادات المتجر
        </button>
    </form>
</div>
@endsection
