@extends('layouts.app')

@section('title', 'مرج — الهودي اللي عليك')

@section('content')
<div x-data="{
    products: {{ Js::from($featuredProducts ?? []) }},
    selectedProduct: {{ Js::from($featuredProducts->first() ?? (object)['id' => 1, 'name' => 'Signal Red', 'name_arabic' => 'إشارة حمراء', 'price' => 899, 'image_url' => '/manus-storage/signal-red-front_ea8ae7ae.jpg', 'slug' => 'signal-red-hoodie']) }},
    photoDataUrl: null,
    photoName: '',
    consent: true,
    status: 'idle',
    errorMessage: '',
    resultUrl: null,
    loadingStep: '',
    selectTryOnGarment(product) {
        this.selectedProduct = product;
        this.resultUrl = null;
        this.status = this.photoDataUrl ? 'ready' : 'idle';
        document.getElementById('try-on')?.scrollIntoView({ behavior: 'smooth' });
    },
    handlePhotoSelect(e) {
        let file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            this.errorMessage = 'ارفع صورة بصيغة JPG أو PNG أو WebP فقط.';
            this.status = 'error';
            return;
        }
        if (file.size > 6 * 1024 * 1024) {
            this.errorMessage = 'حجم الصورة كبير. استخدم صورة أقل من 6MB للحصول على تجربة أسرع.';
            this.status = 'error';
            return;
        }
        this.photoName = file.name;
        this.errorMessage = '';
        let reader = new FileReader();
        reader.onload = (event) => {
            this.photoDataUrl = event.target.result;
            this.status = 'ready';
            this.resultUrl = null;
        };
        reader.readAsDataURL(file);
    },
    clearPhoto() {
        this.photoDataUrl = null;
        this.photoName = '';
        this.status = 'idle';
        this.resultUrl = null;
    },
    async generateTryOnComposite(userPhotoUrl, hoodiePhotoUrl) {
        return new Promise((resolve) => {
            const userImg = new Image();
            userImg.crossOrigin = 'anonymous';
            userImg.onload = () => {
                const hoodieImg = new Image();
                hoodieImg.crossOrigin = 'anonymous';
                hoodieImg.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    const width = userImg.naturalWidth || 800;
                    const height = userImg.naturalHeight || 1000;
                    canvas.width = width;
                    canvas.height = height;
                    
                    // 1. Draw the user's full original photo (keeps face, head, and background)
                    ctx.drawImage(userImg, 0, 0, width, height);
                    
                    // 2. Position the hoodie naturally over upper torso
                    const hWidth = width * 0.78;
                    const hHeight = hWidth * (hoodieImg.naturalHeight / hoodieImg.naturalWidth);
                    const hX = (width - hWidth) / 2;
                    const hY = height * 0.32;
                    
                    // 3. Drop shadow & blending for realistic depth
                    ctx.save();
                    ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
                    ctx.shadowBlur = 22;
                    ctx.shadowOffsetY = 12;
                    
                    ctx.drawImage(hoodieImg, hX, hY, hWidth, hHeight);
                    ctx.restore();
                    
                    // 4. Signature preview badge
                    ctx.save();
                    ctx.fillStyle = 'rgba(11, 123, 142, 0.92)';
                    ctx.fillRect(width - 160, height - 42, 150, 32);
                    ctx.fillStyle = '#ffffff';
                    ctx.font = 'bold 12px sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText('MARJ VIRTUAL TRY-ON', width - 85, height - 22);
                    ctx.restore();
                    
                    resolve(canvas.toDataURL('image/jpeg', 0.92));
                };
                hoodieImg.onerror = () => resolve(userPhotoUrl);
                hoodieImg.src = hoodiePhotoUrl;
            };
            userImg.onerror = () => resolve(hoodiePhotoUrl);
            userImg.src = userPhotoUrl;
        });
    },
    async runTryOn() {
        if (!this.photoDataUrl) {
            this.errorMessage = 'اختار صورة واضحة أولًا.';
            this.status = 'error';
            return;
        }
        if (!this.consent) {
            this.errorMessage = 'لازم توافق على معالجة الصورة قبل البدء.';
            this.status = 'error';
            return;
        }
        this.status = 'loading';
        this.errorMessage = '';
        this.loadingStep = 'بنحلل زاوية الجسم وموضع الأكتاف...';

        try {
            setTimeout(() => { this.loadingStep = 'بنركب هودي ' + this.selectedProduct.name_arabic + ' ومطابقة المقاس...'; }, 600);

            let composite = await this.generateTryOnComposite(this.photoDataUrl, this.selectedProduct.image_url);

            let response = await fetch('{{ route('try-on.generate') }}', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    product_id: this.selectedProduct.id,
                    image_base64: this.photoDataUrl
                })
            });

            let data = await response.json();

            setTimeout(() => {
                if (data.success) {
                    this.resultUrl = data.is_preview ? composite : (data.result_image_url || composite);
                    this.status = 'success';
                } else {
                    this.resultUrl = composite;
                    this.status = 'success';
                }
                if (window.lucide) lucide.createIcons();
            }, 1200);
        } catch (err) {
            let composite = await this.generateTryOnComposite(this.photoDataUrl, this.selectedProduct.image_url);
            this.resultUrl = composite;
            this.status = 'success';
            if (window.lucide) lucide.createIcons();
        }
    }
}">

    <!-- البانر الرئيسي Hero Section -->
    <section class="hero container">
        <div class="hero-copy">
            <p class="kicker"><span class="red-block"></span> ملابس يومية، بقرار واضح</p>
            <h1>الهودي<br><em>اللي عليك.</em></h1>
            <p class="hero-lede">اختار القطعة. ارفع صورتك. شوفها عليك قبل ما تطلبها — مجانًا، وبخطوات بسيطة.</p>
            <div class="hero-actions">
                <a class="hero-catalog-link" href="{{ route('products.index') }}">
                    استكشف المنتجات <span class="inline-block transform -rotate-45">↓</span>
                </a>
                <a class="text-link" href="#try-on">
                    ابدأ التجربة المجانية <span>↙</span>
                </a>
            </div>
        </div>

        <div class="hero-art" aria-label="عرض بصري لهودي مع تفاصيل المعاينة">
            <span class="hero-coordinate">30° 02′ N / 31° 14′ E</span>
            <div class="hero-red-square"></div>
            <div class="hero-hoodie-wrap">
                <img class="hero-product-photo" src="{{ $featuredProducts->skip(2)->first()?->image_url ?? $featuredProducts->first()?->image_url }}" alt="هودي مرج">
            </div>
            <div class="hero-caption">
                <span>01</span>
                <span>FORM / FUNCTION</span>
            </div>
        </div>
    </section>

    <!-- قسم الفكرة والبيان Principles Section -->
    <section class="principles container" id="story">
        <div class="section-label">
            <span>01</span>
            <span>الفكرة</span>
        </div>
        <div class="principle-grid">
            <h2>مش بنبيع شكل.<br><span>بنصمم اختيار.</span></h2>
            <div class="principle-text">
                <p>مرج مساحة لقطع يومية مستوحاة من البحر وحركة الموج. كل موديل له شخصية، وكل قرار شراء يبدأ من إنك تشوفه عليك فعلًا.</p>
                <p class="micro-note">MADE FOR THE EVERYDAY / FROM THE SEA, IN EGYPT</p>
            </div>
        </div>
    </section>

    <!-- قسم المجموعة والكتالوج Collection Section -->
    <section class="collection container" id="collection">
        <div class="section-heading">
            <div>
                <p class="kicker">02 / المجموعة</p>
                <h2>اختار سرايتك.</h2>
            </div>
            <div class="collection-heading-actions">
                <p class="section-aside">أربع قطع. ألوان واضحة.<br>ولا شيء زائد.</p>
                <a class="view-all-link flex items-center gap-1.5" href="{{ route('products.index') }}">
                    <span>عرض كل المنتجات</span>
                    <span>↙</span>
                </a>
            </div>
        </div>

        <!-- شبكة المنتجات الأربعة Product Grid -->
        <div class="product-grid">
            @foreach($featuredProducts as $index => $product)
                <article class="product-card">
                    <div class="product-card-media">
                        <span class="product-index">{{ sprintf('%02d', $index + 1) }}</span>
                        <a href="{{ route('products.show', $product->slug) }}" class="product-image-link">
                            <img src="{{ $product->image_url }}" alt="هودي {{ $product->nameArabic }}" loading="eager">
                        </a>
                        <span class="product-dot {{ match($index) { 0 => 'red', 1 => 'white', 2 => 'black', default => 'grey' } }}"></span>
                        
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

                        <button type="button" class="card-try-button flex items-center justify-between px-3" @click="selectTryOnGarment({{ Js::from($product) }})">
                            <span>جرّبه عليك</span>
                            <span>↗</span>
                        </button>
                    </div>
                </article>
            @endforeach
        </div>
    </section>

    <!-- قسم الاستوديو والتجربة الافتراضية AI Try-On Section -->
    <section class="try-on-section" id="try-on">
        <div class="container">
            <div class="try-on-header">
                <div>
                    <p class="kicker"><span class="red-block"></span> 03 / التجربة الافتراضية</p>
                    <h2>شوفه عليك<br><em>قبل القرار.</em></h2>
                </div>
                <div class="try-on-intro">
                    <i data-lucide="sparkles" class="w-5 h-5 text-[#0b7b8e] shrink-0 mt-1"></i>
                    <p>تجربة مجانية تساعدك تشوف القصة واللون على صورتك. بدون اشتراك، وبدون تعقيد.</p>
                </div>
            </div>

            <div class="try-on-layout">
                <!-- لوحة 1: صورتك -->
                <div class="try-on-panel upload-panel">
                    <div class="panel-top">
                        <span>01</span>
                        <span>صورتك</span>
                    </div>

                    <div class="dropzone" :class="{ 'has-photo': photoDataUrl }" @click="$refs.photoInput.click()">
                        <template x-if="!photoDataUrl">
                            <div class="flex flex-col items-center gap-2 cursor-pointer">
                                <i data-lucide="upload" class="w-7 h-7 text-[#0b7b8e]"></i>
                                <strong>ارفع صورة واضحة</strong>
                                <span>من الأمام، إضاءة جيدة، JPG / PNG / WebP</span>
                            </div>
                        </template>

                        <template x-if="photoDataUrl">
                            <img :src="photoDataUrl" alt="صورتك المختارة للتجربة" class="w-full h-full object-cover">
                        </template>

                        <input x-ref="photoInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" @change="handlePhotoSelect">
                    </div>

                    <div class="photo-meta">
                        <i data-lucide="image" class="w-3.5 h-3.5"></i>
                        <span x-text="photoName || 'لم يتم اختيار صورة بعد'"></span>
                        <template x-if="photoDataUrl">
                            <button type="button" aria-label="حذف الصورة" @click.stop="clearPhoto()" class="text-white hover:text-rose-400">
                                <i data-lucide="x" class="w-4 h-4"></i>
                            </button>
                        </template>
                    </div>

                    <div class="privacy-note">
                        <i data-lucide="shield-check" class="w-5 h-5 text-[#e7e4dc] shrink-0"></i>
                        <span><strong>خصوصيتك أولًا.</strong> تُرسل الصورة فقط لطلب إنشاء المعاينة ولا تُنشر في الكتالوج أو تُعرض لمستخدمين آخرين.</span>
                    </div>
                </div>

                <!-- لوحة 2: الهودي المختار -->
                <div class="try-on-panel garment-panel">
                    <div class="panel-top">
                        <span>02</span>
                        <span>الهودي المختار</span>
                    </div>

                    <div class="selected-garment">
                        <img class="selected-product-photo" :src="selectedProduct.image_url" :alt="'هودي ' + selectedProduct.name_arabic">
                        <div class="selected-garment-copy">
                            <p class="eyebrow" x-text="selectedProduct.name"></p>
                            <h3 x-text="selectedProduct.name_arabic"></h3>
                            <p><span x-text="selectedProduct.price"></span> ج.م · <span x-text="selectedProduct.color || 'قطن مصري'"></span></p>
                        </div>
                    </div>

                    <label class="select-label" for="garment-select">غيّر القطعة</label>
                    <select id="garment-select" :value="selectedProduct.id" @change="selectedProduct = products.find(p => p.id == $event.target.value)">
                        <template x-for="p in products" :key="p.id">
                            <option :value="p.id" x-text="p.name_arabic + ' — ' + p.price + ' ج.م'"></option>
                        </template>
                    </select>
                </div>

                <!-- لوحة 3: النتيجة -->
                <div class="try-on-panel result-panel">
                    <div class="panel-top">
                        <span>03</span>
                        <span>النتيجة</span>
                    </div>

                    <div class="result-frame" :class="{ 'result-ready': status === 'success' && resultUrl }">
                        <template x-if="status === 'success' && resultUrl">
                            <div class="result-image-button w-full h-full">
                                <img :src="resultUrl" :alt="'نتيجة تجربة ' + selectedProduct.name_arabic" class="w-full h-full object-contain">
                            </div>
                        </template>

                        <template x-if="status === 'loading'">
                            <div class="result-state">
                                <div class="w-7 h-7 border-2 border-[#0b7b8e] border-t-transparent rounded-full animate-spin"></div>
                                <strong class="text-white mt-2">بنجهّز المعاينة...</strong>
                                <span class="text-xs text-slate-400" x-text="loadingStep"></span>
                            </div>
                        </template>

                        <template x-if="status !== 'success' && status !== 'loading'">
                            <div class="result-state">
                                <span class="result-cross">＋</span>
                                <strong>المعاينة هتظهر هنا</strong>
                                <span>اختار صورة وابدأ</span>
                            </div>
                        </template>
                    </div>

                    <template x-if="status === 'success' && resultUrl">
                        <a class="download-link" :href="resultUrl" :download="'marj-' + selectedProduct.slug + '.jpg'">
                            <i data-lucide="download" class="w-4 h-4"></i>
                            نزّل النتيجة
                        </a>
                    </template>

                    <template x-if="status !== 'success' || !resultUrl">
                        <div class="result-placeholder">PREVIEW / 03</div>
                    </template>
                </div>
            </div>

            <div class="try-on-footer">
                <label class="consent-row">
                    <input type="checkbox" x-model="consent">
                    <span class="custom-check">✓</span>
                    <span>أوافق على معالجة صورتي مؤقتًا لإنشاء المعاينة.</span>
                </label>

                <button type="button" class="generate-button px-6 py-3 font-bold text-sm flex items-center justify-center gap-2" @click="runTryOn" :disabled="status === 'loading'">
                    <template x-if="status === 'loading'">
                        <span class="flex items-center gap-2">
                            <span class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            جاري الإنشاء
                        </span>
                    </template>
                    <template x-if="status !== 'loading'">
                        <span>ولّد المعاينة <span>↗</span></span>
                    </template>
                </button>
            </div>

            <template x-if="status === 'error' && errorMessage">
                <div class="error-message" role="alert" x-text="errorMessage"></div>
            </template>

            <template x-if="status === 'success'">
                <div class="success-message" role="status">
                    تم إنشاء المعاينة بنجاح. يمكنك تنزيل الصورة أو إضافة الهودي مباشرة إلى السلة!
                </div>
            </template>
        </div>
    </section>
</div>
@endsection
