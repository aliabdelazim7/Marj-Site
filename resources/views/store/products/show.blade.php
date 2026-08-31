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
    tryOnPhoto: null,
    tryOnPhotoName: '',
    tryOnLoading: false,
    tryOnLoadingStep: '',
    tryOnResult: null,
    tryOnError: '',
    variants: {{ Js::from($product->variants) }},
    selectVariant(v) {
        this.selectedSize = v.size;
        this.selectedVariantId = v.id;
        this.selectedStock = v.stock;
    },
    handlePhotoSelect(e) {
        let file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            this.tryOnError = 'يرجى اختيار ملف صورة صالح (JPG أو PNG أو WebP).';
            return;
        }
        this.tryOnError = '';
        this.tryOnPhotoName = file.name;
        let reader = new FileReader();
        reader.onload = (event) => {
            this.tryOnPhoto = event.target.result;
            this.tryOnResult = null;
        };
        reader.readAsDataURL(file);
    },
    async runTryOn() {
        if (!this.tryOnPhoto) {
            this.tryOnError = 'يرجى اختيار صورة أولاً.';
            return;
        }
        this.tryOnError = '';
        this.tryOnLoading = true;
        this.tryOnLoadingStep = 'جاري تحليل زوايا الجسم والإضاءة...';

        try {
            setTimeout(() => { this.tryOnLoadingStep = 'جاري تركيب هودي {{ $product->nameArabic }} ومطابقة المقاس...'; }, 900);
            
            let response = await fetch('{{ route('try-on.generate') }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    product_id: {{ $product->id }},
                    image_base64: this.tryOnPhoto
                })
            });

            let data = await response.json();
            
            setTimeout(() => {
                this.tryOnLoading = false;
                if (data.success) {
                    this.tryOnResult = data.result_image_url || this.tryOnPhoto;
                } else {
                    this.tryOnError = data.message || 'تعذر إتمام المعاينة، يرجى تجربة صورة أخرى.';
                }
                if (window.lucide) lucide.createIcons();
            }, 1800);
        } catch (err) {
            this.tryOnLoading = false;
            this.tryOnError = 'حدث خطأ في الاتصال، يرجى المحاولة مجدداً.';
        }
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
                                :disabled="{{ $variant->stock <= 0 ? 'true' : 'false' }}"
                                class="py-3 rounded-2xl border text-center font-bold text-sm transition"
                                :class="selectedSize === '{{ $variant->size }}' 
                                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20' 
                                    : 'glass-panel text-white hover:border-white/30 {{ $variant->stock <= 0 ? 'opacity-40 cursor-not-allowed' : '' }}'">
                            <div>{{ $variant->size }}</div>
                            <div class="text-[10px] mt-0.5" :class="selectedSize === '{{ $variant->size }}' ? 'text-slate-900' : 'text-slate-400'">
                                @if($variant->stock > 0)
                                    متوفر
                                @else
                                    نفد
                                @endif
                            </div>
                        </button>
                    @endforeach
                </div>

                <!-- تحذير المخزون المتبقي -->
                <template x-if="selectedStock > 0 && selectedStock <= 5">
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
                <button type="button" @click="tryOnOpen = true" class="w-full py-3.5 rounded-2xl glass-panel border border-cyan-500/30 text-cyan-300 font-bold text-sm hover:bg-cyan-500/10 hover:border-cyan-500/60 transition flex items-center justify-center gap-2">
                    <i data-lucide="sparkles" class="w-4 h-4 text-cyan-400 animate-pulse"></i>
                    تجربة الهودي على صورتك (AI Virtual Try-On)
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

    <!-- نافذة تجربة القياس الافتراضي Modal التفاعلية -->
    <div x-show="tryOnOpen" x-cloak class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <div @click.outside="if(!tryOnLoading) tryOnOpen = false" class="max-w-lg w-full glass-panel rounded-3xl p-6 sm:p-8 space-y-5 border border-cyan-500/30 shadow-2xl relative">
            <!-- الهيدر -->
            <div class="flex items-center justify-between pb-3 border-b border-white/10">
                <h4 class="font-black text-white text-lg flex items-center gap-2">
                    <i data-lucide="sparkles" class="w-5 h-5 text-cyan-400 animate-spin"></i>
                    تجربة القياس الافتراضية الذكية
                </h4>
                <button @click="tryOnOpen = false" :disabled="tryOnLoading" class="text-slate-400 hover:text-white transition">
                    <i data-lucide="x" class="w-5 h-5"></i>
                </button>
            </div>

            <!-- وصف الخصوصية -->
            <p class="text-xs text-slate-300 leading-relaxed">
                ارفع صورة شخصية واضحة، وسيقوم الذكاء الاصطناعي بتركيب هودي <strong>{{ $product->nameArabic }}</strong> عليك مباشرة.
                <span class="text-cyan-300 font-semibold">🔒 خصوصيتك محمية بالكامل ولن يتم تخزين صورتك على الخادم.</span>
            </p>

            <!-- قسم رفع الصورة واختيارها -->
            <template x-if="!tryOnResult">
                <div class="space-y-4">
                    <div class="relative border-2 border-dashed rounded-2xl p-6 text-center transition"
                         :class="tryOnPhoto ? 'border-cyan-500/60 bg-cyan-500/5' : 'border-white/15 hover:border-cyan-500/40 bg-slate-900/50'">
                        <input type="file" accept="image/jpeg,image/png,image/webp" @change="handlePhotoSelect" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer">
                        
                        <template x-if="!tryOnPhoto">
                            <div class="space-y-2">
                                <i data-lucide="upload-cloud" class="w-10 h-10 mx-auto text-cyan-400"></i>
                                <div class="text-sm font-bold text-white">اضغط لاختيار صورة من جهازك</div>
                                <div class="text-xs text-slate-400">صيغ JPG, PNG, WebP (بحد أقصى 6 ميجابايت)</div>
                            </div>
                        </template>

                        <template x-if="tryOnPhoto">
                            <div class="space-y-3">
                                <img :src="tryOnPhoto" class="w-24 h-24 object-cover mx-auto rounded-xl border border-cyan-400 shadow-md">
                                <div class="text-xs font-bold text-cyan-300" x-text="tryOnPhotoName"></div>
                                <div class="text-[11px] text-slate-400">اضغط لاختيار صورة أخرى</div>
                            </div>
                        </template>
                    </div>

                    <!-- رسالة خطأ إن وجدت -->
                    <template x-if="tryOnError">
                        <div class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                            <i data-lucide="alert-circle" class="w-4 h-4 shrink-0"></i>
                            <span x-text="tryOnError"></span>
                        </div>
                    </template>

                    <!-- حالة التحميل والانتظار -->
                    <template x-if="tryOnLoading">
                        <div class="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-center space-y-2">
                            <div class="inline-block w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                            <div class="text-xs font-bold text-cyan-300" x-text="tryOnLoadingStep"></div>
                        </div>
                    </template>

                    <!-- زر التوليد -->
                    <button type="button" 
                            @click="runTryOn" 
                            :disabled="!tryOnPhoto || tryOnLoading"
                            class="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-950 font-black text-sm hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.01] transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <i data-lucide="sparkles" class="w-4 h-4"></i>
                        <span x-text="tryOnLoading ? 'جاري المعالجة بالذكاء الاصطناعي...' : 'توليد المعاينة الافتراضية'"></span>
                    </button>
                </div>
            </template>

            <!-- قسم عرض النتيجة بعد التوليد -->
            <template x-if="tryOnResult">
                <div class="space-y-4 animate-fade-in">
                    <div class="relative aspect-[3/4] max-h-80 w-full rounded-2xl overflow-hidden glass-panel border border-cyan-500/40 bg-slate-950 flex items-center justify-center">
                        <img :src="tryOnResult" class="w-full h-full object-contain">
                        
                        <div class="absolute bottom-3 right-3 left-3 p-2.5 rounded-xl bg-slate-950/80 backdrop-blur border border-white/10 flex items-center justify-between text-xs">
                            <span class="font-bold text-white flex items-center gap-1.5">
                                <i data-lucide="check-circle" class="w-4 h-4 text-emerald-400"></i>
                                هودي {{ $product->nameArabic }}
                            </span>
                            <span class="text-cyan-400 font-bold">{{ $product->effective_price }} ج.م</span>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-3">
                        <a :href="tryOnResult" download="marj-tryon-{{ $product->slug }}.jpg" class="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition">
                            <i data-lucide="download" class="w-4 h-4"></i>
                            تحميل الصورة
                        </a>
                        <button type="button" @click="tryOnResult = null" class="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition">
                            <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
                            صورة أخرى
                        </button>
                    </div>

                    <form action="{{ route('cart.add') }}" method="POST">
                        @csrf
                        <input type="hidden" name="variant_id" :value="selectedVariantId">
                        <input type="hidden" name="quantity" value="1">
                        <button type="submit" class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-600 text-slate-950 font-black text-sm hover:shadow-lg transition flex items-center justify-center gap-2">
                            <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                            أضف هذا المقاس للسلة فوراً
                        </button>
                    </form>
                </div>
            </template>
        </div>
    </div>
</div>
@endsection
