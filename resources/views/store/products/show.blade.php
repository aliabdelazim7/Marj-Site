@extends('layouts.app')

@section('title', $product->nameArabic . ' (' . $product->name . ') — مرج')
@section('meta_description', $product->short_description ?? $product->description)

@section('content')
<div class="container detail-page" x-data="{
    selectedSize: '{{ $product->variants->firstWhere('stock', '>', 0)?->size ?? 'M' }}',
    selectedVariantId: {{ $product->variants->firstWhere('stock', '>', 0)?->id ?? $product->variants->first()?->id ?? 1 }},
    selectedStock: {{ $product->variants->firstWhere('stock', '>', 0)?->stock ?? 0 }},
    currentImage: '{{ $product->image_url }}',
    show3d: false,
    rotation: 0,
    dragging: false,
    variants: {{ Js::from($product->variants) }},
    selectVariant(v) {
        this.selectedSize = v.size;
        this.selectedVariantId = v.id;
        this.selectedStock = v.stock;
    },
    handlePointerMove(e) {
        if (!this.dragging) return;
        let bounds = e.currentTarget.getBoundingClientRect();
        let progress = (e.clientX - bounds.left) / bounds.width;
        this.rotation = Math.round((progress - 0.5) * 18);
    }
}">
    <!-- المسار التنقلي Breadcrumb -->
    <div class="detail-breadcrumb">
        <a href="{{ route('home') }}">المجموعة</a>
        <span>←</span>
        <span>{{ $product->nameArabic }}</span>
    </div>

    <!-- قسم الهيرو للمنتج Detail Hero -->
    <section class="detail-hero">
        <!-- المعرض وعارض 3D التفاعلي -->
        <div class="detail-media" @pointerdown="dragging = true" @pointerup="dragging = false" @pointerleave="dragging = false" @pointermove="handlePointerMove($event)">
            <span class="detail-index">PRODUCT / 3D VIEW</span>
            
            <template x-if="!show3d">
                <div class="product-viewer-stage" :style="'transform: perspective(900px) rotateY(' + rotation + 'deg)'">
                    <span class="viewer-depth"></span>
                    <img :src="currentImage" alt="عرض تفاعلي لهودي {{ $product->nameArabic }}">
                </div>
            </template>

            <template x-if="show3d">
                <model-viewer 
                    src="{{ $product->media->firstWhere('media_type', 'model3d')?->url ?? '/models/hoodie.glb' }}" 
                    alt="3D Model of {{ $product->nameArabic }}" 
                    auto-rotate 
                    camera-controls 
                    touch-action="pan-y"
                    style="width: 100%; height: 100%; min-height: 500px; background: #eeece7;">
                </model-viewer>
            </template>

            <div class="viewer-hint">
                <i data-lucide="hand" class="w-3.5 h-3.5"></i>
                <span>اسحب يمين / شمال لرؤية القطعة</span>
            </div>

            <!-- صور الزوايا المصغرة -->
            <div class="viewer-thumbnails">
                <button type="button" :class="{ 'active': currentImage === '{{ $product->image_url }}' && !show3d }" @click="currentImage = '{{ $product->image_url }}'; show3d = false">
                    <img src="{{ $product->image_url }}" alt="الواجهة الأمامية">
                </button>
                @foreach($product->media->where('media_type', '!=', 'model3d') as $media)
                    <button type="button" :class="{ 'active': currentImage === '{{ $media->url }}' && !show3d }" @click="currentImage = '{{ $media->url }}'; show3d = false">
                        <img src="{{ $media->url }}" alt="{{ $media->alt_text ?? 'زاوية إضافية' }}">
                    </button>
                @endforeach
                @if($product->media->contains('media_type', 'model3d'))
                    <button type="button" :class="{ 'active': show3d }" @click="show3d = true" class="flex items-center justify-center font-bold text-xs bg-slate-900 text-white">
                        3D
                    </button>
                @endif
            </div>

            <div class="media-caption">
                <span>INTERACTIVE VIEW</span>
                <span>MARJ OBJECT STUDY</span>
            </div>
        </div>

        <!-- تفاصيل وخيارات الشراء Detail Copy -->
        <div class="detail-copy">
            <p class="kicker">
                <span class="red-block"></span>
                {{ $product->name }} · {{ $product->stock_status === 'instock' ? 'متوفر' : 'كمية محدودة' }}
            </p>

            <h1>{{ $product->nameArabic }}</h1>

            <p class="detail-price">
                {{ $product->effective_price }} ج.م
                @if($product->compare_at_price)
                    <span class="text-slate-400 line-through text-xs mr-2">{{ $product->compare_at_price }} ج.م</span>
                @endif
                <span class="availability-badge">قطن مصري 100%</span>
            </p>

            <p class="detail-description">{{ $product->description }}</p>

            <div class="detail-rule"></div>

            <div class="detail-meta">
                <span>اللون</span>
                <strong>{{ $product->variants->first()?->color ?? 'أساسي' }}</strong>
                <span>القصة</span>
                <strong>Relaxed / Oversized</strong>
                <span>الخامة</span>
                <strong>420gsm Organic Cotton</strong>
            </div>

            <!-- اختيار المقاس Size Picker -->
            <div class="size-block">
                <div>
                    <span>اختار المقاس</span>
                    <button type="button" class="size-guide">
                        <i data-lucide="ruler" class="w-3.5 h-3.5"></i>
                        <span>دليل المقاسات</span>
                    </button>
                </div>

                <div class="size-list">
                    @foreach($product->variants as $variant)
                        <button type="button" 
                                :class="{ 'active': selectedSize === '{{ $variant->size }}' }"
                                @click="selectVariant({{ Js::from($variant) }})"
                                :disabled="{{ $variant->stock <= 0 ? 'true' : 'false' }}">
                            {{ $variant->size }}
                        </button>
                    @endforeach
                </div>
            </div>

            <!-- أزرار الشراء والتجربة -->
            <div class="detail-buy-actions">
                <form action="{{ route('cart.add') }}" method="POST" class="w-full">
                    @csrf
                    <input type="hidden" name="variant_id" :value="selectedVariantId">
                    <input type="hidden" name="quantity" value="1">
                    <button type="submit" class="detail-cart-button w-full flex items-center justify-between px-4" :disabled="selectedStock <= 0">
                        <span x-text="'أضف مقاس ' + selectedSize"></span>
                        <span>↙</span>
                    </button>
                </form>

                <a href="{{ route('home') }}?tryOn={{ $product->slug }}#try-on">
                    <button type="button" class="detail-try-button flex items-center justify-between px-4 w-full">
                        <span>شوفه عليك مجانًا</span>
                        <i data-lucide="sparkles" class="w-4 h-4"></i>
                    </button>
                </a>

                <button type="button" 
                        class="detail-favorite-button" 
                        :class="{ 'is-favorite': isWishlisted('{{ $product->slug }}') }" 
                        @click="toggleWishlist('{{ $product->slug }}')">
                    <i data-lucide="heart" class="w-4 h-4" :fill="isWishlisted('{{ $product->slug }}') ? 'currentColor' : 'none'"></i>
                    <span x-text="isWishlisted('{{ $product->slug }}') ? 'محفوظ' : 'مفضلة'"></span>
                </button>
            </div>

            <p class="detail-assurance">
                <i data-lucide="shield-check" class="w-4 h-4 text-[#0b7b8e]"></i>
                <span>تجربة Virtual Try-On مجانية — اختار صورتك وشوف القطعة قبل القرار.</span>
            </p>
        </div>
    </section>

    <!-- تفاصيل القطعة والمواصفات -->
    <section class="detail-information">
        <div class="section-label">
            <span>DETAILS / 01</span>
            <span>تفاصيل القطعة</span>
        </div>
        <div class="detail-info-grid">
            <div>
                <h2>مصممة<br><em>للاستخدام.</em></h2>
            </div>
            <div class="spec-list">
                <p><i data-lucide="check" class="w-4 h-4 text-[#0b7b8e]"></i> قطن عضوي ممشط 100% بملمس ناعم</p>
                <p><i data-lucide="check" class="w-4 h-4 text-[#0b7b8e]"></i> قصة واسعة مريحة (Unisex Oversized)</p>
                <p><i data-lucide="check" class="w-4 h-4 text-[#0b7b8e]"></i> حياكة مزدوجة وأساور مضلعة متينة</p>
                <p><i data-lucide="check" class="w-4 h-4 text-[#0b7b8e]"></i> العناية: غسيل بارد، مقلوباً، وتجفيف طبيعي</p>
            </div>
        </div>
    </section>

    <!-- المنتجات ذات الصلة -->
    @if(isset($relatedProducts) && $relatedProducts->isNotEmpty())
        <section class="related-products">
            <div class="section-heading">
                <div>
                    <p class="kicker">02 / قطع أخرى</p>
                    <h2>كمّل المجموعة.</h2>
                </div>
            </div>
            <div class="related-grid">
                @foreach($relatedProducts as $rel)
                    <a href="{{ route('products.show', $rel->slug) }}" class="related-card">
                        <img src="{{ $rel->image_url }}" alt="{{ $rel->nameArabic }}" loading="lazy">
                        <span>{{ $rel->nameArabic }}</span>
                        <strong>{{ $rel->effective_price }} ج.م</strong>
                    </a>
                @endforeach
            </div>
        </section>
    @endif
</div>
@endsection
