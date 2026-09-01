<!DOCTYPE html>
<html lang="ar" dir="rtl" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">
    <title>@yield('title', 'مرج — الهودي اللي عليك')</title>
    
    <!-- Meta Tags -->
    <meta name="description" content="@yield('meta_description', 'ملابس يومية مستوحاة من البحر والموج مع تجربة قياس افتراضية بالذكاء الاصطناعي')">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Google Fonts: IBM Plex Sans Arabic & Space Grotesk -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Tailwind CSS (Play CDN) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['"IBM Plex Sans Arabic"', 'sans-serif'],
                        display: ['"Space Grotesk"', '"IBM Plex Sans Arabic"', 'sans-serif'],
                    },
                    colors: {
                        marj: {
                            bg: '#f5f8f6',
                            card: '#e7f0ed',
                            ink: '#0b2631',
                            primary: '#0b7b8e',
                            red: '#db2f27',
                            paper: '#f9fcfa',
                            muted: '#587077',
                            border: '#123a46',
                        }
                    }
                }
            }
        }
    </script>

    <!-- Master CSS Stylesheet -->
    <link rel="stylesheet" href="/css/style.css">

    <!-- Alpine.js & Lucide Icons -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>

    <!-- 3D Model Viewer Web Component -->
    <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script>

    <style>
        [x-cloak] { display: none !important; }
    </style>
