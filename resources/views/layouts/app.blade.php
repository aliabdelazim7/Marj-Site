<!DOCTYPE html>
<html lang="ar" dir="rtl" class="dark scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1">
    <title>@yield('title', config('marj.brand_name') . ' — متجر الهوديز وتجربة اللبس الافتراضية')</title>
    
    <!-- Meta Tags -->
    <meta name="description" content="@yield('meta_description', config('marj.tagline'))">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <!-- Google Fonts: Tajawal & Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">

    <!-- Tailwind CSS (Play CDN with Marj Theme) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Tajawal', 'Plus Jakarta Sans', 'sans-serif'],
                    },
                    colors: {
                        marj: {
                            50: '#f0fdfa',
                            100: '#ccfbf1',
                            200: '#99f6e4',
                            300: '#5eead4',
                            400: '#2dd4bf',
                            500: '#14b8a6',
                            600: '#0d9488',
                            700: '#0f766e',
                            800: '#115e59',
                            900: '#134e4a',
                            ocean: '#0a1128',
                            deep: '#060d1f',
                            wave: '#06b6d4',
                            cyan: '#22d3ee',
                        }
                    }
                }
            }
        }
    </script>

    <!-- Alpine.js & Lucide Icons -->
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.14.8/dist/cdn.min.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>

    <!-- 3D Model Viewer Web Component -->
    <script type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js"></script>

    <style>
        body {
            font-family: 'Tajawal', sans-serif;
            background-color: #060d1f;
            color: #f8fafc;
        }
        .bg-wave-gradient {
            background: radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.15), transparent 70%),
                        radial-gradient(circle at 100% 50%, rgba(13, 148, 136, 0.08), transparent 50%),
                        #060d1f;
        }
        .glass-panel {
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        [x-cloak] { display: none !important; }
    </style>
</head>
<body class="min-h-screen flex flex-col bg-wave-gradient selection:bg-cyan-500 selection:text-white" x-data="{ cartOpen: false }">

    <!-- شريط الإعلان العلوي -->
    <div class="bg-gradient-to-r from-cyan-900/60 via-teal-900/60 to-cyan-900/60 border-b border-cyan-500/20 py-2 text-center text-xs sm:text-sm font-medium text-cyan-200">
        <span>🌊 الشحن متاح لجميع محافظات مصر | شحن مجاني للطلبات فوق {{ $storeSettings->free_shipping_threshold ?? 2000 }} ج.م</span>
    </div>

    <!-- Header الهيدر -->
    <header class="sticky top-0 z-40 glass-panel border-b border-white/5">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <!-- الشعار -->
            <div class="flex items-center gap-8">
                <a href="{{ route('home') }}" class="flex items-center gap-2 group">
                    <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition">
                        <span class="text-white font-black text-lg">مـ</span>
                    </div>
                    <span class="text-2xl font-black tracking-tight text-white group-hover:text-cyan-400 transition">{{ $storeSettings->brand_name ?? 'مرج' }}</span>
                </a>

                <!-- روابط التصفح -->
                <nav class="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
                    <a href="{{ route('home') }}" class="hover:text-cyan-400 transition {{ request()->routeIs('home') ? 'text-cyan-400 font-bold' : '' }}">الرئيسية</a>
                    <a href="{{ route('products.index') }}" class="hover:text-cyan-400 transition {{ request()->routeIs('products.*') ? 'text-cyan-400 font-bold' : '' }}">الهوديز</a>
                    <a href="{{ route('lookbook') }}" class="hover:text-cyan-400 transition {{ request()->routeIs('lookbook') ? 'text-cyan-400 font-bold' : '' }}">اللوك بوك</a>
                    <a href="{{ route('track-order') }}" class="hover:text-cyan-400 transition {{ request()->routeIs('track-order') ? 'text-cyan-400 font-bold' : '' }}">تتبع طلبك</a>
                    <a href="{{ route('policies') }}" class="hover:text-cyan-400 transition {{ request()->routeIs('policies') ? 'text-cyan-400 font-bold' : '' }}">السياسات والشحن</a>
                </nav>
            </div>

            <!-- أزرار الإجراءات -->
            <div class="flex items-center gap-3">
                @auth
                    @if(auth()->user()->isAdmin() || auth()->user()->teamMember)
                        <a href="{{ route('admin.dashboard') }}" class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/20 transition">
                            <i data-lucide="shield" class="w-3.5 h-3.5"></i>
                            لوحة الإدارة
                        </a>
                    @endif
                    <a href="{{ route('account.index') }}" class="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition" title="حسابي">
                        <i data-lucide="user" class="w-5 h-5"></i>
                    </a>
                @else
                    <a href="{{ route('login') }}" class="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition" title="تسجيل الدخول">
                        <i data-lucide="user" class="w-5 h-5"></i>
                    </a>
                @endauth

                <!-- زر السلة -->
                <a href="{{ route('cart.index') }}" class="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition" title="سلة المشتريات">
                    <i data-lucide="shopping-bag" class="w-5 h-5"></i>
                    @if($cartItemsCount > 0)
                        <span class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center shadow-md shadow-cyan-500/30 animate-pulse">
                            {{ $cartItemsCount }}
                        </span>
                    @endif
                </a>
            </div>
        </div>
    </header>

    <!-- الإشعارات والتنبيهات -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-4">
        @if(session('success'))
            <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 text-sm animate-fade-in">
                <i data-lucide="check-circle" class="w-5 h-5 shrink-0"></i>
                <span>{{ session('success') }}</span>
            </div>
        @endif

        @if(session('error'))
            <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3 text-sm animate-fade-in">
                <i data-lucide="alert-circle" class="w-5 h-5 shrink-0"></i>
                <span>{{ session('error') }}</span>
            </div>
        @endif
    </div>

    <!-- محتوى الصفحة -->
    <main class="flex-grow">
        @yield('content')
    </main>

    <!-- الفوتر Footer -->
    <footer class="mt-20 border-t border-white/5 bg-slate-950/60 pb-20 md:pb-8 pt-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div class="space-y-4">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-600 flex items-center justify-center text-white font-black text-base">مـ</div>
                    <span class="text-xl font-black text-white">{{ $storeSettings->brand_name ?? 'مرج' }}</span>
                </div>
                <p class="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {{ $storeSettings->shipping_notice ?? 'هوديز قطنية فاخرة بقصات مريحة وتفاصيل مستوحاة من هدوء البحر وقوة الموج.' }}
                </p>
            </div>

            <div>
                <h4 class="text-sm font-bold text-white mb-4">روابط سريعة</h4>
                <ul class="space-y-2 text-xs sm:text-sm text-slate-400">
                    <li><a href="{{ route('products.index') }}" class="hover:text-cyan-400 transition">جميع الهوديز</a></li>
                    <li><a href="{{ route('lookbook') }}" class="hover:text-cyan-400 transition">تنسيقات اللوك بوك</a></li>
                    <li><a href="{{ route('track-order') }}" class="hover:text-cyan-400 transition">تتبع شحنتك</a></li>
                    <li><a href="{{ route('policies') }}" class="hover:text-cyan-400 transition">الشحن والاسترجاع</a></li>
                </ul>
            </div>

            <div>
                <h4 class="text-sm font-bold text-white mb-4">خدمة العملاء</h4>
                <p class="text-xs sm:text-sm text-slate-400 leading-relaxed mb-3">
                    يسعدنا تواصلكم عبر WhatsApp لأي استفسارات حول المقاسات أو متابعة الشحنات.
                </p>
                <a href="https://wa.me/201012345678" target="_blank" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition">
                    <i data-lucide="message-circle" class="w-4 h-4"></i>
                    تواصل عبر واتساب
                </a>
            </div>

            <div>
                <h4 class="text-sm font-bold text-white mb-4">طرق الدفع والشحن</h4>
                <div class="space-y-2 text-xs text-slate-400">
                    <div class="flex items-center gap-2"><i data-lucide="truck" class="w-4 h-4 text-cyan-400"></i> شحن سريع لكافة المحافظات</div>
                    <div class="flex items-center gap-2"><i data-lucide="banknote" class="w-4 h-4 text-emerald-400"></i> الدفع نقدًا عند الاستلام (COD)</div>
                    <div class="flex items-center gap-2"><i data-lucide="shield-check" class="w-4 h-4 text-teal-400"></i> استبدال واسترجاع مجاني 14 يومًا</div>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-white/5 text-center text-xs text-slate-500">
            © {{ date('Y') }} {{ $storeSettings->brand_name ?? 'مرج' }}. جميع الحقوق محفوظة.
        </div>
    </footer>

    <!-- شريط التنقل السفلي للهواتف Mobile Bottom Navigation -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-panel border-t border-white/10 px-4 py-2 flex items-center justify-around">
        <a href="{{ route('home') }}" class="flex flex-col items-center gap-1 text-xs {{ request()->routeIs('home') ? 'text-cyan-400 font-bold' : 'text-slate-400' }}">
            <i data-lucide="home" class="w-5 h-5"></i>
            <span>الرئيسية</span>
        </a>
        <a href="{{ route('products.index') }}" class="flex flex-col items-center gap-1 text-xs {{ request()->routeIs('products.*') ? 'text-cyan-400 font-bold' : 'text-slate-400' }}">
            <i data-lucide="shirt" class="w-5 h-5"></i>
            <span>المنتجات</span>
        </a>
        <a href="{{ route('cart.index') }}" class="flex flex-col items-center gap-1 text-xs relative {{ request()->routeIs('cart.*') ? 'text-cyan-400 font-bold' : 'text-slate-400' }}">
            <i data-lucide="shopping-bag" class="w-5 h-5"></i>
            <span>السلة</span>
            @if($cartItemsCount > 0)
                <span class="absolute -top-1 right-2 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-bold text-[10px] flex items-center justify-center">
                    {{ $cartItemsCount }}
                </span>
            @endif
        </a>
        <a href="{{ route('track-order') }}" class="flex flex-col items-center gap-1 text-xs {{ request()->routeIs('track-order') ? 'text-cyan-400 font-bold' : 'text-slate-400' }}">
            <i data-lucide="truck" class="w-5 h-5"></i>
            <span>تتبع</span>
        </a>
        <a href="{{ route('account.index') }}" class="flex flex-col items-center gap-1 text-xs {{ request()->routeIs('account.*') ? 'text-cyan-400 font-bold' : 'text-slate-400' }}">
            <i data-lucide="user" class="w-5 h-5"></i>
            <span>حسابي</span>
        </a>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
        });
    </script>
    @stack('scripts')
</body>
</html>
