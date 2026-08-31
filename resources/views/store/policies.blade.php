@extends('layouts.app')

@section('title', 'الشحن والسياسات — ' . ($storeSettings->brand_name ?? 'مرج'))

@section('content')
<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
    <div class="text-center">
        <h1 class="text-3xl sm:text-4xl font-black text-white">السياسات والشحن</h1>
        <p class="text-sm text-slate-400 mt-1">كل ما تحتاج معرفته عن التوصيل، الاستبدال، وطرق الدفع.</p>
    </div>

    <!-- سياسة الشحن -->
    <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-3">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <i data-lucide="truck" class="w-5 h-5 text-cyan-400"></i>
            الشحن والتوصيل
        </h3>
        <p class="text-sm text-slate-300 leading-relaxed">{{ $settings->shipping_notice }}</p>
        <div class="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300">
            🌊 {{ $settings->shipping_scope }}
        </div>
    </div>

    <!-- سياسة الاسترجاع والاستبدال -->
    <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-3">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <i data-lucide="rotate-ccw" class="w-5 h-5 text-teal-400"></i>
            الاستبدال والاسترجاع
        </h3>
        <p class="text-sm text-slate-300 leading-relaxed">{{ $settings->return_policy }}</p>
    </div>

    <!-- سياسة الدفع -->
    <div class="glass-panel p-6 sm:p-8 rounded-3xl space-y-3">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
            <i data-lucide="shield-check" class="w-5 h-5 text-emerald-400"></i>
            طرق الدفع والأمان
        </h3>
        <p class="text-sm text-slate-300 leading-relaxed">{{ $settings->payment_notice }}</p>
    </div>
</div>
@endsection
