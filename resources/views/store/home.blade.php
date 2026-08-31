@extends('layouts.app')

@section('title', ($storeSettings->brand_name ?? 'مرج') . ' — متجر الهوديز وتجربة اللبس الافتراضية')

@section('content')
<!-- Hero Section البانر الرئيسي بتأثيرات البحر والموج -->
<section class="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center max-w-3xl mx-auto space-y-6">
            <!-- شارة علوية -->
            <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs sm:text-sm font-semibold animate-pulse">
                <i data-lucide="sparkles" class="w-4 h-4"></i>
                <span>المجموعة الشتوية الجديدة | قطن مصري ثقيل 100%</span>
            </div>

            <!-- العنوان الرئيسي -->
            <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight">
                هوديز بتفاصيل <span class="bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">البحر والموج</span>
            </h1>

            <p class="text-slate-300 text-base sm:text-lg sm:leading-relaxed max-w-2xl mx-auto">
                قصات واسعة مدروسة وأقمشة قطنية ثقيلة بملمس ناعم، مع تجربة قياس افتراضية بالذكاء الاصطناعي وعرض ثلاثي الأبعاد 3D.
            </p>

            <!-- أزرار الإجراء الرئيسي -->
            <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
                <a href="{{ route('products.index') }}" class="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-950 font-black text-base hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105 transition flex items-center gap-2">
                    <i data-lucide="shopping-bag" class="w-5 h-5"></i>
                    تسوق التشكيلة الآن
                </a>
                <a href="{{ route('lookbook') }}" class="px-8 py-3.5 rounded-2xl glass-panel text-white font-bold text-base hover:bg-white/10 hover:border-cyan-500/40 transition flex items-center gap-2">
                    <i data-lucide="compass" class="w-5 h-5"></i>
                    استعرض اللوك بوك
                </a>
            </div>
        </div>
    </div>
</section>

<!-- مميزات المتجر السريعة Value Props -->
<section class="border-y border-white/5 py-10 bg-slate-950/40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div class="p-4 rounded-2xl glass-panel">
            <div class="w-10 h-10 mx-auto rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3">
                <i data-lucide="truck" class="w-5 h-5"></i>
            </div>
            <h4 class="font-bold text-sm text-white">توصيل لكافة المحافظات</h4>
            <p class="text-xs text-slate-400 mt-1">شحن سريع خلال 2-4 أيام</p>
        </div>

        <div class="p-4 rounded-2xl glass-panel">
            <div class="w-10 h-10 mx-auto rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-3">
                <i data-lucide="rotate-ccw" class="w-5 h-5"></i>
            </div>
            <h4 class="font-bold text-sm text-white">استبدال واسترجاع 14 يوماً</h4>
            <p class="text-xs text-slate-400 mt-1">معاينة الشحنة عند الاستلام</p>
        </div>

        <div class="p-4 rounded-2xl glass-panel">
            <div class="w-10 h-10 mx-auto rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3">
                <i data-lucide="box" class="w-5 h-5"></i>
            </div>
            <h4 class="font-bold text-sm text-white">عرض ثلاثي الأبعاد 3D</h4>
            <p class="text-xs text-slate-400 mt-1">معاينة القطعة من كل زاوية</p>
        </div>

        <div class="p-4 rounded-2xl glass-panel">
            <div class="w-10 h-10 mx-auto rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3">
                <i data-lucide="sparkles" class="w-5 h-5"></i>
            </div>
            <h4 class="font-bold text-sm text-white">تجربة لبس افتراضية AI</h4>
            <p class="text-xs text-slate-400 mt-1">قيس الهودي على صورتك فوراً</p>
        </div>
    </div>
</section>