</head>
<body class="selection:bg-[#0b7b8e] selection:text-white" x-data="{ 
    cartDrawerOpen: false,
    wishlistCount: 0,
    wishlist: JSON.parse(localStorage.getItem('marj_wishlist') || '[]'),
    toggleWishlist(slug) {
        let idx = this.wishlist.indexOf(slug);
        if (idx > -1) {
            this.wishlist.splice(idx, 1);
        } else {
            this.wishlist.push(slug);
        }
        localStorage.setItem('marj_wishlist', JSON.stringify(this.wishlist));
        this.wishlistCount = this.wishlist.length;
    },
    isWishlisted(slug) {
        return this.wishlist.includes(slug);
    }
}" x-init="wishlistCount = wishlist.length">

    <div class="site-shell">
        <!-- Header الناف بار الرسمي الأصلي -->
        <header class="site-header container">
            <a class="brand" href="{{ route('home') }}" aria-label="مرج الرئيسية">
                <span class="brand-wordmark text-2xl font-bold tracking-tighter">مرج</span>
            </a>

            <nav class="main-nav" aria-label="التنقل الرئيسي">
                <a href="{{ route('products.index') }}" class="{{ request()->routeIs('products.*') ? 'font-bold' : '' }}">المنتجات</a>
                <a href="{{ route('lookbook') }}" class="{{ request()->routeIs('lookbook') ? 'font-bold' : '' }}">Lookbook</a>
                <a href="{{ route('home') }}#try-on">جرّبه عليك</a>
                <a href="{{ route('track-order') }}" class="{{ request()->routeIs('track-order') ? 'font-bold' : '' }}">طلباتي</a>
            </nav>

            <div class="header-actions">
                @auth
                    @if(auth()->user()->isAdmin() || auth()->user()->teamMember)
                        <a class="header-account-button text-xs font-bold px-2.5 py-1 border border-slate-900 hover:bg-slate-900 hover:text-white transition" href="{{ route('admin.dashboard') }}">
                            لوحة الإدارة
                        </a>
                    @endif
                    <a class="header-account-button" href="{{ route('account.index') }}" aria-label="فتح حسابي">
                        <i data-lucide="user" class="w-4 h-4"></i>
                    </a>
                @else
                    <a class="header-account-button" href="{{ route('login') }}" aria-label="تسجيل الدخول">
                        <i data-lucide="user" class="w-4 h-4"></i>
                    </a>
                @endauth

                <!-- زر المفضلة -->
                <a class="header-favorites-button" href="{{ route('products.index') }}" aria-label="المفضلة">
                    <i data-lucide="heart" class="w-4 h-4" :fill="wishlistCount > 0 ? 'currentColor' : 'none'"></i>
                    <b x-text="wishlistCount">0</b>
                </a>

                <!-- زر السلة -->
                <button type="button" class="header-cart-button" @click="cartDrawerOpen = true" aria-label="فتح السلة">
                    <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                    <span>السلة</span>
                    <b>{{ $cartItemsCount }}</b>
                </button>
            </div>
        </header>

        <!-- الإشعارات والتنبيهات -->
        @if(session('success'))
            <div class="container mt-4">
                <div class="p-4 bg-[#e7f0ed] border border-[#0b7b8e] text-[#0b2631] text-sm flex items-center gap-2 font-medium">
                    <i data-lucide="check-circle" class="w-4 h-4 text-[#0b7b8e]"></i>
                    <span>{{ session('success') }}</span>
                </div>
            </div>
        @endif

        @if(session('error'))
            <div class="container mt-4">
                <div class="p-4 bg-[#fdf2f2] border border-[#db2f27] text-[#923a36] text-sm flex items-center gap-2 font-medium">
                    <i data-lucide="alert-circle" class="w-4 h-4 text-[#db2f27]"></i>
                    <span>{{ session('error') }}</span>
                </div>
            </div>
        @endif

        <!-- المحتوى الرئيسي -->
        <main>
            @yield('content')
        </main>

        <!-- الفوتر الأصلي -->
        <footer class="site-footer container">
            <a class="brand" href="{{ route('home') }}">
                <span class="brand-wordmark font-bold text-lg">مرج</span>
            </a>
            <p class="text-xs text-[#555]">قطعة واضحة. وموجة أقرب لك.</p>
            <span class="text-xs font-mono">© {{ date('Y') }} MARJ</span>
        </footer>

        <!-- درج السلة الجانبي Cart Drawer -->
        <div class="cart-drawer-backdrop" :class="{ 'is-open': cartDrawerOpen }" @click="cartDrawerOpen = false">
            <div class="cart-drawer" @click.stop>
                <div class="cart-drawer-head">
                    <div>
                        <span class="eyebrow text-xs text-[#777]">سلة التسوق</span>
                        <h2 class="font-bold text-2xl mt-1 text-[#111]">مشترياتك ({{ $cartItemsCount }})</h2>
                    </div>
                    <button type="button" @click="cartDrawerOpen = false" class="text-slate-500 hover:text-black">
                        <i data-lucide="x" class="w-6 h-6"></i>
                    </button>
                </div>

                @if(!$cart || $cart->items->isEmpty())
                    <div class="cart-drawer-empty p-8 text-center space-y-3">
                        <i data-lucide="shopping-bag" class="w-12 h-12 mx-auto text-slate-400"></i>
                        <p class="text-sm text-slate-500 font-medium">سلة مشترياتك فارغة حالياً</p>
                        <a href="{{ route('products.index') }}" @click="cartDrawerOpen = false" class="text-xs font-bold text-[#0b7b8e] hover:underline">
                            تصفح تشكيلة الهوديز ↙
                        </a>
                    </div>
                @else
                    <div class="cart-drawer-lines">
                        @foreach($cart->items as $item)
                            <div class="drawer-line">
                                <img src="{{ $item->variant?->product?->image_url }}" alt="{{ $item->variant?->product?->nameArabic }}" class="object-cover bg-[#eeece7]">
                                <div>
                                    <h4 class="font-bold text-sm text-[#111]">{{ $item->variant?->product?->nameArabic }}</h4>
                                    <span class="text-xs text-slate-500">مقاس: {{ $item->variant?->size }} | {{ $item->variant?->color }}</span>
                                    <div class="font-bold text-xs text-[#111] mt-1">{{ $item->unit_price }} ج.م</div>
                                </div>
                                <form action="{{ route('cart.remove', $item->id) }}" method="POST">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="p-1 text-slate-400 hover:text-rose-600 transition" title="حذف">
                                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                                    </button>
                                </form>
                            </div>
                        @endforeach
                    </div>

                    <div class="cart-drawer-foot">
                        <div>
                            <span class="font-medium text-sm text-slate-600">المجموع الفرعي:</span>
                            <strong class="font-bold text-lg text-[#111]">{{ $cart->subtotal }} ج.م</strong>
                        </div>
                        <p class="text-[11px] text-slate-500">الشحن يُحسب في الخطوة القادمة (شحن مجاني فوق {{ $storeSettings->free_shipping_threshold ?? 2000 }} ج.م)</p>
                        <a href="{{ route('checkout.index') }}" class="w-full py-3.5 bg-[#0b7b8e] hover:bg-[#085a68] text-white text-center font-bold text-sm transition block">
                            متابعة الدفع والشحن ↙
                        </a>
                    </div>
                @endif
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            if (window.lucide) lucide.createIcons();
        });
        document.addEventListener('alpine:initialized', () => {
            if (window.lucide) lucide.createIcons();
        });
    </script>
    @stack('scripts')
</body>
</html>
