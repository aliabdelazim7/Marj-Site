@extends('layouts.app')

@section('title', 'جميع الهوديز — مرج')

@section('content')
<div class="container collection" style="padding-top: 3rem;">
    <!-- رأس الصفحة -->
    <div class="section-heading">
        <div>
            <p class="kicker">01 / الكتالوج</p>
            <h2>جميع الهوديز.</h2>
        </div>
        <div class="collection-heading-actions">
            <p class="section-aside">قطن مصري ثقيل 100%<br>قصات مريحة وتفاصيل حادة.</p>
        </div>
    </div>

    <!-- شريط الفلاتر والترتيب -->
    <div class="flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#111]">
        <!-- فلاتر المقاس -->
        <div class="flex items-center gap-2">
            <a href="{{ route('products.index') }}" class="px-3 py-1.5 border text-xs font-bold transition {{ !request('size') ? 'bg-[#111] text-white border-[#111]' : 'border-[#aaa] text-[#111] hover:border-[#111]' }}">
                الكل
            </a>
            @foreach(['S', 'M', 'L', 'XL'] as $sz)
                <a href="{{ route('products.index', array_merge(request()->query(), ['size' => $sz])) }}" class="px-3 py-1.5 border text-xs font-bold transition {{ request('size') === $sz ? 'bg-[#111] text-white border-[#111]' : 'border-[#aaa] text-[#111] hover:border-[#111]' }}">
                    مقاس {{ $sz }}
                </a>
            @endforeach
        </div>

        <!-- البحث والترتيب -->
        <form method="GET" action="{{ route('products.index') }}" class="flex items-center gap-3">
            <input type="text" name="search" value="{{ request('search') }}" placeholder="ابحث باسم الموديل..." class="px-3 py-1.5 border border-[#aaa] bg-white text-xs text-[#111] focus:border-[#0b7b8e] outline-none">
            <select name="sort" onchange="this.form.submit()" class="px-3 py-1.5 border border-[#aaa] bg-white text-xs text-[#111] focus:border-[#0b7b8e] outline-none">
                <option value="newest" {{ request('sort') == 'newest' ? 'selected' : '' }}>الأحدث</option>
                <option value="price_asc" {{ request('sort') == 'price_asc' ? 'selected' : '' }}>السعر: الأقل للأعلى</option>
                <option value="price_desc" {{ request('sort') == 'price_desc' ? 'selected' : '' }}>السعر: الأعلى للأقل</option>
            </select>
        </form>
    </div>

    <!-- شبكة المنتجات -->
    @if($products->isEmpty())
        <div class="empty-commerce">
            <h2>لا توجد منتجات مطابقة لخيارات البحث</h2>
            <p>جرب إزالة بعض الفلاتر لعرض المنتجات المتاحة.</p>
            <a href="{{ route('products.index') }}" class="text-xs font-bold text-[#0b7b8e]">إعادة ضبط الفلاتر ↙</a>
        </div>
    @else
        <div class="product-grid">
            @foreach($products as $index => $product)
                <article class="product-card">
                    <div class="product-card-media">
                        <span class="product-index">{{ sprintf('%02d', $index + 1) }}</span>
                        <a href="{{ route('products.show', $product->slug) }}" class="product-image-link">
                            <img src="{{ $product->image_url }}" alt="هودي {{ $product->nameArabic }}" loading="lazy">
                        </a>
                        <span class="product-dot {{ match($index % 4) { 0 => 'red', 1 => 'white', 2 => 'black', default => 'grey' } }}"></span>

                        <button class="favorite-button" 
                                :class="{ 'is-favorite': isWishlisted('{{ $product->slug }}') }" 
                                @click="toggleWishlist('{{ $product->slug }}')"
                                aria-label="إضافة للمفضلة">
                            <i data-lucide="heart" class="w-4 h-4" :fill="isWishlisted('{{ $product->slug }}') ? 'currentColor' : 'none'"></i>
                        </button>
                    </div>

                    <div class="product-card-info">
                        <div>
                            <p class="eyebrow">{{ $product->name }}</p>
                            <h3><a href="{{ route('products.show', $product->slug) }}">{{ $product->nameArabic }}</a></h3>
                        </div>
                        <strong>{{ $product->effective_price }} ج.م</strong>
                    </div>

                    <p class="product-description">{{ $product->short_description ?? $product->description }}</p>

                    <div class="card-actions">
                        <form action="{{ route('cart.add') }}" method="POST" class="w-full">
                            @csrf
                            <input type="hidden" name="variant_id" value="{{ $product->variants->first()?->id }}">
                            <input type="hidden" name="quantity" value="1">
                            <button type="submit" class="card-buy-button w-full flex items-center justify-between px-3">
                                <span>أضف للسلة</span>
                                <span>↙</span>
                            </button>
                        </form>

                        <a href="{{ route('home') }}?tryOn={{ $product->slug }}#try-on" class="card-try-button flex items-center justify-between px-3 border border-[#111] text-xs font-bold hover:bg-[#111] hover:text-white transition">
                            <span>جرّبه عليك</span>
                            <span>↗</span>
                        </a>
                    </div>
                </article>
            @endforeach
        </div>

        <div class="mt-12">
            {{ $products->links() }}
        </div>
    @endif
</div>
@endsection
