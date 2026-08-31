@extends('layouts.app')

@section('title', $product->nameArabic . ' (' . $product->name . ') — ' . ($storeSettings->brand_name ?? 'مرج'))
@section('meta_description', $product->short_description ?? $product->description)

@section('content')
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16" x-data="{
    selectedSize: '{{ $product->variants->firstWhere('stock', '>', 0)?->size ?? 'M' }}',
    selectedVariantId: {{ $product->variants->firstWhere('stock', '>', 0)?->id ?? $product->variants->first()?->id ?? 1 }},
    selectedStock: {{ $product->variants->firstWhere('stock', '>', 0)?->stock ?? 0 }},
    currentImage: '{{ $product->image_url }}',
    show3d: false,
    tryOnOpen: false,
    tryOnImage: null,
    tryOnLoading: false,
    tryOnResult: null,
    variants: {{ Js::from($product->variants) }},
    selectVariant(v) {
        this.selectedSize = v.size;
        this.selectedVariantId = v.id;
        this.selectedStock = v.stock;
    }
}">
    <!-- تفاصيل المنتج الأساسية -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        <!-- معرض الصور وعارض 3D -->
        <div class="space-y-4">
            <div class="relative aspect-square rounded-3xl overflow-hidden glass-panel border border-white/10 bg-slate-900 flex items-center justify-center">
                <!-- الصورة الرئيسية العادية -->
                <template x-if="!show3d">
                    <img :src="currentImage" alt="{{ $product->nameArabic }}" class="w-full h-full object-cover">
                </template>

                <!-- عارض 3D Model Viewer إذا كان مفعلاً -->
                <template x-if="show3d">
                    <model-viewer 
                        src="{{ $product->media->firstWhere('media_type', 'model3d')?->url ?? '/models/hoodie.glb' }}" 
                        alt="3D Model of {{ $product->nameArabic }}" 
                        auto-rotate 
                        camera-controls 
                        touch-action="pan-y"
                        class="w-full h-full bg-slate-950">
                    </model-viewer>
                </template>

                <!-- زر التبديل بين 3D والصور -->
                @if($product->media->contains('media_type', 'model3d'))
                    <button @click="show3d = !show3d" class="absolute top-4 left-4 px-3.5 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5 hover:bg-cyan-500 hover:text-slate-950 transition">
                        <i data-lucide="box" class="w-4 h-4"></i>
                        <span x-text="show3d ? 'عرض الصور' : 'معاينة 3D'"></span>
                    </button>
                @endif
            </div>

            <!-- صور المعرض المصغرة -->
            <div class="flex items-center gap-3 overflow-x-auto pb-2">
                <button @click="currentImage = '{{ $product->image_url }}'; show3d = false" class="w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0" :class="currentImage === '{{ $product->image_url }}' && !show3d ? 'border-cyan-400' : 'border-white/10'">
                    <img src="{{ $product->image_url }}" class="w-full h-full object-cover">
                </button>
                @foreach($product->media->where('media_type', '!=', 'model3d') as $media)
                    <button @click="currentImage = '{{ $media->url }}'; show3d = false" class="w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0" :class="currentImage === '{{ $media->url }}' && !show3d ? 'border-cyan-400' : 'border-white/10'">
                        <img src="{{ $media->url }}" class="w-full h-full object-cover">
                    </button>
                @endforeach
            </div>
        </div>

        <!-- مواصفات المنتج والشراء -->
        <div class="space-y-6">
            <div>
                <span class="text-xs font-bold text-cyan-400 uppercase tracking-widest">{{ $product->category }}</span>
                <h1 class="text-3xl sm:text-4xl font-black text-white mt-1">{{ $product->nameArabic }}</h1>
                <div class="text-sm text-slate-400 mt-0.5">{{ $product->name }}</div>
            </div>

            <!-- السعر -->
            <div class="flex items-baseline gap-3">
                <span class="text-3xl font-black text-white">{{ $product->effective_price }} <span class="text-sm font-normal text-slate-400">ج.م</span></span>
                @if($product->compare_at_price)
                    <span class="text-base text-slate-500 line-through">{{ $product->compare_at_price }} ج.م</span>
                    <span class="px-2 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold">
                        وفر {{ $product->compare_at_price - $product->effective_price }} ج.م
                    </span>
                @endif
            </div>

            <p class="text-slate-300 text-sm leading-relaxed">{{ $product->description }}</p>

            <!-- اختيار المقاس Size Picker -->
            <div class="space-y-3 pt-4 border-t border-white/5">
                <div class="flex items-center justify-between text-sm">
                    <span class="font-bold text-white">اختر المقاس:</span>
                    <span class="text-xs text-slate-400">قصة مريحة واسعة (Oversized)</span>
                </div>

                <div class="grid grid-cols-4 gap-3">
                    @foreach($product->variants as $variant)
                        <button type="button" 
                                @click="selectVariant({{ Js::from($variant) }})"
                                class="py-3 rounded-2xl text-sm font-black border transition flex flex-col items-center justify-center gap-1"
                                :class="selectedSize === '{{ $variant->size }}' ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20' : 'bg-slate-900/80 text-white border-white/10 hover:border-white/20'">
                            <span>{{ $variant->size }}</span>
                            <span class="text-[10px] font-normal" :class="selectedSize === '{{ $variant->size }}' ? 'text-slate-900' : 'text-slate-400'">
                                @if($variant->stock <= 0)
                                    غير متوفر
                                @elseif($variant->isLowStock())
                                    متبقي {{ $variant->stock }}
                                @else
                                    متوفر
                                @endif
                            </span>
                        </button>
                    @endforeach
                </div>

                <!-- تنبيه قلة المخزون -->
                <template x-if="selectedStock > 0 && selectedStock <= 3">
                    <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
                        <i data-lucide="alert-triangle" class="w-4 h-4 shrink-0"></i>
                        <span>سارع بالطلب! متبقي <strong x-text="selectedStock"></strong> قطع فقط في هذا المقاس.</span>
                    </div>
                </template>
            </div>

            <!-- أزرار الإضافة للسلة والقياس الافتراضي -->
            <div class="space-y-3 pt-4">
                <form action="{{ route('cart.add') }}" method="POST">
                    @csrf
                    <input type="hidden" name="variant_id" :value="selectedVariantId">
                    <input type="hidden" name="quantity" value="1">
                    
                    <button type="submit" 
                            :disabled="selectedStock <= 0"
                            class="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-950 font-black text-base hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <i data-lucide="shopping-bag" class="w-5 h-5"></i>
                        <span x-text="selectedStock > 0 ? 'إضافة إلى سلة المشتريات' : 'المقاس غير متوفر حالياً'"></span>
                    </button>
                </form>

                <!-- زر تجربة القياس بالذكاء الاصطناعي -->
                <button type="button" @click="tryOnOpen = true" class="w-full py-3 rounded-2xl glass-panel text-cyan-300 font-bold text-sm hover:bg-white/10 hover:border-cyan-500/40 transition flex items-center justify-center gap-2">
                    <i data-lucide="sparkles" class="w-4 h-4"></i>
                    تجربة الهودي على صورتك (AI Try-On)
                </button>
            </div>
        </div>
    </div>

    <!-- مراجعات وتقييمات المشترين الموثقة -->
    <div class="mt-20 pt-12 border-t border-white/5">
        <div class="flex items-center justify-between mb-8">
            <div>
                <h3 class="text-2xl font-black text-white">آراء المشترين الموثقة</h3>
                <p class="text-xs text-slate-400 mt-0.5">تقييمات حقيقية من عملاء استلموا هذا الهودي.</p>
            </div>
        </div>

        @if($product->approvedReviews->isEmpty())
            <div class="p-8 rounded-2xl glass-panel text-center text-sm text-slate-400">
                كن أول من يقيّم هذا الهودي بعد استلام طلبك!
            </div>
        @else
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                @foreach($product->approvedReviews as $rev)
                    <div class="p-5 rounded-2xl glass-panel space-y-3">
                        <div class="flex items-center justify-between">
                            <span class="font-bold text-sm text-white">{{ $rev->customer_name }}</span>
                            <div class="flex text-amber-400 text-xs">
                                @for($i = 0; $i < $rev->rating; $i++) ★ @endfor
                            </div>
                        </div>
                        <p class="text-xs text-slate-300 leading-relaxed">{{ $rev->body }}</p>
                        <div class="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                            <i data-lucide="badge-check" class="w-3.5 h-3.5"></i>
                            مشتري موثق
                        </div>
                    </div>
                @endforeach
            </div>
        @endif
    </div>

    <!-- نافذة تجربة القياس الافتراضي Modal -->
    <div x-show="tryOnOpen" x-cloak class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <div @click.outside="tryOnOpen = false" class="max-w-md w-full glass-panel rounded-3xl p-6 space-y-4 border border-white/10">
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <h4 class="font-black text-white text-base flex items-center gap-2">
                    <i data-lucide="sparkles" class="w-4 h-4 text-cyan-400"></i>
                    تجربة القياس الافتراضية
                </h4>
                <button @click="tryOnOpen = false" class="text-slate-400 hover:text-white">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <p class="text-xs text-slate-300 leading-relaxed">
                ارفع صورتك وسيقوم الذكاء الاصطناعي بتركيب هودي <strong>{{ $product->nameArabic }}</strong> عليك مباشرة دون حفظ صورتك على السيرفر حفاظاً على الخصوصية.
            </p>

            <input type="file" accept="image/*" class="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-500/10 file:text-cyan-300 hover:file:bg-cyan-500/20">

            <button type="button" class="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-950 font-bold text-sm">
                توليد المعاينة الافتراضية
            </button>
        </div>
    </div>
</div>
@endsection
