<!DOCTYPE html>
<html lang="ar" dir="rtl" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'لوحة تحكم متجر مرج')</title>
    
    <!-- Meta & Fonts -->
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">

    <!-- Tailwind CSS (Play CDN) -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Tajawal', 'sans-serif'],
                    },
                    colors: {
                        marj: {
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

    <style>
        body {
            font-family: 'Tajawal', sans-serif;
            background-color: #060d1f;
            color: #f8fafc;
        }
        .glass-sidebar {
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(12px);
            border-left: 1px solid rgba(255, 255, 255, 0.08);
        }
        [x-cloak] { display: none !important; }
    </style>
</head>
<body class="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white" x-data="{ sidebarOpen: false }">

    <!-- القائمة الجانبية Sidebar -->
    <aside class="fixed inset-y-0 right-0 z-50 w-64 glass-sidebar flex flex-col transition-transform duration-300 lg:translate-x-0" :class="sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'">
        <!-- شعار الإدارة -->
        <div class="h-16 flex items-center justify-between px-6 border-b border-white/5">
            <a href="{{ route('admin.dashboard') }}" class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-600 flex items-center justify-center text-white font-black">مـ</div>
                <span class="text-lg font-black tracking-tight text-white">إدارة مرج</span>
            </a>
            <button @click="sidebarOpen = false" class="lg:hidden p-1 text-slate-400 hover:text-white">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>

        <!-- روابط لوحة التحكم -->
        <nav class="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto text-sm font-medium">
            <a href="{{ route('admin.dashboard') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition {{ request()->routeIs('admin.dashboard') ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5' }}">
                <i data-lucide="layout-dashboard" class="w-4 h-4"></i>
                نظرة عامة
            </a>

            <a href="{{ route('admin.orders.index') }}" class="flex items-center justify-between px-3.5 py-2.5 rounded-xl transition {{ request()->routeIs('admin.orders.*') ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5' }}">
                <div class="flex items-center gap-3">
                    <i data-lucide="shopping-cart" class="w-4 h-4"></i>
                    الطلبات
                </div>
            </a>

            <a href="{{ route('admin.products.index') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition {{ request()->routeIs('admin.products.*') ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5' }}">
                <i data-lucide="shirt" class="w-4 h-4"></i>
                المنتجات والـ SKUs
            </a>

            <a href="{{ route('admin.categories.index') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition {{ request()->routeIs('admin.categories.*') ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5' }}">
                <i data-lucide="folder-tree" class="w-4 h-4"></i>
                التصنيفات
            </a>

            <a href="{{ route('admin.coupons.index') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition {{ request()->routeIs('admin.coupons.*') ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5' }}">
                <i data-lucide="tag" class="w-4 h-4"></i>
                الكوبونات
            </a>

            <a href="{{ route('admin.reviews.index') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition {{ request()->routeIs('admin.reviews.*') ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5' }}">
                <i data-lucide="star" class="w-4 h-4"></i>
                المراجعات الموثقة
            </a>

            <a href="{{ route('admin.shipping.index') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition {{ request()->routeIs('admin.shipping.*') ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5' }}">
                <i data-lucide="truck" class="w-4 h-4"></i>
                شحن المحافظات
            </a>

            <a href="{{ route('admin.payments.index') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition {{ request()->routeIs('admin.payments.*') ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5' }}">
                <i data-lucide="credit-card" class="w-4 h-4"></i>
                طرق الدفع والمحافظ
            </a>

            <a href="{{ route('admin.analytics.index') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition {{ request()->routeIs('admin.analytics.*') ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5' }}">
                <i data-lucide="bar-chart-3" class="w-4 h-4"></i>
                التحليلات والمبيعات
            </a>

            <a href="{{ route('admin.lookbook.index') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition {{ request()->routeIs('admin.lookbook.*') ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5' }}">
                <i data-lucide="images" class="w-4 h-4"></i>
                اللوك بوك
            </a>

            <a href="{{ route('admin.settings.index') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition {{ request()->routeIs('admin.settings.*') ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5' }}">
                <i data-lucide="settings" class="w-4 h-4"></i>
                إعدادات المتجر
            </a>

            <a href="{{ route('admin.team.index') }}" class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition {{ request()->routeIs('admin.team.*') ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5' }}">
                <i data-lucide="users" class="w-4 h-4"></i>
                فريق العمل والصلاحيات
            </a>
        </nav>

        <!-- الفوتر الجانبي -->
        <div class="p-4 border-t border-white/5 space-y-2">
            <a href="{{ route('home') }}" target="_blank" class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition">
                <i data-lucide="external-link" class="w-4 h-4"></i>
                عرض المتجر الرئيسي
            </a>
            <form action="{{ route('logout') }}" method="POST">
                @csrf
                <button type="submit" class="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 transition">
                    <i data-lucide="log-out" class="w-4 h-4"></i>
                    تسجيل الخروج
                </button>
            </form>
        </div>
    </aside>

    <!-- المحتوى الرئيسي -->
    <div class="flex-1 flex flex-col min-w-0 lg:mr-64">
        <!-- شريط الرأس في الإدارة -->
        <header class="h-16 border-b border-white/5 bg-slate-950/80 backdrop-blur px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
            <div class="flex items-center gap-4">
                <button @click="sidebarOpen = true" class="lg:hidden p-2 text-slate-400 hover:text-white">
                    <i data-lucide="menu" class="w-5 h-5"></i>
                </button>
                <h1 class="text-base sm:text-lg font-bold text-white">@yield('page_title', 'لوحة الإدارة')</h1>
            </div>
            <div class="flex items-center gap-3">
                <span class="text-xs text-slate-400 hidden sm:inline">{{ auth()->user()->name }} ({{ auth()->user()->role }})</span>
            </div>
        </header>

        <!-- التنبيهات -->
        <div class="p-4 sm:p-8 space-y-6">
            @if(session('success'))
                <div class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
                    <i data-lucide="check-circle" class="w-5 h-5 shrink-0"></i>
                    <span>{{ session('success') }}</span>
                </div>
            @endif

            @if(session('error'))
                <div class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-center gap-2">
                    <i data-lucide="alert-circle" class="w-5 h-5 shrink-0"></i>
                    <span>{{ session('error') }}</span>
                </div>
            @endif

            @yield('content')
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();
        });
    </script>
    @stack('scripts')
</body>
</html>