<!-- قسم الهوديز المميزة Featured Products -->
<section class="py-16 sm:py-24">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between mb-12">
            <div>
                <span class="text-xs font-bold uppercase tracking-widest text-cyan-400">التشكيلة المختارة</span>
                <h2 class="text-2xl sm:text-4xl font-black text-white mt-1">الأكثر طلباً هذا الموسم</h2>
            </div>
            <a href="{{ route('products.index') }}" class="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-cyan-400 hover:text-cyan-300 transition">
                <span>عرض الكل</span>
                <i data-lucide="arrow-left" class="w-4 h-4"></i>
            </a>
        </div>

        <!-- شبكة المنتجات -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @foreach($featuredProducts as $product)
                <div class="group glass-panel rounded-3xl overflow-hidden hover:border-cyan-500/40 transition duration-300 flex flex-col">
                    <!-- الصورة -->
                    <a href="{{ route('products.show', $product->slug) }}" class="block relative aspect-square bg-slate-900 overflow-hidden">
                        <img src="{{ $product->image_url }}" alt="{{ $product->nameArabic }}" class="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500">
                        
                        @if($product->compare_at_price && $product->compare_at_price > $product->effective_price)
                            <span class="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-md">
                                خصم {{ $product->discount_percentage }}%
                            </span>
                        @endif

                        <div class="absolute bottom-3 right-3 left-3 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-2">
                            <span class="w-full py-2 rounded-xl bg-slate-950/80 backdrop-blur text-white text-xs font-bold text-center border border-white/10 hover:bg-cyan-500 hover:text-slate-950 transition">
                                تفاصيل المنتج والمقاسات
                            </span>
                        </div>
                    </a>

                    <!-- بيانات المنتج -->
                    <div class="p-5 flex-1 flex flex-col justify-between">
                        <div>
                            <div class="text-xs text-cyan-400 font-semibold mb-1">{{ $product->category }}</div>
                            <a href="{{ route('products.show', $product->slug) }}" class="block font-bold text-base text-white hover:text-cyan-400 transition">
                                {{ $product->nameArabic }}
                            </a>
                            <div class="text-xs text-slate-400 mt-0.5">{{ $product->name }}</div>
                        </div>

                        <div class="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                            <div>
                                <span class="text-lg font-black text-white">{{ $product->effective_price }} <span class="text-xs font-normal text-slate-400">ج.م</span></span>
                                @if($product->compare_at_price)
                                    <span class="text-xs text-slate-500 line-through mr-2">{{ $product->compare_at_price }} ج.م</span>
                                @endif
                            </div>

                            <a href="{{ route('products.show', $product->slug) }}" class="p-2.5 rounded-xl bg-white/5 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 transition">
                                <i data-lucide="arrow-left" class="w-4 h-4"></i>
                            </a>
                        </div>
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</section>

<!-- قسم اللوك بوك Lookbook Teaser -->
@if($lookbookEntries->isNotEmpty())
<section class="py-16 border-t border-white/5 bg-slate-950/30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-12">
            <span class="text-xs font-bold uppercase tracking-widest text-cyan-400">الإطلالات والتنسيقات</span>
            <h2 class="text-2xl sm:text-4xl font-black text-white mt-1">لوكبـوك مـرج</h2>
            <p class="text-sm text-slate-400 mt-2">استلهم تنسيق إطلالتك الشتوية مع قطع مرج في الشارع والبحر.</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            @foreach($lookbookEntries as $entry)
                <div class="group relative aspect-[3/4] rounded-3xl overflow-hidden bg-slate-900 border border-white/5">
                    <img src="{{ $entry->image_url }}" alt="{{ $entry->title_arabic }}" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                    <div class="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-6">
                        <h4 class="font-black text-white text-base sm:text-lg">{{ $entry->title_arabic }}</h4>
                        @if($entry->product)
                            <a href="{{ route('products.show', $entry->product->slug) }}" class="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 hover:text-white transition">
                                <span>تسوق القطعة ({{ $entry->product->effective_price }} ج.م)</span>
                                <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
                            </a>
                        @endif
                    </div>
                </div>
            @endforeach
        </div>
    </div>
</section>
@endif
@endsection
