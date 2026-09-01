@extends('layouts.app')

@section('title', 'الشحن والاستبدال — مرج')

@section('content')
<div class="container policy-page py-16">
    <header class="commerce-heading">
        <div>
            <p class="kicker"><span class="red-block"></span> مرج / المعلومات المهمة</p>
            <h1>الشحن<br><em>والاستبدال.</em></h1>
        </div>
        <p class="section-aside">نوضح لك طريقة وصول طلبك وما تحتاج معرفته قبل الإتمام.</p>
    </header>

    <section class="policy-grid grid grid-cols-1 md:grid-cols-3 gap-6">
        <article class="policy-card border-t border-[#111] pt-6 space-y-3">
            <i data-lucide="truck" class="w-6 h-6 text-[#0b7b8e]"></i>
            <p class="eyebrow">SHIPPING / مصر</p>
            <h2 class="text-xl font-bold text-[#111]">توصيل لكافة المحافظات</h2>
            <p class="text-xs text-slate-600 leading-relaxed">
                شحن سريع خلال 2-4 أيام عمل لجميع محافظات جمهورية مصر العربية مع معاينة الشحنة عند الاستلام.
            </p>
            <strong class="block text-xs text-[#0b7b8e] font-bold">
                الشحن مجاني للطلبات فوق {{ $storeSettings->free_shipping_threshold ?? 2000 }} ج.م.
            </strong>
        </article>

        <article class="policy-card border-t border-[#111] pt-6 space-y-3">
            <i data-lucide="rotate-ccw" class="w-6 h-6 text-[#0b7b8e]"></i>
            <p class="eyebrow">RETURNS & EXCHANGES</p>
            <h2 class="text-xl font-bold text-[#111]">الاستبدال والإرجاع</h2>
            <p class="text-xs text-slate-600 leading-relaxed">
                استبدال واسترجاع مجاني خلال 14 يوماً من تاريخ استلام الشحنة، بشرط أن تكون القطعة بحالتها الأصلية غير مغسولة وببطاقتها.
            </p>
        </article>

        <article class="policy-card border-t border-[#111] pt-6 space-y-3">
            <i data-lucide="credit-card" class="w-6 h-6 text-[#0b7b8e]"></i>
            <p class="eyebrow">PAYMENT</p>
            <h2 class="text-xl font-bold text-[#111]">طرق الدفع</h2>
            <p class="text-xs text-slate-600 leading-relaxed">
                الدفع نقدًا عند الاستلام (COD)، أو التحويل الفوري عبر إنستاباي (InstaPay) والمحافظ الإلكترونية (فودافون كاش وغيرها).
            </p>
        </article>
    </section>
</div>
@endsection
