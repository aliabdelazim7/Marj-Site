@extends('layouts.app')

@section('title', 'جميع الهوديز — ' . ($storeSettings->brand_name ?? 'مرج'))

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
    <!-- عنوان الصفحة -->
    <div class="mb-8">
        <h1 class="text-3xl sm:text-4xl font-black text-white">تشكيلة الهوديز</h1>
        <p class="text-slate-400 text-sm mt-1">استكشف جميع الهوديز المصنوعة من القطن الثقيل بألوان وقصات عصرية.</p>
    </div>

    <!-- الفلاتر والترتيب -->
    <div class="glass-panel rounded-2xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <!-- التصنيفات السريعة -->
        <div class="flex flex-wrap items-center gap-2">
            <a href="{{ route('products.index') }}" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition {{ !request('size') && !request('category') ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10' }}">
                الكل
            </a>
            @foreach(['S', 'M', 'L', 'XL'] as $sz)
                <a href="{{ route('products.index', array_merge(request()->query(), ['size' => $sz])) }}" class="px-3 py-1.5 rounded-xl text-xs font-bold transition {{ request('size') === $sz ? 'bg-cyan-500 text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10' }}">
                    مقاس {{ $sz }}
                </a>
            @endforeach
        </div>

        <!-- البحث والترتيب -->
        <form method="GET" action="{{ route('products.index') }}" class="flex items-center gap-2">
            <input type="text" name="search" value="{{ request('search') }}" placeholder="ابحث باسم الموديل..." class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500">
            <select name="sort" onchange="this.form.submit()" class="px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500">
                <option value="newest" {{ request('sort') == 'newest' ? 'selected' : '' }}>الأحدث</option>
                <option value="price_asc" {{ request('sort') == 'price_asc' ? 'selected' : '' }}>السعر: الأقل للأعلى</option>
                <option value="price_desc" {{ request('sort') == 'price_desc' ? 'selected' : '' }}>السعر: الأعلى للأقل</option>
            </select>
        </form>
    </div>

    <!-- شبكة المنتجات -->
    @if($products->isEmpty())
        <div class="text-center py-20 glass-panel rounded-3xl">
            <i data-lucide="package-open" class="w-12 h-12 mx-auto text-slate-500 mb-3"></i>
            <h3 class="text-lg font-bold text-white">لا توجد منتجات مطابقة لخيارات البحث</h3>
            <p class="text-xs text-slate-400 mt-1">جرب إزالة بعض الفلاتر لعرض المنتجات المتاحة.</p>
            <a href="{{ route('products.index') }}" class="mt-4 inline-block px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs">إعادة ضبط الفلاتر</a>
        </div>
    @else
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            @foreach($products as $product)
                <div class="group glass-panel rounded-3xl overflow-hidden hover:border-cyan-500/40 transition duration-300 flex flex-col">
                    <a href="{{ route('products.show', $product->slug) }}" class="block relative aspect-square bg-slate-900 overflow-hidden">
                        <img src="{{ $product->image_url }}" alt="{{ $product->nameArabic }}" class="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500">
                        
                        @if($product->compare_at_price && $product->compare_at_price > $product->effective_price)
                            <span class="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-md">
                                خصم {{ $product->discount_percentage }}%
                            </span>
                        @endif
                    </a>

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

        <div class="mt-12">
            {{ $products->links() }}
        </div>
    @endif
</div>
@endsection
